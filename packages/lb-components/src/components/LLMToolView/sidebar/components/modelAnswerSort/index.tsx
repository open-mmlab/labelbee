import React, { useState, useEffect, useContext, useMemo } from 'react';
import { prefix } from '@/constant';
import { Button, Empty, Tag } from 'antd';
import AnswerSort from '../answerSort';
import { IWaitAnswerSort } from '@/components/LLMToolView/types';
import { getWaitSortList } from '@/components/LLMToolView/utils/data';
import { isArray } from 'lodash';
import ModelSort from '../modelSort';
import { useTranslation } from 'react-i18next';

interface IAnswerSort {
  [key: string]: number[][];
}

interface IModelList {
  id: number;
  answerList: IAnswerList[];
}

interface IAnswerList {
  id: string;
  answer: string;
}

interface IProps {
  selectedSort?: IAnswerSort;
  maxAnswerList: IAnswerList[];
  modelData: IModelList[];
}

const ModelAnswerSort = (props: IProps) => {
  const { selectedSort, maxAnswerList, modelData } = props;
  const [answerSortData, setAnswerSortData] = useState({ waitSorts: [], selecteds: selectedSort });
  const { t } = useTranslation();

  const modelDatas = useMemo(
    () =>
      modelData.map((i, itemIndex) => ({
        ...i,
        title: itemIndex + 1,
      })),
    [modelData],
  );

  const getModelList = (id: string) => {
    const values = modelDatas.filter((i) => i.answerList.some((item) => item.id === id)) || [];
    return values.map((i) => ({ id: i.id, title: i.title }));
  };

  const exportSort = (id: string, value: number[][]) => {
    // TODO 当拖动一个答案的时，多次调用
    // 因为answerSort组件useEffect(() => {formatSortList();}, [JSON.stringify(sortList)])
  };

  return (
    <div>
      <div
        style={{
          fontWeight: 500,
          fontSize: '16px',
          width: '100%',
          lineHeight: '46px',
          padding: '0px 16px',
        }}
      >
        <span>{t('RankingQualityOfAnswers')}</span>
        {answerSortData?.waitSorts?.length > 0 && (
          <Tag color='#FFD9D9' style={{ color: '#F26549', marginLeft: 8 }}>
            {t('Unfinished')}
          </Tag>
        )}
      </div>
      {maxAnswerList.map((i: IAnswerList, index: number) => {
        return (
          <div key={index} style={{ display: 'flex' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                width: '80px',
                lineHeight: '50px',
                textAlign: 'center',
              }}
            >{`${t('Answer')}${index + 1}`}</div>
            <ModelSort
              setSort={(value) => {
                exportSort(i.id, value);
              }}
              modelList={getModelList(i.id)}
              selectedSort={answerSortData.selecteds?.[i.id] ?? []}
              header={''}
              prefixId={`modelAnswer${index}`}
            />
          </div>
        );
      })}
    </div>
  );
};
export default ModelAnswerSort;
