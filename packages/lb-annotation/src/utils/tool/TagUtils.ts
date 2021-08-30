import uuid from '../uuid';

export default class TagUtil {
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
