import type { ITagLabelsArray } from './types';

/**
 * Find key and value to display label through inputList
 * @param key
 * @param value
 * @param inputList
 */
export const findTagLabel = (key: string, value: string, inputList: any[]) => {
  const primaryTagConfig = inputList.find((i) => i.value === key);
  const secondaryTagConfig = primaryTagConfig.subSelected.find(
    (i: { value: string }) => i.value === value,
  );
  return { keyLabel: primaryTagConfig.key, valueLabel: secondaryTagConfig.key };
};

/**
 * Sort tags through inputList
 * @param tagsKeys
 * @param inputList
 */
export const tagsSortThruInputList = (tagsKeys: string[], inputList: any[]) => {
  return tagsKeys.sort((key1, key2) => {
    const key1Idx = inputList.findIndex((input) => key1 === input.value);
    const key2Idx = inputList.findIndex((input) => key2 === input.value);
    return key1Idx - key2Idx;
  });
};

/**
 * Convent result's array to array of showing the labels
 * @param result
 * @param inputList
 * @returns {ITagLabelsArray}
 */
export const result2LabelKey = (result: any[], inputList: any[]) => {
  try {
    return (
      result?.reduce((exitsTags: ITagLabelsArray, res: { result: { [key: string]: string } }) => {
        tagsSortThruInputList(Object.keys(res.result), inputList).forEach((key) => {
          const valuesArray = res.result[key]?.split(';');
          findLabelFromValuesArray(valuesArray, key, inputList, exitsTags);
        });
        return exitsTags;
      }, []) ?? []
    );
  } catch (error) {
    return [];
  }
};

/**
 * find label from valuesArray and push to exitsTags
 * @param valuesArray
 * @param key
 * @param inputList
 * @param exitsTags
 */
const findLabelFromValuesArray = (
  valuesArray: string[],
  key: string,
  inputList: any[],
  exitsTags: ITagLabelsArray,
) => {
  valuesArray.forEach((value) => {
    const { keyLabel, valueLabel } = findTagLabel(key, value, inputList);
    const tagHasAssign = exitsTags.find((i) => i.keyLabel === keyLabel);
    if (tagHasAssign) {
      tagHasAssign.valuesLabelArray.push(valueLabel);
    } else {
      exitsTags.push({ keyLabel, valuesLabelArray: [valueLabel] });
    }
  });
};

/**
 * Get key number through keyCode, Such as 49(keycode) => 1(number)
 * @param {Number} keyCode
 * @returns {Number} keyCode in scope if it greater than 0
 */
export const getKeyCodeNumber = (keyCode: number) => {
  if (keyCode <= 57 && keyCode >= 49) {
    return keyCode - 48;
  }

  if (keyCode <= 105 && keyCode >= 97) {
    return keyCode - 96;
  }

  return 0;
};

/**
 * Preserve decimals for number
 * @param num
 * @param places
 * @returns {Number}
 */
export const decimalReserved = (num: number, places = 2) =>
  typeof num === 'number' ? parseFloat(num.toFixed(places)) : num;

/**
 * Compute the hash code of given string
 * @param str
 * @returns {Number}
 */
export const hashCode = function (str: string | undefined) {
  if (str === undefined) return str
  let hash = 0;
  let i;
  let chr;
  if (str.length === 0) {
    return hash;
  }
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};
