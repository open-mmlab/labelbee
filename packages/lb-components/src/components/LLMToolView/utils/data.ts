import { jsonParser } from '../../../utils';

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
