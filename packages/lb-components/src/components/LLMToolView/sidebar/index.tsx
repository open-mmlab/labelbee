import React, { useState, useEffect } from 'react';
import { prefix } from '@/constant';
import { Button, Empty } from 'antd';
import AnswerSort from './components/answerSort';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { isNumber, isObject } from 'lodash';
import AnswerList from './components/answerList';
import { LabelBeeContext } from '@/store/ctx';
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
import { formatSort, getCurrentResultFromResultList } from '../utils/data';
import emptySvg from '@/assets/annotation/LLMTool/empty.svg';
import TextInputBox from './components/textInputBox';

interface IProps {
  annotation?: any;
  dispatch: any;
  checkMode?: boolean;
}

interface IConfigUpdate {
  order: number;
  value: number | { key: string; value?: number | boolean };
  key?: string;
}
const EKeyCode = cKeyCode.default;
const sidebarCls = `${prefix}-sidebar`;

const LLMToolSidebar: React.FC<IProps> = (props) => {
  const { annotation, dispatch, checkMode } = props;
  const { imgIndex, imgList, stepList, step, skipBeforePageTurning } = annotation;
  const { t } = useTranslation();
  const currentData = imgList[imgIndex] ?? {};
  const basicInfo = jsonParser(currentData?.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const [LLMConfig, setLLMConfig] = useState<ILLMToolConfig>({});
  const [answerList, setAnswerList] = useState<IAnswerList[]>([]);
  const [text, setText] = useState<ITextList[] | undefined>(undefined);
  const [sortList, setSortList] = useState<IAnswerSort[][]>([]);
  const [waitSortList, setWaitSortList] = useState<IWaitAnswerSort[]>([]);

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

    const result: ILLMBoxResult = getCurrentResultFromResultList(currentData?.result);
    let qaData = result?.answerList ? result : currentData?.questionList;
    if (qaData?.answerList) {
      getWaitSortList(qaData.answerList);
      setAnswerList(qaData.answerList || []);
    }

    setText(result?.textAttribute);
  }, [imgIndex, currentData]);

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

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.keyCode === EKeyCode.Enter) {
      if (skipBeforePageTurning) {
        skipBeforePageTurning(() => dispatch(PageForward()));
        return;
      }
      dispatch(PageForward());
    }
  };

  const getWaitSortList = (answerList: IAnswerList[]) => {
    let waitSorts: IWaitAnswerSort[] = [];
    let newSort: IAnswerSort[][] = [];
    if (answerList?.length > 0) {
      // 将[[1],[2,3]]格式转成[[{ title: 1, id: 1 }],[{...},{...}]]
      const result = getCurrentResultFromResultList(currentData?.result);
      const currentResult = result?.length > 0 ? result[0] : result;
      if (currentResult?.sort?.length > 0) {
        newSort = currentResult.sort.reduce((i: IWaitAnswerSort[][], key: number[]) => {
          let tagColumn = [{ title: key[0], id: key[0] }];
          if (key.length > 1) {
            tagColumn = key.map((item: number) => ({ title: item, id: item }));
          }
          return [...i, tagColumn];
        }, []);
      }
      // 待排序容器需要过滤已排序容器存在的答案
      answerList.forEach((i: IAnswerList) => {
        const existed = newSort.some((sortItem: IAnswerSort[]) => {
          if (sortItem.length > 1) {
            return sortItem.some((v: IAnswerSort) => v.id === i.order);
          }
          return sortItem[0].id === i.order;
        });
        if (existed) {
          return;
        }
        waitSorts.push({ title: i.order, id: i.order });
      });
    }
    setSortList(newSort);
    setWaitSortList(waitSorts);
  };

  const updateValue = ({ order, value, key }: IConfigUpdate) => {
    const newList = answerList?.map((i: IAnswerList) => {
      if (i?.order === order) {
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

    setAnswerList(newList);
  };

  const isNoConfig = () => {
    const { indicatorScore = [], indicatorDetermine = [], text = [] } = LLMConfig;
    const hasIndicatorScore =
      indicatorScore?.filter((i: IndicatorScore) => i.label && i.value && i.score)?.length > 0;

    const hasIndicatorDetermine =
      indicatorDetermine?.filter((i: IndicatorDetermine) => i.label && i.value)?.length > 0;
    const hasText = text?.length > 0;

    const noConfig = !(hasIndicatorScore || hasIndicatorDetermine || hasText);
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
  const { indicatorScore = [], indicatorDetermine = [], enableSort } = LLMConfig;
  const showAnwerList =
    answerList.length > 0 && (indicatorDetermine?.length > 0 || indicatorScore?.length > 0);

  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        {showAnwerList && (
          <AnswerList
            list={answerList}
            LLMConfig={LLMConfig}
            updateValue={updateValue}
            checkMode={checkMode}
          />
        )}
        {enableSort && (
          <AnswerSort
            waitSortList={waitSortList}
            sortList={sortList}
            setSortList={setSortList}
            checkMode={checkMode}
          />
        )}

        {LLMConfig?.text && (
          <div style={{ padding: '0px 16px', marginTop: '16px' }}>
            <TextInputBox
              textAttribute={text || []}
              LLMConfig={LLMConfig}
              setText={setText}
              checkMode={checkMode}
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
            disabled={checkMode}
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
