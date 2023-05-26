import React, { useState, useContext, useEffect } from 'react';
import { prefix } from '@/constant';
import { Button, Input } from 'antd';
import AnswerSort from './components/AnswerSort';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { isNumber, isObject } from 'lodash';
import AnswerList from './components/answerList';
import { LabelBeeContext } from '@/store/ctx';
import { jsonParser } from '@/utils';
import { getStepConfig } from '@/store/annotation/reducer';
import { useCustomToolInstance } from '@/hooks/annotation';
import { PageForward } from '@/store/annotation/actionCreators';
import { EToolName } from '@labelbee/lb-annotation';
import { IAnswerList } from '@/components/LLMToolView/types';
import { useTranslation } from 'react-i18next';

interface IProps {
  annotation?: any;
  dispatch: any;
  setHoverKey: (value: number) => void;
  checkMode?: boolean;
}

interface IConfigUpdate {
  order: number;
  value: number | { key: string; value?: number | boolean };
  key?: string;
}

export interface IIndicatorScore {
  label: number;
  value: number;
  score: number;
  text?: string;
}

const { TextArea } = Input;
const sidebarCls = `${prefix}-sidebar`;
const contentBoxCls = `${prefix}-LLMSidebar-contentBox`;

const Sidebar: React.FC<IProps> = (props) => {
  const { annotation, setHoverKey, dispatch, checkMode } = props;
  const { imgIndex, imgList, stepList, step, skipBeforePageTurning } = annotation;
  const { t } = useTranslation();
  const currentData = imgList[imgIndex] ?? {};
  const basicInfo = jsonParser(currentData?.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const [sortList, setSortList] = useState<any[]>([]);
  const [LLMConfig, setLLMConfig] = useState({});
  const [answerList, setAnswerList] = useState<IAnswerList[]>([]);
  const [text, setText] = useState('');
  const [waitSortList, setWaitSortList] = useState<any[]>([]);

  useEffect(() => {
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [stepList, step]);

  useEffect(() => {
    if (!currentData) {
      return;
    }
    const result = getBoxParamsFromResultList(currentData?.result);
    let qaData = result?.answerList ? result : currentData?.questionList;
    if (qaData?.answerList) {
      getWaitSortList(qaData.answerList);
      setAnswerList(qaData.answerList || []);
    }
    setText(result?.textAttribute);
  }, [imgIndex]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      const sort = formatSort(sortList);
      const result = [{ answerList, sort, textAttribute: text, id: currentData?.id }];
      return [result, {}];
    };
    const sort = formatSort(sortList);
    const result = {
      answerList,
      sort,
      textAttribute: text,
      id: currentData?.id,
      toolName: EToolName.LLM,
    };

    toolInstanceRef.current.currentPageResult = result;
  }, [answerList, sortList, text]);

  const getWaitSortList = (answerList: any) => {
    setSortList([]);
    if (answerList?.length > 0) {
      let waitSorts: any = [];
      let newSort: any = [];
      // 将[[1],[2,3]]格式转成[[{ title: 1, id: 1 }],[{...},{...}]]
      const result = getBoxParamsFromResultList(currentData?.result);
      const currentResult = result?.length > 0 ? result[0] : result;
      if (currentResult?.sort?.length > 0) {
        newSort = currentResult.sort.reduce((i: any, key: any) => {
          let tagColumn = [{ title: key[0], id: key[0] }];
          if (key.length > 1) {
            tagColumn = key.map((item: any) => ({ title: item, id: item }));
          }
          return [...i, tagColumn];
        }, []);
        setSortList(newSort);
      }
      // 待排序容器需要过滤已排序容器存在的答案
      answerList.forEach((i: any) => {
        const existed = newSort.some((sortItem: any) => {
          if (sortItem.length > 1) {
            return sortItem.some((v: any) => v.id === i.order);
          }
          return sortItem[0].id === i.order;
        });
        if (existed) {
          return;
        }
        waitSorts.push({ title: i.order, id: i.order });
      });
      setWaitSortList(waitSorts);
    }
  };

  const getBoxParamsFromResultList = (result: string) => {
    const data = jsonParser(result);
    const DEFAULT_STEP = `step_1`;
    const dataList = data?.[DEFAULT_STEP]?.result[0] ?? {};
    return dataList;
  };

  const formatSort = (sortList: any) => {
    const newList = sortList.reduce((list: any, key: any) => {
      let tagColumn = key;
      if (key.length > 1) {
        tagColumn = key.map((i: { id: number; title: number | string }) => i.id);
      } else {
        tagColumn = [key[0].id];
      }
      return [...list, tagColumn];
    }, []);
    return newList;
  };

  const unpdateValue = ({ order, value, key }: IConfigUpdate) => {
    const newList = answerList?.map((i: any, listIndex) => {
      if (i?.order === order) {
        if (isNumber(value)) {
          return { ...i, score: value };
        }
        if (isObject(value) && key) {
          const obj = { [value?.key]: value.value };
          return { ...i, [key]: { ...i[key], ...obj } };
        }
      }
      return i;
    });

    setAnswerList(newList);
  };

  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        <div style={{ padding: '0px 16px' }}>
          {answerList.length > 0 && LLMConfig && (
            <AnswerList
              list={answerList}
              LLMConfig={LLMConfig}
              setHoverKey={setHoverKey}
              unpdateValue={unpdateValue}
              checkMode={checkMode}
            />
          )}
          {LLMConfig?.enableSort && (
            <AnswerSort
              waitSortList={waitSortList}
              sortList={sortList}
              setSortList={setSortList}
              checkMode={checkMode}
            />
          )}

          {LLMConfig?.text && (
            <div style={{ padding: '0px 16px', marginBottom: '16px' }}>
              <div className={`${contentBoxCls}__title`}>{t('AdditionalContent')}</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextArea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  maxLength={300}
                  disabled={checkMode}
                />
              </div>
            </div>
          )}
          <div style={{ margin: '24px 16px', display: 'flex' }}>
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
              disabled={checkMode}
            >
              {t('Submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state: AppState) => {
  return {
    annotation: state.annotation,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(Sidebar);
