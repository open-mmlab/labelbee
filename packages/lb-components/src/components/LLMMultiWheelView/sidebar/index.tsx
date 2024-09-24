/*
 * @file LLMMultiWheelView sidebar
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @createdate 2024-9-24
 */

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { LabelBeeContext, LLMContext } from '@/store/ctx';
import { connect } from 'react-redux';

import { AppState } from '@/store';
import { prefix } from '@/constant';
import {
  ILLMMultiWheelToolConfig,
  IAnswerList,
  IConfigUpdate,
} from '@/components/LLMToolView/types';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import ModelSort from '@/components/LLMToolView/sidebar/components/modelSort';
import ModelAnswerSort from '@/components/LLMToolView/sidebar/components/modelAnswerSort';
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
  };

  const onSetValid = (newValid?: boolean) => {
    const valid = newValid ?? basicInfo.valid;
    if (isBoolean(valid)) {
      setValid(valid);
      toolInstanceRef.current.valid = valid;
      toolInstanceRef.current?.emit('validUpdated');
    }
  };

  const initResult = (initData?: any) => {
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    const result: any = getCurrentResultFromResultList(currentData?.result, currentStepInfo.step);

    let sourceData = currentData?.questionList?.textList;

    if (result?.modelData?.length && toolInstanceRef.current.valid) {
      sourceData = result?.modelData;
    }
    if (initData) {
      sourceData = initData;
      result.sort = [];
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

    setAnnotationResultMap(tmpMap);
  };

  useEffect(() => {
    setExportData();
  }, [annotationResultMap, valid]);

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

    const result = { modelData };
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

        {/* 全局模型排序 */}
        {dialogSort && (
          <ModelSort
            setSort={() => {}}
            modelList={dialogSort ? modelList ?? [] : []}
            title={t('SortConversationQuality')}
            prefixId='model'
          />
        )}

        {/* 文本输入 */}
        {LLMConfig?.text && (
          <div style={{ padding: '0px 16px', marginTop: '16px' }}>
            <TextInputBox
              textAttribute={[]}
              textConfig={LLMConfig?.text && isArray(LLMConfig.text) ? LLMConfig?.text : []}
              setText={(v) => {}}
              disabeledAll={disabeledAll}
            />
          </div>
        )}
        {/* 答案模型排序 */}
        <ModelAnswerSort
          maxAnswerList={[
            { id: 'A1', answer: '1' },
            { id: 'A2', answer: '2' },
            { id: 'A3', answer: '3' },
          ]}
          modelData={[
            {
              id: 1,
              answerList: [
                { id: 'A1', answer: '11' },
                { id: 'A2', answer: '21' },
              ],
            },
            {
              id: 2,
              answerList: [
                { id: 'A1', answer: '1' },
                { id: 'A2', answer: '2' },
                { id: 'A3', answer: '3' },
              ],
            },
            {
              id: 3,
              answerList: [
                { id: 'A1', answer: '13' },
                { id: 'A2', answer: '23' },
              ],
            },
          ]}
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
