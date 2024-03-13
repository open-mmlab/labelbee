import { isArray } from 'lodash';
import { jsonParser } from '../../../utils';
import { IAnswerList, IAnswerSort, ILLMBoxResult, ILLMToolConfig, IWaitAnswerSort } from '../types';

export const getCurrentResultFromResultList = (result: string) => {
  const data = jsonParser(result);
  const DEFAULT_STEP = `step_1`;
  // LLM results are single labeled results
  const dataList = data?.[DEFAULT_STEP]?.result[0] ?? {};
  return dataList;
};

export const formatSort = (sortList: any) => {
  const newList = sortList.reduce((list: any, key: any) => {
    let tagColumn = key;
    if (key.length > 1) {
      tagColumn = key.map((i: { id: number; title: number | string }) => i?.id);
    } else {
      tagColumn = [key[0]?.id];
    }
    return [...list, tagColumn];
  }, []);
  return newList;
};

// get wait sort list and sorted list by result
export const getWaitSortList = (answerList: IAnswerList[], result?: ILLMBoxResult) => {
  let waitSorts: IWaitAnswerSort[] = [];
  let newSort: IAnswerSort[][] = [];
  if (answerList?.length > 0) {
    // Convert the format of [[1],[2,3]] to [[{ title: 1, id: 1 }],[{...},{...}]]
    const currentResult = isArray(result) ? result[0] : result;
    if (currentResult?.sort?.length > 0) {
      newSort = currentResult.sort.reduce((i: IWaitAnswerSort[][], key: number[]) => {
        let tagColumn = [{ title: key[0], id: key[0] }];
        if (key.length > 1) {
          tagColumn = key.map((item: number) => ({ title: item, id: item }));
        }
        return [...i, tagColumn];
      }, []);
    }
    // The container to be sorted needs to filter the answer for the existence of the sorted container
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
  return { newSort, waitSorts };
};

export const initAnswerList = (initValue: IAnswerList[], LLMConfig?: ILLMToolConfig) => {
  const { isTextEdit, textEdit = [] } = LLMConfig || {};
  if (!isTextEdit) {
    return initValue;
  }
  const data = initValue.map((i) => {
    const isFillAnswer = textEdit.filter((v) => v.title === i.order)[0]?.isFillAnswer;
    return isFillAnswer ? { ...i, newAnswer: i?.newAnswer ?? i.answer } : i;
  });
  return data;
};

export const getRenderDataByResult = (LLMConfig?: ILLMToolConfig, result?: ILLMBoxResult) => {
  let answerList: IAnswerList[] = [];
  let newSort: IAnswerSort[][] = [];
  let waitSorts: IWaitAnswerSort[] = [];
  if (result?.answerList) {
    answerList = initAnswerList(result.answerList, LLMConfig) || [];
    newSort = getWaitSortList(result.answerList, result).newSort;
    waitSorts = getWaitSortList(result.answerList, result).waitSorts;
  }
  return {
    newSort,
    waitSorts,
    answerList,
    textAttribute: result?.textAttribute,
  };
};
