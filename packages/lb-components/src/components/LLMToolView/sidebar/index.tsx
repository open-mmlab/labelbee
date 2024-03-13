import React, { useState, useEffect, useContext } from 'react';
import { prefix } from '@/constant';
import { Button, Empty } from 'antd';
import AnswerSort from './components/answerSort';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { isBoolean, isNumber, isObject, isString } from 'lodash';
import AnswerList from './components/answerList';
import { LabelBeeContext, LLMContext } from '@/store/ctx';
import { jsonParser } from '@/utils';
import { getStepConfig } from '@/store/annotation/reducer';
import { useCustomToolInstance } from '@/hooks/annotation';
import { PageForward } from '@/store/annotation/actionCreators';
import { EToolName, cKeyCode } from '@labelbee/lb-annotation';
import {
  IWaitAnswerSort,
  IAnswerSort,
  ILLMBoxResult,
  ILLMToolConfig,
  IAnswerList,
  IndicatorScore,
  IndicatorDetermine,
  ITextList,
} from '@/components/LLMToolView/types';
import { useTranslation } from 'react-i18next';
import { formatSort, getCurrentResultFromResultList, getRenderDataByResult } from '../utils/data';
import emptySvg from '@/assets/annotation/LLMTool/empty.svg';
import TextInputBox from './components/textInputBox';

interface IProps {
  annotation?: any;
  dispatch: any;
  checkMode?: boolean;
}

interface IConfigUpdate {
  order: number;
  value: number | string | { key: string; value?: number | boolean };
  key?: string;
}
interface IAnnotationResult {
  newSort?: IAnswerSort[][];
  waitSorts?: IWaitAnswerSort[];
  answerList?: IAnswerList[];
  textAttribute?: ITextList[];
}

const EKeyCode = cKeyCode.default;
const sidebarCls = `${prefix}-sidebar`;

const LLMToolSidebar: React.FC<IProps> = (props) => {
  const { annotation, dispatch, checkMode } = props;
  const { imgIndex, imgList, stepList, step, skipBeforePageTurning } = annotation;
  const { modelAPIResponse, setModelAPIResponse } = useContext(LLMContext);
  const { t } = useTranslation();
  const currentData = imgList[imgIndex] ?? {};
  const basicInfo = jsonParser(currentData?.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const [LLMConfig, setLLMConfig] = useState<ILLMToolConfig>();
  const [, forceRender] = useState(0);

  const { setNewAnswerList } = useContext(LLMContext);
  const [annotationResult, setAnnotationResult] = useState<IAnnotationResult>({});

  const disabeledAll = !toolInstanceRef.current.valid || checkMode;

  useEffect(() => {
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [step, JSON.stringify(stepList)]);

  useEffect(() => {
    if (!currentData || imgIndex === -1) {
      return;
    }
    toolInstanceRef.current.setValid = onSetValid;
    toolInstanceRef.current.clearResult = clearResult;
    initResult();
  }, [imgIndex, LLMConfig]);

  const clearResult = () => {
    initResult(currentData?.questionList);
  };

  const onSetValid = (valid?: boolean) => {
    if (isBoolean(valid)) {
      toolInstanceRef.current.valid = valid;
      toolInstanceRef.current?.emit('validUpdated');
      forceRender((s) => s + 1);
    }
  };

  const initResult = (initData?: ILLMBoxResult) => {
    const result: ILLMBoxResult = getCurrentResultFromResultList(currentData?.result);
    let sourceData = currentData?.questionList;
    if (result?.answerList && toolInstanceRef.current.valid) {
      sourceData = result;
    }
    if (initData) {
      sourceData = initData;
      result.sort = [];
      result.valid = toolInstanceRef.current.valid ?? true;
    }
    toolInstanceRef.current.valid = result.valid;
    toolInstanceRef.current?.emit('validUpdated');

    const annotations = getRenderDataByResult(LLMConfig, sourceData);
    setAnnotationResult({ ...annotations });
    setModelAPIResponse([]);
  };

  useEffect(() => {
    const { newSort, answerList, textAttribute } = annotationResult;
    const sort = formatSort(newSort || []);
    const result = {
      answerList,
      sort,
      textAttribute,
      id: currentData?.id,
      modelAPIResponse,
      valid: toolInstanceRef.current.valid,
    };

    toolInstanceRef.current.exportData = () => {
      return [[result], { valid: toolInstanceRef.current.valid }];
    };

    toolInstanceRef.current.currentPageResult = { ...result, toolName: EToolName.LLM };
    setNewAnswerList(answerList || []);
  }, [annotationResult, modelAPIResponse]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    initToolInstance();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const initToolInstance = () => {
    toolInstanceRef.current.emit = (event: string) => {
      const listener = toolInstanceRef.current.fns.get(event);
      if (listener) {
        listener.forEach((fn: any) => {
          if (fn) {
            fn?.();
          }
        });
      }
    };
    toolInstanceRef.current.fns = new Map();
    toolInstanceRef.current.singleOn = (event: string, func: () => void) => {
      toolInstanceRef.current.fns.set(event, [func]);
    };

    toolInstanceRef.current.on = (event: string, func: () => void) => {
      toolInstanceRef.current.singleOn(event, func);
    };

    toolInstanceRef.current.unbindAll = (eventName: string) => {
      toolInstanceRef.current.fns.delete(eventName);
    };
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.keyCode === EKeyCode.Enter) {
      if (skipBeforePageTurning) {
        skipBeforePageTurning(() => dispatch(PageForward()));
        return;
      }
      dispatch(PageForward());
    }
  };

  const updateValue = ({ order, value, key }: IConfigUpdate) => {
    const { answerList } = annotationResult;
    const newList = answerList?.map((i: IAnswerList) => {
      if (i?.order === order) {
        // Text Editor
        if (key === 'textEdit' && isString(value)) {
          return { ...i, newAnswer: value };
        }
        if (isNumber(value)) {
          return { ...i, score: value };
        }
        if (isObject(value) && key) {
          const obj = { [value?.key]: value.value };
          // @ts-ignore
          const originData = i[key] ?? {};
          return { ...i, [key]: { ...originData, ...obj } };
        }
      }
      return i;
    });
    setAnnotationResult({ ...annotationResult, answerList: newList || [] });
  };

  const isNoConfig = () => {
    const {
      indicatorScore = [],
      indicatorDetermine = [],
      text = [],
      enableSort,
      isTextEdit,
    } = LLMConfig || {};
    const hasIndicatorScore =
      indicatorScore?.filter((i: IndicatorScore) => i.label && i.value && i.score)?.length > 0;

    const hasIndicatorDetermine =
      indicatorDetermine?.filter((i: IndicatorDetermine) => i.label && i.value)?.length > 0;
    const hasText = text?.length > 0;
    const noConfig = !(
      hasIndicatorScore ||
      hasIndicatorDetermine ||
      hasText ||
      enableSort ||
      isTextEdit
    );
    return noConfig;
  };

  if (isNoConfig()) {
    return (
      <div className={`${sidebarCls}`}>
        <div
          className={`${sidebarCls}__content`}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Empty
            description={<span style={{ color: '#ccc' }}>{t('NoScoringScale')}</span>}
            imageStyle={{
              width: 200,
              height: 200,
            }}
            image={<img src={emptySvg} />}
          />
        </div>
      </div>
    );
  }
  const { indicatorScore = [], indicatorDetermine = [], enableSort, isTextEdit } = LLMConfig || {};
  const answerList = annotationResult?.answerList || [];
  const showAnwerList =
    answerList.length > 0 &&
    (indicatorDetermine?.length > 0 || indicatorScore?.length > 0 || isTextEdit);
  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        {enableSort && (
          <AnswerSort
            waitSortList={annotationResult?.waitSorts || []}
            sortList={annotationResult?.newSort || []}
            setSortList={(value) => {
              setAnnotationResult({ ...annotationResult, newSort: value });
            }}
            disabeledAll={disabeledAll}
          />
        )}
        {showAnwerList && (
          <AnswerList
            list={annotationResult?.answerList || []}
            LLMConfig={LLMConfig}
            updateValue={updateValue}
            disabeledAll={disabeledAll}
          />
        )}

        {LLMConfig?.text && (
          <div style={{ padding: '0px 16px', marginTop: '16px' }}>
            <TextInputBox
              textAttribute={annotationResult?.textAttribute || []}
              LLMConfig={LLMConfig}
              setText={(v) => setAnnotationResult({ ...annotationResult, textAttribute: v })}
              disabeledAll={disabeledAll}
            />
          </div>
        )}
      </div>
      <div style={{ margin: '24px 16px', display: 'flex' }}>
        {imgList?.length - 1 !== imgIndex && (
          <Button
            type='primary'
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              if (skipBeforePageTurning) {
                skipBeforePageTurning(() => dispatch(PageForward()));
                return;
              }
              dispatch(PageForward());
            }}
            disabled={disabeledAll}
          >
            {t('Save')}
          </Button>
        )}
      </div>
    </div>
  );
};
const mapStateToProps = (state: AppState) => {
  return {
    annotation: state.annotation,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(LLMToolSidebar);
