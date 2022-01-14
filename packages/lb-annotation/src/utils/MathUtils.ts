/**
 * 各类的数学运算
 */

import { DEFAULT_FONT, DEFAULT_TEXT_MAX_WIDTH, SEGMENT_NUMBER } from '@/constant/tool';
import { createSmoothCurvePointsFromPointList } from './tool/polygonTool';
import Vector from './VectorUtils';

export default class MathUtils {
  /**
   * 是否在指定范围内
   * @param value 需要判断的值
   * @param range 范围
   * @returns {boolean} 是否在范围内
   */
  public static isInRange = (value: number | number[], range: number[]) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    const inRange = (v: number) => v <= max && v >= min;
    const values = Array.isArray(value) ? value : [value];
    return values.every((v: number) => inRange(v));
  };

  /**
   * 限制点在范围，返回
   * @param value
   * @param range
   * @returns {ICoordinate} 在范围内的点
   */
  public static withinRange = (value: number, range: number[]) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    if (value > max) {
      return max;
    }
    if (value < min) {
      return min;
    }
    return value;
  };

  // 获取下一次旋转的角度
  public static getRotate(rotate: number) {
    if (rotate + 90 >= 360) {
      return rotate + 90 - 360;
    }
    return rotate + 90;
  }

  public static getLineLength(point1: ICoordinate, point2: ICoordinate) {
    return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
  }

  /**
   * 计算坐标点的视窗范围
   * @param array 坐标值数组
   * @returns 视窗范围 { top, left, right, bottom }
   */
  public static calcViewportBoundaries = (
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

  /**
   *  获取当前左边举例线段的最短路径，建议配合 isHoverLine 使用
   *
   * @export
   * @param {ICoordinate} pt
   * @param {ICoordinate} begin
   * @param {ICoordinate} end
   * @param {boolean} ignoreRatio
   * @returns
   */
  public static getFootOfPerpendicular = (
    pt: ICoordinate, // 直线外一点
    begin: ICoordinate, // 直线开始点
    end: ICoordinate,
    /* 使用坐标范围 */
    useAxisRange = false,
  ) => {
    // 直线结束点
    let retVal: any = { x: 0, y: 0 };

    const dx = begin.x - end.x;
    const dy = begin.y - end.y;
    if (Math.abs(dx) < 0.00000001 && Math.abs(dy) < 0.00000001) {
      retVal = begin;
      return retVal;
    }

    let u = (pt.x - begin.x) * (begin.x - end.x) + (pt.y - begin.y) * (begin.y - end.y);
    u /= dx * dx + dy * dy;

    retVal.x = begin.x + u * dx;
    retVal.y = begin.y + u * dy;

    const length = this.getLineLength(pt, retVal);
    const ratio = 2;

    const fromX = Math.min(begin.x, end.x);
    const toX = Math.max(begin.x, end.x);
    const fromY = Math.min(begin.y, end.y);
    const toY = Math.max(begin.y, end.y);

    /** x和y坐标都超出范围内 */
    const allAxisOverRange = !(this.isInRange(pt.x, [fromX, toX]) || this.isInRange(pt.y, [fromY, toY]));

    /** x或y坐标超出范围 */
    const someAxisOverRange = pt.x > toX + ratio || pt.x < fromX - ratio || pt.y > toY + ratio || pt.y < fromY - ratio;

    const isOverRange = useAxisRange ? allAxisOverRange : someAxisOverRange;

    if (isOverRange) {
      return {
        footPoint: retVal,
        length: Infinity,
      };
    }

    return {
      footPoint: retVal,
      length,
    };
  };

  /**
   * 获取当前文本的背景面积
   * @param canvas
   * @param text
   * @param maxWidth
   * @param lineHeight
   * @returns
   */
  public static getTextArea(
    canvas: HTMLCanvasElement,
    text: string,
    maxWidth: number = DEFAULT_TEXT_MAX_WIDTH,
    font = DEFAULT_FONT,
    lineHeight?: number,
  ) {
    if (typeof text !== 'string') {
      return {
        width: 0,
        height: 0,
      };
    }

    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    context.font = font;

    let height = 0;

    if (typeof lineHeight === 'undefined') {
      lineHeight =
        (canvas && parseInt(window.getComputedStyle(canvas).lineHeight, 10)) ||
        parseInt(window.getComputedStyle(document.body).lineHeight, 10);
    }

    const fontHeight: number =
      (canvas && parseInt(window.getComputedStyle(canvas).fontSize, 10)) ||
      parseInt(window.getComputedStyle(document.body).fontSize, 10) ||
      0;

    const arrParagraph = text.split('\n');

    let lineWidth = 0; // 最大长度定位

    for (let i = 0; i < arrParagraph.length; i++) {
      // 字符分隔为数组
      const arrText = arrParagraph[i].split('');
      let line = '';

      for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = context.measureText(testLine);
        const textWidth = metrics.width;

        if (textWidth > maxWidth && n > 0) {
          line = arrText[n];
          height += lineHeight;
          lineWidth = maxWidth;
        } else {
          line = testLine;

          if (textWidth > lineWidth) {
            lineWidth = textWidth;
          }
        }
      }

      if (i !== arrParagraph.length - 1) {
        height += lineHeight;
      }
    }

    return {
      width: lineWidth,
      height: height + fontHeight,
      lineHeight,
      fontHeight,
    };
  }

  /**
   * 获取线条中心点
   * @param line
   * @returns
   */
  public static getLineCenterPoint(line: [ICoordinate, ICoordinate]) {
    const [p1, p2] = line;

    const vector = Vector.getVector(p1, p2);

    return {
      x: p1.x + vector.x / 2,
      y: p1.y + vector.y / 2,
    };
  }
}
