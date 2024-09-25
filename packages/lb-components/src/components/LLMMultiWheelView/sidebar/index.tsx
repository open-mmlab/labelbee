/*
 * @file LLMMultiWheelView sidebar
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @createdate 2024-9-24
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LabelBeeContext } from '@/store/ctx';
import { connect } from 'react-redux';

import { AppState } from '@/store';
import { prefix } from '@/constant';
import {
  ILLMMultiWheelToolConfig,
  IAnswerList,
  IConfigUpdate,
  IAnswerSort,
  IWaitAnswerSort,
} from '@/components/LLMToolView/types';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import ModelAnswerSort, {
  getSorts,
} from '@/components/LLMToolView/sidebar/components/modelAnswerSort';
import { useTranslation } from 'react-i18next';
import { useCustomToolInstance } from '@/hooks/annotation';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import { PageForward } from '@/store/annotation/actionCreators';
import { cKeyCode, EToolName } from '@labelbee/lb-annotation';
import { EmptyConfig, getLLMIsNoConfig, IAnnotationResult } from '@/components/LLMToolView/sidebar';
import TextInputBox from '@/components/LLMToolView/sidebar/components/textInputBox';
import { Button } from 'antd';
import AnswerList from '@/components/LLMToolView/sidebar/components/answerList';
import useLLMMultiWheelStore from '@/store/LLMMultiWheel';
import StepUtils from '@/utils/StepUtils';
import {
  getCurrentResultFromResultList,
  getRenderDataByResult,
} from '@/components/LLMToolView/utils/data';
import { useMemoizedFn } from 'ahooks';
import { ITextList } from '../types';
import AnswerSort from '@/components/LLMToolView/sidebar/components/answerSort';

const EKeyCode = cKeyCode.default;

const sidebarCls = `${prefix}-sidebar`;

interface IProps {
  annotation?: any;
  dispatch: any;
  checkMode?: boolean;
}

interface ILLMAnnotationResultMap {
  [id: string | number]: IAnnotationResult & {
    id: string | number;
    order: string;
  };
}

interface IGlobalResult {
  sort: Array<number[]>;
  answerSort: { [key: string]: number[] };
  textAttribute: ITextList[];
}

const initGlobalResult = {
  sort: [],
  answerSort: {},
  textAttribute: [],
};

const LLMMultiWheelToolSidebar = (props: IProps) => {
  const { annotation, dispatch, checkMode } = props;
  const { imgIndex, imgList, stepList, step, skipBeforePageTurning } = annotation;
  const [LLMConfig, setLLMConfig] = useState<ILLMMultiWheelToolConfig>();
  const { t } = useTranslation();
  const currentData = imgList[imgIndex] ?? {};
  const basicInfo = jsonParser(currentData?.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const [valid, setValid] = useState(true);
  const [annotationResultMap, setAnnotationResultMap] = useState<ILLMAnnotationResultMap>({});
  const { selectedID } = useLLMMultiWheelStore();
  const [globalResult, setGlobalResult] = useState<IGlobalResult>(initGlobalResult);
  const answerSortRef = useRef<any>();
  const sortRef = useRef<any>();
  const [sortData, setSortData] = useState<{
    newSort?: IAnswerSort[][];
    waitSorts?: IWaitAnswerSort[];
  }>({});

  const currentLLMAnnotationResult = useMemo(() => {
    return annotationResultMap[selectedID];
  }, [selectedID, annotationResultMap]);

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
    initResult(currentData?.questionList?.textList);
    if (answerSortRef.current?.clearValue) {
      answerSortRef.current?.clearValue();
    }
    const { waitSorts } = getSorts({
      selectedSort: getCurrentResult()?.sort ?? [],
      initSelected: [],
      modelList: dialogSort ? modelList ?? [] : [],
    });
    setSortData({ ...sortData, waitSorts, newSort: [] });
  };

  const onSetValid = (newValid?: boolean) => {
    const valid = newValid ?? basicInfo.valid;
    if (isBoolean(valid)) {
      setValid(valid);
      toolInstanceRef.current.valid = valid;
      toolInstanceRef.current?.emit('validUpdated');
    }
  };

  const getCurrentResult = () => {
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    return getCurrentResultFromResultList(currentData?.result, currentStepInfo.step);
  };

  const initResult = (initData?: any) => {
    const result: any = getCurrentResult();

    let sourceData = currentData?.questionList?.textList;

    if (result?.modelData?.length && toolInstanceRef.current.valid) {
      sourceData = result?.modelData;
    }
    if (initData) {
      sourceData = initData;
      result.sort = [];
      result.textAttribute = [];
      result.answerSort = [];
    }

    let tmpMap: ILLMAnnotationResultMap = {};
    sourceData?.forEach((item: any, modelIndex: number) => {
      const data = getRenderDataByResult(LLMConfig, {
        ...item,
        answerList: item?.answerList?.map((answer: any, index: number) => {
          return {
            ...answer,
            order: `${index + 1}`,
          };
        }),
      });
      tmpMap[item.id] = {
        ...data,
        order: `${modelIndex + 1}`,
        id: item.id,
      };
    });
    const { waitSorts, newSort } = getSorts({
      selectedSort: getCurrentResult()?.sort ?? [],
      modelList: dialogSort ? modelList ?? [] : [],
    });
    setSortData({ waitSorts, newSort });

    setGlobalResult({
      sort: result?.sort ?? [],
      textAttribute: result?.textAttribute ?? [],
      answerSort: result?.answerSort ?? [],
    });
    setAnnotationResultMap(tmpMap);
  };

  useEffect(() => {
    setExportData();
  }, [annotationResultMap, valid, globalResult]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const setExportData = useMemoizedFn(() => {
    const modelData = currentData?.questionList?.textList?.map((item: any) => {
      const nextValue = annotationResultMap[item.id] ?? {};
      return {
        id: item.id,
        answerList: nextValue.answerList,
      };
    });

    const result = { ...globalResult, modelData };
    toolInstanceRef.current.exportData = () => {
      return [[result], { valid }];
    };
    toolInstanceRef.current.currentPageResult = {
      ...result,
      toolName: EToolName.LLMMultiWheel,
      valid,
    };
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.keyCode === EKeyCode.Enter) {
      if (skipBeforePageTurning) {
        skipBeforePageTurning(() => dispatch(PageForward()));
        return;
      }
      dispatch(PageForward());
    }
  };

  const updateValue = useMemoizedFn(({ order, value, key }: IConfigUpdate) => {
    const { answerList } = currentLLMAnnotationResult;
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

    setAnnotationResultMap((prev) => {
      return {
        ...prev,
        [selectedID]: {
          ...currentLLMAnnotationResult,
          answerList: newList,
        },
      };
    });
  });

  // Used to update global results
  const updateGlobalValue = (key: string, value: any) => {
    setGlobalResult((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const {
    indicatorScore = [],
    indicatorDetermine = [],
    isTextEdit,
    dialogSort = false,
    inputList = [],
    tagInputListConfigurable,
  } = LLMConfig || {};

  const modelList = useMemo(() => {
    if (!dialogSort) {
      return [];
    }

    return (
      currentData?.questionList?.textList?.map((item: any, index: number) => {
        return {
          ...item,
          title: `${index + 1}`,
        };
      }) ?? []
    );
  }, [currentData, dialogSort]);

  const isNoConfig = useMemo(() => {
    return getLLMIsNoConfig(LLMConfig);
  }, [LLMConfig]);

  if (isNoConfig) {
    return <EmptyConfig />;
  }

  const hasTagList = tagInputListConfigurable && inputList.filter((i) => !i.isOverall)?.length > 0;
  const showAnwerList =
    indicatorDetermine?.length > 0 || indicatorScore?.length > 0 || isTextEdit || hasTagList;

  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        <div style={{ fontSize: '18px', fontWeight: 500, padding: '0px 16px', marginTop: '16px' }}>
          {t('GlobalAnnotation')}
        </div>
        {/* Global Model sort */}
        <AnswerSort
          waitSortList={sortData?.waitSorts || []}
          sortList={sortData?.newSort || []}
          setSortList={(value) => {
            const sort = value.map((i) => i.map((item) => item.id));
            updateGlobalValue('sort', sort);
            setSortData({ ...sortData, newSort: value });
          }}
          disabeledAll={disabeledAll}
          title={t('SortConversationQuality')}
          prefixId='model'
        />

        {/* Global text input */}
        {LLMConfig?.text && (
          <div style={{ padding: '0px 16px', marginTop: '16px' }}>
            <TextInputBox
              textAttribute={globalResult?.textAttribute ?? []}
              textConfig={LLMConfig?.text && isArray(LLMConfig.text) ? LLMConfig?.text : []}
              setText={(v) => updateGlobalValue('textAttribute', v)}
              disabeledAll={disabeledAll}
            />
          </div>
        )}
        {/* Answer Model sort */}
        <ModelAnswerSort
          modelData={currentData?.questionList?.textList ?? []}
          selectedAnswerSort={(v) => updateGlobalValue('answerSort', v)}
          selectedSort={getCurrentResult()?.answerSort ?? []}
          ref={answerSortRef}
          disabeledAll={disabeledAll}
        />
        {currentLLMAnnotationResult && (
          <>
            <div
              style={{ fontSize: '18px', fontWeight: 500, padding: '0px 16px', marginTop: '16px' }}
            >
              {t('QualifiedAnnotation')}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button type='primary' danger>
                正在标注
              </Button>
              <div
                style={{
                  padding: 16,
                }}
              >
                组：{currentLLMAnnotationResult.order}
              </div>
            </div>
            <div>
              {showAnwerList && (
                <AnswerList
                  list={currentLLMAnnotationResult?.answerList || []}
                  LLMConfig={LLMConfig}
                  updateValue={updateValue}
                  disabeledAll={disabeledAll}
                />
              )}
            </div>
          </>
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

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  LLMMultiWheelToolSidebar,
);
