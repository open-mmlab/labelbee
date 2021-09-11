/**
 * 各类的数学运算
 */

import { SEGMENT_NUMBER } from '@/constant/tool';
import { createSmoothCurvePointsFromPointList } from './tool/polygonTool';

export default class MathUtils {
  // 获取下一次旋转的角度
  public static getRotate(rotate: number) {
    if (rotate + 90 >= 360) {
      return rotate + 90 - 360;
    }
    return rotate + 90;
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
}
