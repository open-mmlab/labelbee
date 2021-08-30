/**
 * 获取 tag key 的中文名
 *
 * @export
 * @param {string} key
 * @param {IInputList[]} labelInfoSet
 * @returns
 */
export function getTagKeyName(key: string, labelInfoSet: IInputList[]) {
  if (!labelInfoSet) {
    return;
  }

  return labelInfoSet.find((v) => v.value === key)?.key ?? '';
}

// 获取 TagName
// 获取当前标签名
export function getTagName([key = '', value = ''], labelInfoSet: IInputList[]) {
  if (!labelInfoSet) {
    return;
  }

  for (const i of labelInfoSet) {
    if (i.value === key) {
      if (!i.subSelected) {
        console.error('标签解析错误', key, value);
        return '';
      }

      for (const j of i.subSelected) {
        if (j.value === value) {
          return j.key;
        }
      }
    }
  }
}

/**
 * 判断当前的 key value 是否在 inputList 里面
 *
 * @export
 * @param {string} key
 * @param {string} value
 * @param {IInputList[]} inputList
 */
export function judgeResultIsInInputList(key: string, value: string, inputList: IInputList[]) {
  if (!key || !value || !inputList) {
    return false;
  }

  const a = inputList.filter((v) => {
    if (v.value === key) {
      const resultValue = value?.split(';');
      const { subSelected } = v;
      if (!subSelected) return false;

      return subSelected.filter((i) => resultValue.indexOf(i.value) > -1).length > 0;
    }

    return false;
  });

  return a.length > 0;
}

/**
 * 获取标签结果中的标签名
 *
 * @export
 * @param {Object} result
 * @param {IInputList[]} labelInfoSet
 * @returns
 */
export function getTagNameList(result: Object, labelInfoSet: IInputList[]) {
  // 获取当前的标签结果的所有结果
  if (Object.keys(result).length <= 0) {
    return [];
  }

  return Object.entries(result)
    .reduce((acc: any[], cur: any) => {
      const [key, value] = cur;
      if (value && value.length > 0) {
        const valueList = value.split(';');
        const nameList = {
          keyName: getTagKeyName(key, labelInfoSet),
          value: valueList.map((v: string) => getTagName([key, v], labelInfoSet)),
        };
        return [...acc, nameList];
      }
      return acc;
    }, [])
    .filter((v: any) => v);
}

/**
 * 没有配置 获取标签结果中的标签名
 * @param result
 * @returns
 */
export function getTagnameListWithoutConfig(result: Object) {
  if (Object.keys(result).length <= 0) {
    return [];
  }

  return Object.entries(result)
    .reduce((acc: any[], cur: any): any[] => {
      const [key, value] = cur;
      const valueList = value.split(';');
      const nameList = {
        keyName: key,
        value: valueList,
      };
      return [...acc, nameList];
    }, [])
    .filter((v: any) => v);
}
