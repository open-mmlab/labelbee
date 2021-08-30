import { IPolygonPoint } from '../../types/tool/polygon';
import { ESortDirection } from '../../constant/annotation';

type point = {
  id: string;
  x: number;
  y: number;
};

export default class CommonToolUtils {
  public static getNextSelectedRectID(
    rectList: point[],
    sort: ESortDirection = ESortDirection.ascend,
    selectedID?: string,
  ) {
    let sign = 1;
    if (sort === ESortDirection.descend) {
      sign = -1;
    }

    // 按照从左往右，从上往下优先级进行判断
    const sortRectList = rectList.sort((a, b) => {
      if (a.x - b.x === 0) {
        // 判断上下
        return a.y - b.y;
      }

      return sign * (a.x - b.x);
    });
    const i = sortRectList.findIndex((v) => v.id === selectedID);
    const len = sortRectList.length;
    return sortRectList[(i + 1) % len];
  }

  public static getNextSelectedRectIDByEvent(pointList: point[], event: KeyboardEvent, selectedID?: string) {
    const sortDirection = event.shiftKey ? ESortDirection.descend : ESortDirection.ascend;
    return this.getNextSelectedRectID(pointList, sortDirection, selectedID);
  }

  /**
   * 计算当前状态下需要展示的结果集合
   * @param T 当前图片的结果框
   * @param sourceID 当前状态依赖的框体，若依赖原图则返回 '0'
   * @param attributeLockList 当前展示的属性
   * @param selectedID 是否含有选中逻辑
   * @returns
   */
  public static getRenderResultList<T = any>(
    resultList: any[],
    sourceID: string,
    attributeLockList: string[] = [],
    selectedID?: string,
  ): [T[], T | undefined] {
    let selectedRect;

    const showingRect = resultList.filter((result) => {
      if (selectedID && selectedID === result?.id) {
        selectedRect = result;
        return false;
      }

      if (attributeLockList.length > 0 && !attributeLockList.includes(result?.attribute)) {
        return false;
      }

      // 兼容 sourceID 不存在的情况，将不存在的也展示出来
      if (this.isDifferSourceID(result?.sourceID, sourceID)) {
        return false;
      }

      return true;
    });
    return [showingRect, selectedRect];
  }

  /**
   * 获取当前依赖情况下的 sourceID 提取
   */
  public static getSourceID(basicResult?: any) {
    const defaultSourceID = '';

    if (basicResult) {
      return basicResult?.id ?? defaultSourceID;
    }
    return defaultSourceID;
  }

  /**
   * 获取当前点集的所有线条
   * @param pointList
   * @returns
   */
  public static findAllLine(pointList: IPolygonPoint[] | point[]) {
    const arr = [];
    const newPoint = [...pointList];
    if (newPoint.length >= 3) {
      // 连接头尾
      newPoint.push({ ...newPoint[0] });
    }
    for (let i = 0; i < newPoint.length; i++) {
      if (newPoint[i + 1]) {
        arr.push({
          point1: newPoint[i],
          point2: newPoint[i + 1],
          pointIndex: i,
        });
      }
    }
    return arr;
  }

  /**
   * 转换当前依赖 sourceID
   * @param sourceID
   * @returns
   */
  public static translateSourceID(sourceID: string | number) {
    if (sourceID === undefined || sourceID === 0 || sourceID === '0') {
      /**
       * 现在敲定都以空字符串来表示依赖原图，后续需要慢慢同步
       * （本函数现仅用于 isDifferSourceID 的判断，isDifferSourceID 仅用于 getRenderResultList 的过滤，故更改不影响）
       *  */
      sourceID = '';
    }

    return sourceID;
  }

  /**
   * 兼容判断 sourceID 为 空字符串、不存在、数字的情况
   * @param sourceA
   * @param sourceB
   * @returns
   */
  public static isDifferSourceID(sourceIDA: string | number, sourceIDB: string | number) {
    sourceIDA = this.translateSourceID(sourceIDA);
    sourceIDB = this.translateSourceID(sourceIDB);

    return `${sourceIDA}` !== `${sourceIDB}`;
  }

  /**
   * 兼容判断是否为相同类型的 sourceID
   * @param sourceIDA
   * @param sourceIDB
   * @returns
   */
  public static isSameSourceID(sourceIDA: string | number, sourceIDB: string | number) {
    sourceIDA = this.translateSourceID(sourceIDA);
    sourceIDB = this.translateSourceID(sourceIDB);

    return `${sourceIDA}` === `${sourceIDB}`;
  }

  /**
   * 获取下一个列表标记的值和位置
   * @param resultList
   * @param markerList
   * @param markerIndex
   * @returns
   */
  public static getNextMarker(resultList: IRect[], markerList: IInputList[] = [], markerIndex?: number) {
    if (markerList?.length === 0) {
      return undefined;
    }

    let newSortList = markerList.map((data, index) => ({ ...data, index }));
    if (typeof markerIndex === 'number' && markerIndex > 0) {
      const markerInfo = markerList[markerIndex];
      if (markerInfo && resultList.every((rect) => rect.label !== markerInfo.value)) {
        return { label: markerInfo.value, index: markerIndex };
      }

      newSortList = [...newSortList.slice(markerIndex, markerList.length), ...newSortList.slice(0, markerIndex)];
    }

    for (let i = 0; i < newSortList.length; i++) {
      if (resultList.some((rect) => rect.label === newSortList[i].value)) {
        continue;
      }

      return { label: newSortList[i].value, index: newSortList[i].index };
    }
    return undefined;
  }

  /**
   * 获取当前值在列表标注的位置
   * @param label
   * @param markerList
   * @returns
   */
  public static getCurrentMarkerIndex(label: string, markerList: IInputList[] = []) {
    return markerList.findIndex((marker) => label === marker.value);
  }
}
