import { jsonParser } from '../../../utils';
import { IInputList, ISelectedTags } from '../types';

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
