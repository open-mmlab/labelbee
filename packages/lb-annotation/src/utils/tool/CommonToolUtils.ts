import { isObject } from 'lodash';
import { IPolygonPoint } from '../../types/tool/polygon';
import { ESortDirection, EStepType } from '../../constant/annotation';
import { ECheckModel, EToolName } from '@/constant/tool';
import CheckOperation from '../../core/toolOperation/checkOperation';
import PolygonOperation from '../../core/toolOperation/polygonOperation';
import RectOperationAsNewName from '../../core/toolOperation/rectOperation';
import TagOperation from '../../core/toolOperation/tagOperation';
import LineToolOperation from '../../core/toolOperation/LineToolOperation';
import PointOperation from '../../core/toolOperation/pointOperation';
import TextToolOperation from '../../core/toolOperation/TextToolOperation';

type point = {
  id: string;
  x: number;
  y: number;
};

export default class CommonToolUtils {
  /**
   * 找到指定步骤的数据
   * @param step 获取的步骤
   * @param stepList 步骤列表
   * @returns 步骤配置
   */
  public static getStepInfo(step: number, stepList: IStepInfo[]) {
    return stepList?.filter((info) => info.step === step)[0];
  }

  /**
   * 获取当前步骤的步骤配置信息，用于当前标注配置的获取
   * 注意： 需要与 getStepInfo 区分，因为 getStepInfo 拿取的是直接的步骤信息
   * @export
   * @param {number} currentStep
   * @param {IStepInfo[]} stepList
   * @returns {*}
   */
  public static getCurrentStepInfo(currentStep: number, stepList: IStepInfo[]): any {
    const currentStepInfo = this.getStepInfo(currentStep, stepList);
    if (currentStepInfo) {
      if (
        currentStepInfo.type === EStepType.QUALITY_INSPECTION ||
        currentStepInfo.type === EStepType.MANUAL_CORRECTION
      ) {
        // 判断是否是质检
        return this.getCurrentStepInfo(currentStepInfo.dataSourceStep, stepList);
      }

      // 后续要判断预标注的情况
    }
    return currentStepInfo;
  }

  public static jsonParser = (content: any, defaultValue: any = {}) => {
    try {
      if (typeof content === 'string') {
        return JSON.parse(content);
      }
      return isObject(content) ? content : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  /**
   * 获取结果中最大的order
   *
   * @export
   * @param {any[]} result
   * @returns {number}
   */
  public static getMaxOrder(result: any[]): number {
    let order = 0;
    result.forEach((v) => {
      if (v.order && v.order > order) {
        order = v.order;
      }
    });
    return order;
  }

  /**
   * 表单控件控件判断 返回 Boolean
   * hotkey is effective only whene filter return true
   * @param event
   * @returns {boolean}
   */
  public static hotkeyFilter(event: any) {
    const target = event.target || event.srcElement;
    if (!target) {
      return true;
    }

    const { tagName, type } = target;

    if (!tagName || !type) {
      return true;
    }

    let flag = true;
    // ignore: isContentEditable === 'true', <input> and <textarea> whene readOnly state is false, <select>
    if (
      target.isContentEditable ||
      tagName === 'TEXTAREA' ||
      (((tagName === 'INPUT' && type !== 'radio') || tagName === 'TEXTAREA') && !target.readOnly)
    ) {
      flag = false;
    }
    return flag;
  }

  /**
   * 筛选当前的步骤配置
   * @param toolName
   */
  public static getCurrentOperation(toolName: EToolName | ECheckModel) {
    switch (toolName) {
      case EToolName.Rect:
      case EToolName.RectTrack:
        return RectOperationAsNewName;
      case EToolName.Tag:
        return TagOperation;
      case EToolName.Polygon:
        return PolygonOperation;
      case ECheckModel.Check:
        return CheckOperation;
      case EToolName.Line:
        return LineToolOperation;
      case EToolName.Point:
        return PointOperation;
      case EToolName.Text:
        return TextToolOperation;
      default:
        throw new Error('not match tool');
    }
  }

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
  public static translateSourceID(sourceID: string | number | undefined) {
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
  public static isSameSourceID(sourceIDA: string | number | undefined, sourceIDB: string | number | undefined) {
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
  public static getNextMarker(
    resultList: Array<IPointUnit | IRect>,
    markerList: IInputList[] = [],
    markerIndex?: number,
  ) {
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
