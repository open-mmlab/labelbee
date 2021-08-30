import { IPolygonPoint } from '../../types/tool/polygon';
import { EDependPattern } from '../../constant/tool';
// import { message } from 'antd';
import { getCurrentStepInfo, jsonParser } from './common';
import { isInPolygon } from './polygonTool';
/**
 *
 * @param result 原结果集合
 * @param step 当前的步骤
 * @param resultList 当前标注需要覆盖的
 * @param stepList
 */
export function composeResult(
  result: string,
  currentStep: number,
  resultList: any[],
  stepList: any[],
  basicImgInfo: any,
) {
  try {
    const data = JSON.parse(result);
    const currentStepInfo = getCurrentStepInfo(currentStep, stepList);
    const { dataSourceStep } = currentStepInfo;
    const stepName = `step_${currentStepInfo.step}`;

    Object.assign(data, basicImgInfo);

    if (data[stepName]) {
      // 这层可能还要处理 dataSource 依赖问题
      const info = data[stepName];
      if (info.result) {
        info.result = resultList;
        return JSON.stringify(data);
      }
      return JSON.stringify({
        ...data,
        [stepName]: {
          ...data[stepName],
          result: resultList,
        },
      });
    }
    // 初始化结果
    return JSON.stringify({
      ...data,
      [stepName]: {
        dataSourceStep,
        toolName: currentStepInfo.tool,
        result: resultList,
      },
    });
  } catch {
    return result;
  }
}

/**
 * 解析数据
 *
 * @export
 * @param {string} result
 * @param {number} step
 * @param {any[]} stepList
 * @param {string} [preResult='{}']
 * @returns
 */
export function parseResult(result: string, step: number, stepList: any[]) {
  try {
    const data = jsonParser(result);

    // 获取当前步骤信息
    const currentStepInfo = getCurrentStepInfo(step, stepList);
    if (!currentStepInfo) {
      return [[], [], 0];
    }

    const stepName = `step_${currentStepInfo.step}`;
    // let dependData = getBasicResult(
    //   currentStepInfo.step,
    //   currentStepInfo.dataSourceStep,
    //   stepList,
    //   data,
    //   true,
    //   preResult,
    // );
    let dependData: any[] = [];

    // 临时处理一下
    if (dependData === undefined) {
      dependData = [];
    }

    // const dependPattern: EDependPattern = getDependPattern(
    //   currentStepInfo.step,
    //   stepList,
    //   data,
    //   currentStepInfo.step,
    //   preResult,
    // );
    const dependPattern = EDependPattern.dependOrigin;

    // if (dependPattern === EDependPattern.noDepend && data.valid !== false) {
    // message.destroy();
    // message.info('该图片没有需要标注的对象', 1);
    // }

    // 图片基础信息（有别于 sensebee， 新增方式）
    const basicImgInfo = {};

    if (data.width !== undefined) {
      Object.assign(basicImgInfo, { width: data.width });
    }

    if (data.height !== undefined) {
      Object.assign(basicImgInfo, { height: data.height });
    }
    if (data.valid !== undefined) {
      Object.assign(basicImgInfo, { valid: data.valid });
    }
    if (data.rotate !== undefined) {
      Object.assign(basicImgInfo, { rotate: data.rotate });
    }

    if (data[stepName]) {
      // 这层可能还要处理 dataSource 依赖问题
      const info = data[stepName];
      if (info.result) {
        return [dependData, info.result, basicImgInfo, dependPattern];
      }
      return [dependData, [], basicImgInfo, dependPattern];

      // return data[stepName]
    }
    return [dependData, [], basicImgInfo, dependPattern];
  } catch (e) {
    console.error('parseRectError', e);
    return [[], [], {}];
  }
}

/**
 * 获取当前矩形框点集
 * @param rect
 */
export function getRectPointList(rect: IRect, zoom = 1) {
  return [
    { x: rect.x * zoom, y: rect.y * zoom },
    { x: (rect.x + rect.width) * zoom, y: rect.y * zoom },
    { x: (rect.x + rect.width) * zoom, y: (rect.y + rect.height) * zoom },
    { x: rect.x * zoom, y: (rect.y + rect.height) * zoom },
  ];
}

/**
 * 获取当前矩形框的边集合
 * @param rect
 * @param zoom 缩放比例
 */
export function getRectEdgeList(rect: IRect, zoom = 1) {
  const pointList = getRectPointList(rect, zoom);
  const len = pointList.length;
  return pointList.map((v, i) => {
    return {
      begin: v,
      end: pointList[(i + 1) % len],
    };
  });
}

/**
 * 当前点是否在在矩形内
 * @param coordinate
 * @param rect
 * @param scope
 * @param zoom
 */
export function isInRect(coordinate: ICoordinate, rect: IRect, scope: number, zoom = 1) {
  return (
    coordinate.x >= rect.x * zoom - scope &&
    coordinate.x <= (rect.x + rect.width) * zoom + scope &&
    coordinate.y >= rect.y * zoom - scope &&
    coordinate.y <= (rect.y + rect.height) * zoom + scope
  );
}

/**
 * rect 与 zoom 的乘积
 * @param rect
 * @param zoom
 */
export function getRectUnderZoom(rect: IRect, zoom = 1) {
  const { x, y, width, height } = rect;

  return {
    ...rect,
    x: x * zoom,
    y: y * zoom,
    width: width * zoom,
    height: height * zoom,
  };
}

/**
 * 坐标与 zoom 的乘积
 * @param coordinate
 * @param zoom
 */
export function getCoordinateUnderZoom(coordinate: ICoordinate, zoom = 1): ICoordinate {
  const { x, y } = coordinate;

  return {
    x: x * zoom,
    y: y * zoom,
  };
}

/**
 * 判断当前矩形是否不在多边形内
 * @param rect
 * @param polygonPointList
 */
export function isRectNotInPolygon(rect: IRect, polygonPointList: IPolygonPoint[]) {
  const rectPointList = getRectPointList(rect);

  return rectPointList.some((p) => !isInPolygon(p, polygonPointList));
}
