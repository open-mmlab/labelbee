import uuid from '../uuid';

export default class TagUtil {
  /**
   * 获取 tag key 的中文名
   *
   * @export
   * @param {string} key
   * @param {IInputList[]} labelInfoSet
   * @returns
   */
  public static getTagKeyName(key: string, labelInfoSet: IInputList[]) {
    if (!labelInfoSet) {
      return;
    }

    return labelInfoSet.find((v) => v.value === key)?.key ?? '';
  }

  // 获取 TagName
  // 获取当前标签名
  public static getTagName([key = '', value = ''], labelInfoSet: IInputList[]) {
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
   * 获取标签结果中的标签名
   *
   * @export
   * @param {Object} result
   * @param {IInputList[]} labelInfoSet
   * @returns
   */
  public static getTagNameList(result: Object, labelInfoSet: IInputList[]) {
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
            keyName: this.getTagKeyName(key, labelInfoSet),
            value: valueList.map((v: string) => this.getTagName([key, v], labelInfoSet)),
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
  public static getTagnameListWithoutConfig(result: Object) {
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

  /**
   * 判断当前的 key value 是否在 inputList 里面
   * @param key
   * @param value
   * @param inputList
   * @returns
   */
  static judgeResultIsInInputList(key: string, value: string, inputList: IInputList[]) {
    if (!key || !value || !inputList) {
      return false;
    }

    const a = inputList.filter((v) => {
      if (v.value === key && v.subSelected) {
        const resultValue = value?.split(';');
        return v?.subSelected.filter((i) => resultValue.indexOf(i.value) > -1).length > 0;
      }

      return false;
    });

    return a.length > 0;
  }

  /**
   * 遍历顶层数据
   * @param inputList
   * @returns
   */
  public static getDefaultResultByConfig(inputList: IInputList[]) {
    return inputList.reduce((acc: { [a: string]: string }, cur: IInputList) => {
      if (cur.subSelected) {
        cur.subSelected.forEach((data) => {
          if (data.isDefault) {
            const originResult = acc[cur.value] ?? '';

            let originResultList: string[] = [];
            if (originResult.length > 0) {
              // 说明里面有结果
              originResultList = originResult.split(';');
            }
            originResultList.push(data.value);

            acc[cur.value] = originResultList.join(';');
          }
        });
      }
      return acc;
    }, {});
  }

  /**
   * 获取当前的默认的结果
   * @param inputList
   * @param basicResultList
   * @returns
   */
  public static getDefaultTagResult(inputList: IInputList[], basicResultList: any[]) {
    const defaultResult: any = this.getDefaultResultByConfig(inputList);

    if (basicResultList.length > 0) {
      return basicResultList.map((v) => ({
        id: uuid(),
        sourceID: v.id,
        result: { ...defaultResult },
      }));
    }
    return [
      {
        id: uuid(),
        sourceID: '',
        result: { ...defaultResult },
      },
    ];
  }
}
