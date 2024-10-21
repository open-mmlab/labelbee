import React, { useState, useEffect, useContext, useMemo } from 'react';
import { prefix } from '@/constant';
import { Button, Empty } from 'antd';
import AnswerSort from './components/answerSort';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
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
  ISelectedTags,
  IConfigUpdate,
  ILLMMultiWheelToolConfig,
} from '@/components/LLMToolView/types';
import { useTranslation } from 'react-i18next';
import { formatSort, getCurrentResultFromResultList, getRenderDataByResult } from '../utils/data';
import emptySvg from '@/assets/annotation/LLMTool/empty.svg';
import TextInputBox from './components/textInputBox';
import OverallTagList from '@/components/tagList/components/overall';
import StepUtils from '@/utils/StepUtils';

interface IProps {
  annotation?: any;
  dispatch: any;
  checkMode?: boolean;
}
export interface IAnnotationResult {
  newSort?: IAnswerSort[][];
  waitSorts?: IWaitAnswerSort[];
  answerList?: IAnswerList[];
  textAttribute?: ITextList[];
  tagList?: ISelectedTags;
}

const EKeyCode = cKeyCode.default;
const sidebarCls = `${prefix}-sidebar`;

export const EmptyConfig = () => {
  const { t } = useTranslation();
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
};

export const getLLMIsNoConfig = (LLMConfig?: ILLMMultiWheelToolConfig | ILLMToolConfig) => {
  const {
    indicatorScore = [],
    indicatorDetermine = [],
    text = [],
    enableSort,
    isTextEdit,
    tagInputListConfigurable,
    // @ts-ignore
    dialogSort = false,
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
    isTextEdit ||
    tagInputListConfigurable ||
    dialogSort
  );
  return noConfig;
};

const LLMToolSidebar = (props: IProps) => {
  const { annotation, dispatch, checkMode } = props;
  const { imgIndex, imgList, stepList, step, skipBeforePageTurning } = annotation;
  const { modelAPIResponse, setModelAPIResponse } = useContext(LLMContext);
  const { t } = useTranslation();
  const currentData = imgList[imgIndex] ?? {};
  const basicInfo = jsonParser(currentData?.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const [LLMConfig, setLLMConfig] = useState<ILLMToolConfig>();
  const [valid, setValid] = useState(true);

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
    onSetValid();
    initResult();
  }, [imgIndex, LLMConfig, currentData?.id]);

  const clearResult = () => {
    initResult(currentData?.questionList);
  };

  const onSetValid = (newValid?: boolean) => {
    const valid = newValid ?? basicInfo.valid;
    if (isBoolean(valid)) {
      setValid(valid);
      toolInstanceRef.current.valid = valid;
      toolInstanceRef.current?.emit('validUpdated');
    }
  };

  const initResult = (initData?: ILLMBoxResult) => {
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    const result: ILLMBoxResult = getCurrentResultFromResultList(
      currentData?.result,
      currentStepInfo.step,
    );

    let sourceData = currentData?.questionList;
    if (result?.answerList && toolInstanceRef.current.valid) {
      sourceData = result;
    }
    if (initData) {
      sourceData = initData;
      result.sort = [];
    }

    const annotations = getRenderDataByResult(LLMConfig, sourceData);
    setAnnotationResult({ ...annotations });
    setModelAPIResponse([]);
  };

  useEffect(() => {
    setExportData();
    setNewAnswerList(annotationResult?.answerList || []);
  }, [annotationResult, modelAPIResponse, valid]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const setExportData = () => {
    const { newSort, answerList, textAttribute, tagList } = annotationResult;
    const sort = formatSort(newSort || []);
    const result = {
      answerList,
      sort,
      tagList,
      textAttribute,
      id: currentData?.id,
      modelAPIResponse,
    };
    toolInstanceRef.current.exportData = () => {
      return [[result], { valid }];
    };

    toolInstanceRef.current.currentPageResult = {
      ...result,
      toolName: EToolName.LLM,
      valid,
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
        // text edit
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

  const isNoConfig = useMemo(() => {
    return getLLMIsNoConfig(LLMConfig);
  }, [LLMConfig]);

  if (isNoConfig) {
    return <EmptyConfig />;
  }

  const {
    indicatorScore = [],
    indicatorDetermine = [],
    enableSort,
    isTextEdit,
    inputList = [],
    tagInputListConfigurable,
  } = LLMConfig || {};

  const hasTagList = tagInputListConfigurable && inputList.filter((i) => !i.isOverall)?.length > 0;
  const showAnwerList =
    indicatorDetermine?.length > 0 || indicatorScore?.length > 0 || isTextEdit || hasTagList;
  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        <div style={{ fontSize: '18px', fontWeight: 500, padding: '0px 16px', marginTop: '16px' }}>
          {t('GlobalAnnotation')}
        </div>

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

        {tagInputListConfigurable && inputList.length && (
          <OverallTagList
            inputList={inputList}
            selectedTags={annotationResult?.tagList || {}}
            updateValue={(changeValue) => {
              const { key, value } = changeValue;
              const originData = annotationResult?.tagList;

              setAnnotationResult({
                ...annotationResult,
                tagList: { ...originData, [key]: value },
              });
            }}
            disabeledAll={disabeledAll}
          />
        )}
        {LLMConfig?.text && (
          <div style={{ padding: '0px 16px', marginTop: '16px' }}>
            <TextInputBox
              textAttribute={annotationResult?.textAttribute || []}
              textConfig={LLMConfig?.text && isArray(LLMConfig.text) ? LLMConfig?.text : []}
              setText={(v) => setAnnotationResult({ ...annotationResult, textAttribute: v })}
              disabeledAll={disabeledAll}
            />
          </div>
        )}

        <div style={{ fontSize: '18px', fontWeight: 500, padding: '0px 16px', marginTop: '16px' }}>
          {t('QualifiedAnnotation')}
        </div>
        <div>
          {showAnwerList && (
            <AnswerList
              list={annotationResult?.answerList || []}
              LLMConfig={LLMConfig}
              updateValue={updateValue}
              disabeledAll={disabeledAll}
            />
          )}
        </div>
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
