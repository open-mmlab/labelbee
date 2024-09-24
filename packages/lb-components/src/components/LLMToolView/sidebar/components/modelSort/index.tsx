import React, { useState, useEffect, useContext, useMemo } from 'react';
import { prefix } from '@/constant';
import { Button, Empty } from 'antd';
import AnswerSort from '../answerSort';
import { IAnswerSort, IWaitAnswerSort } from '@/components/LLMToolView/types';
import { getWaitSortList } from '@/components/LLMToolView/utils/data';
import { isArray } from 'lodash';

interface IModelList {
  id: number;
  title: number;
}

interface ISortData {
  newSort?: IAnswerSort[][];
  waitSorts?: IWaitAnswerSort[];
}

interface IProps {
  modelList: IModelList[];
  selectedSort?: number[][];
  disabeledAll?: boolean;
  setSort: (sort: number[][]) => void;
  header?: HTMLElement | string;
  title?: string;
  prefixId?: string;
}

const ModelSort = (props: IProps) => {
  const { disabeledAll, modelList, selectedSort, setSort, header, title,prefixId } = props;
  const [sortData, setSortData] = useState<ISortData>({});

  useEffect(() => {
    initSortData();
  }, []);

  const initSortData = () => {
    let newSort: any[] = [];
    const waitSorts = modelList.filter((i) => {
      const selectedIds = selectedSort && selectedSort?.length > 0 ? selectedSort.flat() : [];
      if (selectedIds.includes(i.id)) {
        return false;
      }
      return true;
    });
    if (selectedSort && selectedSort?.length > 0) {
      newSort = selectedSort.map((i: number[]) =>
        i.map((item) => modelList.find((j) => j.id === item)),
      );
    }
    setSortData({ waitSorts, newSort });
  };

  const exportSort = (list: IAnswerSort[][]) => {
    const sort = list.map((i) => i.map((item) => item.id));
    setSort(sort);
  };

  return (
    <AnswerSort
      waitSortList={sortData?.waitSorts || []}
      sortList={sortData?.newSort || []}
      setSortList={(value) => {
        setSortData({ ...sortData, newSort: value });
        exportSort(value);
      }}
      disabeledAll={disabeledAll}
      header={header}
      title={title}
      prefixId={prefixId}
    />
  );
};

export default ModelSort;
