import { isArray } from 'lodash';
import { jsonParser } from '../../../utils';
import {
  IAnswerList,
  IAnswerSort,
  ILLMBoxResult,
  ILLMToolConfig,
  IWaitAnswerSort,
  IInputList,
  ISelectedTags,
} from '../types';

export const getCurrentResultFromResultList = (result: string) => {
  const data = jsonParser(result);
  const DEFAULT_STEP = `step_1`;
  // LLM results are single labeled results
  const dataList = data?.[DEFAULT_STEP]?.result[0] ?? {};
  return { ...dataList, valid: dataList?.valid ?? true };
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

// get tag data by config or result
export const getTagResult = (inputList: IInputList[], result?: ISelectedTags) => {
  let selected = {};
  inputList.forEach((i) => {
    let list: Array<string> = [];
    if (result && result[i?.value]) {
      list = result[i.value];
    } else if (i?.subSelected?.length > 0) {
      i.subSelected.forEach((s) => {
        if (s?.isDefault && s?.value) {
          list.push(s.value);
        }
      });
    }
    if (list.length > 0) {
      selected = { ...selected, [i.value]: list };
    }
  });
  return selected;
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
  const { isTextEdit, textEdit = [], inputList = [] } = LLMConfig || {};

  const data = initValue.map((i) => {
    const localInputList = inputList.filter((i: IInputList) => !i?.isOverall) || [];
    const tagList = getTagResult(localInputList, i?.tagList);
    if (isTextEdit) {
      const isFillAnswer = textEdit.filter((v) => v.title === i.order)[0]?.isFillAnswer;
      if (isFillAnswer) {
        return { ...i, newAnswer: i?.newAnswer ?? i.answer, tagList };
      }
    }
    return { ...i, tagList };
  });
  return data;
};

export const getRenderDataByResult = (LLMConfig?: ILLMToolConfig, result?: ILLMBoxResult) => {
  let answerList: IAnswerList[] = [];
  let newSort: IAnswerSort[][] = [];
  let waitSorts: IWaitAnswerSort[] = [];
  let tagList: ISelectedTags = {};
  if (result?.answerList) {
    answerList = initAnswerList(result.answerList, LLMConfig) || [];
    newSort = getWaitSortList(result.answerList, result).newSort;
    waitSorts = getWaitSortList(result.answerList, result).waitSorts;
  }
  const overallInputList = LLMConfig?.inputList?.filter((i: IInputList) => i?.isOverall) || [];

  tagList = getTagResult(overallInputList, result?.tagList);
  return {
    newSort,
    waitSorts,
    answerList,
    tagList,
    textAttribute: result?.textAttribute,
  };
};
