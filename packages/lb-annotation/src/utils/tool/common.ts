import { isObject } from 'lodash';
import { EStepType } from '../../constant/annotation';
import { ECheckModel, EToolName, SEGMENT_NUMBER } from '../../constant/tool';
import { createSmoothCurvePointsFromPointList } from './polygonTool';
import CheckOperation from './toolOperation/checkOperation';
import PolygonOperation from './toolOperation/polygonOperation';
import RectOperationAsNewName from './toolOperation/rectOperation';
import TagOperation from './toolOperation/tagOperation';
import LineToolOperation from './toolOperation/LineToolOperation';
import PointOperation from './toolOperation/pointOperation';
import TextToolOperation from './toolOperation/TextToolOperation';

/**
 * 找到指定步骤的数据
 * @param step 获取的步骤
 * @param stepList 步骤列表
 * @returns 步骤配置
 */
export function getStepInfo(step: number, stepList: IStepInfo[]) {
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
export function getCurrentStepInfo(currentStep: number, stepList: IStepInfo[]): any {
  const currentStepInfo = getStepInfo(currentStep, stepList);
  if (currentStepInfo) {
    if (currentStepInfo.type === EStepType.QUALITY_INSPECTION || currentStepInfo.type === EStepType.MANUAL_CORRECTION) {
      // 判断是否是质检
      return getCurrentStepInfo(currentStepInfo.dataSourceStep, stepList);
    }

    // 后续要判断预标注的情况
  }
  return currentStepInfo;
}

export const jsonParser = (content: any, defaultValue: any = {}) => {
  try {
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return isObject(content) ? content : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const loadImage = (imgSrc: string) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      setTimeout(() => {
        resolve(image);
      }, 0);
    };
    image.onerror = () => {
      // 无返回则默认为空
      resolve(null);
    };
  });
};

/**
 * 获取结果中最大的order
 *
 * @export
 * @param {any[]} result
 * @returns {number}
 */
export function getMaxOrder(result: any[]): number {
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
export function hotkeyFilter(event: any) {
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
export function getCurrentOperation(toolName: EToolName | ECheckModel) {
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

/**
 *
 * @param text
 * @param x
 * @param y
 * @param maxWidth
 * @param lineHeight
 */
export function wrapText(text: string, x: number, y: number, maxWidth?: number, lineHeight?: number) {
  if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
    return;
  }

  const context = this;
  const { canvas } = context;

  if (typeof maxWidth === 'undefined') {
    maxWidth = (canvas && canvas.width) || 300;
  }
  if (lineHeight === undefined) {
    lineHeight =
      (canvas && parseInt(window.getComputedStyle(canvas).lineHeight, 10)) ||
      parseInt(window.getComputedStyle(document.body).lineHeight, 10);
  }

  const arrParagraph = text.split('\n');

  for (let i = 0; i < arrParagraph.length; i++) {
    // 字符分隔为数组
    const arrText = arrParagraph[i].split('');
    let line = '';

    for (let n = 0; n < arrText.length; n++) {
      const testLine = line + arrText[n];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (!maxWidth) {
        maxWidth = 300;
      }

      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = arrText[n];
        y += lineHeight as number;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);

    y += lineHeight as number;
  }
}

/**
 * 获取原图坐标下，相对当前图片的偏移值
 * @param coordinate
 * @param currentPos
 * @param zoom
 */
export function getOffsetCoordinate(coordinate: ICoordinate, currentPos: ICoordinate, zoom: number) {
  return {
    x: coordinate.x * zoom + currentPos.x,
    y: coordinate.y * zoom + currentPos.y,
  };
}

// 获取下一次旋转的角度
export function getRotate(rotate: number) {
  if (rotate + 90 >= 360) {
    return rotate + 90 - 360;
  }
  return rotate + 90;
}

// 通过当前的坐标、currentPos、drawOutsideTarget 来判断当前最新的坐标
export function changeDrawOutsideTarget(
  coord: ICoordinate,
  currentPos: ICoordinate,
  imgInfo: ISize,
  drawOutsideTarget?: boolean,
  basicResult?: IRect,
  zoom?: number,
) {
  if (typeof drawOutsideTarget === 'boolean' && !drawOutsideTarget) {
    if (basicResult && zoom) {
      // 存在 basicRect ，则需要在其范围内进行操作
      if (coord.x - currentPos.x > (basicResult.x + basicResult.width) * zoom) {
        coord.x = (basicResult.x + basicResult.width) * zoom + currentPos.x;
      }
      if (coord.x - currentPos.x < basicResult.x * zoom) {
        coord.x = basicResult.x * zoom + currentPos.x;
      }

      if (coord.y - currentPos.y > (basicResult.y + basicResult.height) * zoom) {
        coord.y = (basicResult.y + basicResult.height) * zoom + currentPos.y;
      }
      if (coord.y - currentPos.y < basicResult.y * zoom) {
        coord.y = basicResult.y * zoom + currentPos.y;
      }
    } else {
      // 不可在图片外进行标注， 进行限制。
      if (coord.x - currentPos.x > imgInfo.width) {
        coord.x = imgInfo.width + currentPos.x;
      }
      if (coord.x - currentPos.x < 0) {
        coord.x = currentPos.x;
      }

      if (coord.y - currentPos.y > imgInfo.height) {
        coord.y = imgInfo.height + currentPos.y;
      }
      if (coord.y - currentPos.y < 0) {
        coord.y = currentPos.y;
      }
    }
  }
  return coord;
}

/**
 * 计算坐标点的视窗范围
 * @param array 坐标值数组
 * @returns 视窗范围 { top, left, right, bottom }
 */
export const calcViewportBoundaries = (
  array: ICoordinate[] | undefined,
  isCurve: boolean = false,
  numberOfSegments: number = SEGMENT_NUMBER,
  zoom: number = 1,
) => {
  if (!array) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  const MIN_LENGTH = 20 / zoom;
  const xAxis: number[] = [];
  const yAxis: number[] = [];
  let points = array;
  if (isCurve) {
    points = createSmoothCurvePointsFromPointList(array, numberOfSegments);
  }

  points.forEach(({ x, y }: ICoordinate) => {
    xAxis.push(x);
    yAxis.push(y);
  });

  let minX = Math.min(...xAxis);
  let maxX = Math.max(...xAxis);
  let minY = Math.min(...yAxis);
  let maxY = Math.max(...yAxis);

  const diffX = maxX - minX;
  const diffY = maxY - minY;

  if (diffX < MIN_LENGTH) {
    const addLen = (MIN_LENGTH - diffX) / 2;
    minX -= addLen;
    maxX += addLen;
  }

  if (diffY < MIN_LENGTH) {
    const addLen = (MIN_LENGTH - diffY) / 2;
    minY -= addLen;
    maxY += addLen;
  }

  return {
    top: minY,
    bottom: maxY,
    left: minX,
    right: maxX,
  };
};
