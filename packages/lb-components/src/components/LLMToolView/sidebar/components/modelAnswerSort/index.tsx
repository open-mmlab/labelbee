import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import AnswerSort from '../answerSort';
import { IAnswerSort } from '@/components/LLMToolView/types';

interface ISelectAnswerSort {
  [key: string]: number[][];
}

interface IModelList {
  id: number;
  answerList: IAnswerList[];
  title: string;
}

interface IAnswerList {
  id: string;
  answer: string;
}

interface IMaxAnswerList {
  id: string;
  title: string;
}

interface IProps {
  selectedSort?: ISelectAnswerSort;
  modelData: IModelList[];
  selectedAnswerSort: (sorts: ISelectAnswerSort) => void;
  disabeledAll?: boolean;
}

export const getSorts = ({
  selectedSort,
  initSelected,
  modelList,
}: {
  selectedSort?: number[][];
  modelList: any[];
  initSelected?: number[][];
}) => {
  const selecteds = initSelected ?? selectedSort;
  let newSort: any[] = [];
  const waitSorts = modelList.filter((i) => {
    const selectedIds = selecteds && selecteds?.length > 0 ? selecteds.flat() : [];
    if (selectedIds.includes(i.id)) {
      return false;
    }
    return true;
  });
  if (selecteds && selecteds?.length > 0) {
    newSort = selecteds.map((i) => i.map((item) => modelList.find((j) => j.id === item)));
  }
  return { waitSorts, newSort };
};

const ModelAnswerSort = (props: IProps, ref: any) => {
  const { selectedSort, modelData, selectedAnswerSort, disabeledAll } = props;
  const [answerSortData, setAnswerSortData] = useState<any>({
    waitSorts: {},
    selecteds: selectedSort,
  });

  const { t } = useTranslation();

  const modelDatas = useMemo(() => {
    return modelData.map((i, itemIndex) => ({
      ...i,
      title: itemIndex + 1,
    }));
  }, [modelData]);

  const maxAnswerList: IMaxAnswerList[] = useMemo(() => {
    const maxList = modelData.reduce((longest: any[], current: any) => {
      return current.answerList.length > longest.length ? current.answerList : longest;
    }, []);
    const renderValue = maxList.map((i: { id: string; answer: string }, index: number) => ({
      id: i.id,
      title: `${index + 1}`,
    }));
    return renderValue || [];
  }, [modelData]);

  useEffect(() => {
    if (selectedSort) {
      setRenderAnswerSortData();
    }
  }, [modelData]);

  const getModelList = (id: string) => {
    const values = modelDatas.filter((i) => i.answerList.some((item) => item.id === id)) || [];
    return values.map((i) => ({ ...i, id: i.id, title: i.title }));
  };

  const setRenderAnswerSortData = (initSelecteds?: ISelectAnswerSort) => {
    const newValue = answerSortData;
    const selects = initSelecteds ?? selectedSort;
    maxAnswerList.forEach((i) => {
      const modelList = getModelList(i.id);
      const selecteds = selects?.[i.id];
      const { waitSorts, newSort } = getSorts({ selectedSort: selecteds, modelList });
      newValue.waitSorts[i.id] = waitSorts;
      newValue.selecteds[i.id] = newSort;
    });
    setAnswerSortData(newValue);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        clearValue: () => setRenderAnswerSortData({}),
      };
    },
    [modelData],
  );

  const exportData = (id: string, value: IAnswerSort[][]) => {
    const isDragTag = value.some((innerArray) => innerArray.some((item) => item?.id));

    if (isDragTag) {
      const newSelecteds = { ...answerSortData.selecteds, [id]: value };

      const formatValue: any = {};
      Object.keys(newSelecteds).forEach((key) => {
        formatValue[key] = newSelecteds[key].map((innerArray: IAnswerSort[]) =>
          innerArray.map((item: IAnswerSort) => item.id),
        );
      });
      selectedAnswerSort(formatValue);
      setAnswerSortData({ ...answerSortData, selecteds: newSelecteds });
    }
  };
  const { run: exportSort } = useDebounceFn(exportData, { wait: 10 });

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
        {/* {answerSortData?.waitSorts?.length > 0 && (
          <Tag color='#FFD9D9' style={{ color: '#F26549', marginLeft: 8 }}>
            {t('Unfinished')}
          </Tag>
        )} */}
      </div>
      {maxAnswerList.map((i: IMaxAnswerList, index: number) => {
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
            <AnswerSort
              waitSortList={answerSortData?.waitSorts?.[i.id] ?? []}
              sortList={answerSortData?.selecteds?.[i.id] ?? []}
              setSortList={(value: IAnswerSort[][]) => {
                exportSort(i.id, value);
              }}
              disabeledAll={disabeledAll}
              header={''}
              prefixId={`modelAnswer${index}`}
            />
          </div>
        );
      })}
    </div>
  );
};
export default forwardRef(ModelAnswerSort);
