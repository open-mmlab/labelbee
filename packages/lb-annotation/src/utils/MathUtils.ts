/**
 * 各类的数学运算
 */

// eslint-disable-next-line
import MathUtilsWorker from 'web-worker:./MathUtilsWorker.js';
import { I3DSpaceCoord, IBasicLine, IBasicPoint, IPointCloudBox, TAnnotationViewData } from '@labelbee/lb-utils';
import { DEFAULT_FONT, DEFAULT_TEXT_MAX_WIDTH, ELineTypes, SEGMENT_NUMBER } from '@/constant/tool';
import { IPolygonData, IPolygonPoint } from '@/types/tool/polygon';
import { TIndexMap } from '@/core/pointCloud/cache';
import { createSmoothCurvePointsFromPointList, isInPolygon } from './tool/polygonTool';
import PolygonUtils from './tool/PolygonUtils';
import Vector from './VectorUtils';
/**
 * 基础的三角运算
 */
export class Trigonometric {
  public static tanAPlusB(tanA: number, tanB: number) {
    return (tanA + tanB) / (1 - tanA * tanB);
  }

  public static sinAPlusB(sinA: number, cosA: number, sinB: number, cosB: number) {
    return cosB * sinA + cosA * sinB;
  }

  public static cosAPlusB(sinA: number, cosA: number, sinB: number, cosB: number) {
    return cosA * cosB - sinA * sinB;
  }
}

enum CubePosition {
  Outside = 0,
  PartiallyInside = 1,
  FullyInside = 2,
}

function getCubePosition(polygon: IPolygonPoint[], zScope: [number, number], smallCube: Cube): CubePosition {
  // 计算小立方体的8个顶点
  const smallCubeVertices: I3DSpaceCoord[] = [
    {
      x: smallCube.x - smallCube.width / 2,
      y: smallCube.y - smallCube.height / 2,
      z: smallCube.z - smallCube.depth / 2,
    },
    {
      x: smallCube.x + smallCube.width / 2,
      y: smallCube.y - smallCube.height / 2,
      z: smallCube.z - smallCube.depth / 2,
    },
    {
      x: smallCube.x - smallCube.width / 2,
      y: smallCube.y + smallCube.height / 2,
      z: smallCube.z - smallCube.depth / 2,
    },
    {
      x: smallCube.x + smallCube.width / 2,
      y: smallCube.y + smallCube.height / 2,
      z: smallCube.z - smallCube.depth / 2,
    },
    {
      x: smallCube.x - smallCube.width / 2,
      y: smallCube.y - smallCube.height / 2,
      z: smallCube.z + smallCube.depth / 2,
    },
    {
      x: smallCube.x + smallCube.width / 2,
      y: smallCube.y - smallCube.height / 2,
      z: smallCube.z + smallCube.depth / 2,
    },
    {
      x: smallCube.x - smallCube.width / 2,
      y: smallCube.y + smallCube.height / 2,
      z: smallCube.z + smallCube.depth / 2,
    },
    {
      x: smallCube.x + smallCube.width / 2,
      y: smallCube.y + smallCube.height / 2,
      z: smallCube.z + smallCube.depth / 2,
    },
  ];

  // 计算在大立方体内的顶点数量
  let insideCount = 0;
  for (let i = 0; i < smallCubeVertices.length; i++) {
    // eslint-disable-next-line
    if (MathUtils.isPointInsideCube(smallCubeVertices[i], polygon, zScope)) {
      insideCount++;
    }
  }

  // 根据在大立方体内的顶点数量返回结果
  if (insideCount === 0) {
    return CubePosition.Outside; // 所有顶点都在大立方体外
  }
  if (insideCount === 8) {
    return CubePosition.FullyInside; // 所有顶点都在大立方体内
  }
  return CubePosition.PartiallyInside; // 部分顶点在大立方体内，部分顶点在大立方体外
}

interface Cube {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

interface ICalculatePointsInsideBoxParams {
  indexMap: TIndexMap;
  polygon: IPolygonPoint[];
  zScope: [number, number];
  box: IPointCloudBox;
}

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
    allowOverRange = false,
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

    if (!allowOverRange && isOverRange) {
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

  /**
   * 获取线条的垂线
   * @param line
   * @returns
   */
  public static getPerpendicularLine(line: ICoordinate[]) {
    if (line.length !== 2) {
      return undefined;
    }

    const [p1, p2] = line;

    const p3 = {
      x: p2.x + p2.y - p1.y,
      y: p2.y - (p2.x - p1.x),
    };

    return [p2, p3];
  }

  /**
   * 获取当前垂直于直线的最后一个点的垂线点
   * @param line
   * @param coordinate
   * @returns
   */
  public static getPerpendicularFootOfLine(line: ICoordinate[], coordinate: ICoordinate) {
    if (line.length !== 2) {
      return line;
    }

    const perpendicularLine = this.getPerpendicularLine(line);
    if (!perpendicularLine) {
      return line;
    }

    const [begin, end] = perpendicularLine;

    return this.getFootOfPerpendicular(coordinate, begin, end).footPoint;
  }

  /**
   * 从正三角形获取正四边形
   * @param triangle
   * @returns
   */
  public static getQuadrangleFromTriangle(triangle: ICoordinate[]) {
    if (triangle.length !== 3) {
      return triangle;
    }

    const [p1, p2, p3] = triangle;

    const p4 = {
      x: p3.x + p1.x - p2.x,
      y: p3.y + p1.y - p2.y,
    };
    return [p1, p2, p3, p4];
  }

  /**
   * 矩形拖动线，实现横向的扩大缩小
   * @param dragStartCoord
   * @param currentCoord
   * @param basicLine
   * @returns
   */
  public static getRectPerpendicularOffset(
    dragStartCoord: ICoordinate,
    currentCoord: ICoordinate,
    basicLine: [ICoordinate, ICoordinate],
  ) {
    const [p1, p2] = basicLine;
    const footer1 = this.getFootOfPerpendicular(dragStartCoord, p1, p2).footPoint;
    const footer2 = this.getFootOfPerpendicular(currentCoord, p1, p2).footPoint;

    // 数值计算
    const offset = {
      x: footer1.x - footer2.x,
      y: footer1.y - footer2.y,
    };

    const newPoint = Vector.add(currentCoord, offset);
    const vector3 = Vector.getVector(dragStartCoord, newPoint);

    return vector3;
  }

  /**
   * 获取当前真实 Index
   * @param index
   * @param len
   * @returns
   */
  public static getArrayIndex(index: number, len: number) {
    if (index < 0) {
      return len + index;
    }
    if (index >= len) {
      return index - len;
    }
    return index;
  }

  /**
   * 在矩形点集拖动一个点时，需要进行一直维持矩形
   * @param pointList
   * @param changePointIndex
   * @param offset
   * @returns
   */
  public static getPointListFromPointOffset(
    pointList: [ICoordinate, ICoordinate, ICoordinate, ICoordinate],
    changePointIndex: number,
    offset: ICoordinate,
  ) {
    const prePointIndex = this.getArrayIndex(changePointIndex - 1, pointList.length);
    const nextPointIndex = this.getArrayIndex(changePointIndex + 1, pointList.length);
    const originIndex = this.getArrayIndex(changePointIndex - 2, pointList.length);

    const newPointList = [...pointList];
    newPointList[changePointIndex] = Vector.add(newPointList[changePointIndex], offset);

    const newFooter1 = this.getFootOfPerpendicular(
      newPointList[changePointIndex],
      newPointList[originIndex],
      newPointList[prePointIndex],
    ).footPoint;

    const newFooter2 = this.getFootOfPerpendicular(
      newPointList[changePointIndex],
      newPointList[nextPointIndex],
      newPointList[originIndex],
    ).footPoint;

    newPointList[prePointIndex] = newFooter1;
    newPointList[nextPointIndex] = newFooter2;

    return newPointList;
  }

  /**
   * 获取矩形框旋转中心
   * @param rectPointList
   * @returns
   */
  public static getRectCenterPoint(rectPointList: [ICoordinate, ICoordinate, ICoordinate, ICoordinate]) {
    const [p1, , p3] = rectPointList;

    return {
      x: (p1.x + p3.x) / 2,
      y: (p1.y + p3.y) / 2,
    };
  }

  /**
   * 获取按指定的 angle 旋转的角度后的矩形
   * @param rotate
   * @param rectPointList
   * @returns
   */
  public static rotateRectPointList(angle = 5, rectPointList: [ICoordinate, ICoordinate, ICoordinate, ICoordinate]) {
    const centerPoint = this.getRectCenterPoint(rectPointList);
    const { PI } = Math;
    const sinB = Math.sin((angle * PI) / 180);
    const cosB = Math.cos((angle * PI) / 180);
    return rectPointList.map((point) => {
      const vector = Vector.getVector(centerPoint, point);
      const len = Vector.len(vector);
      const sinA = vector.y / len;
      const cosA = vector.x / len;

      return {
        x: len * Trigonometric.cosAPlusB(sinA, cosA, sinB, cosB) + centerPoint.x,
        y: len * Trigonometric.sinAPlusB(sinA, cosA, sinB, cosB) + centerPoint.y,
      };
    });
  }

  /**
   * 通过当前坐标 + 已知两点获取正多边形
   * @param coordinate
   * @param pointList
   * @returns
   */
  public static getRectangleByRightAngle(coordinate: ICoordinate, pointList: IPolygonPoint[]) {
    if (pointList.length !== 2) {
      return pointList;
    }
    const newPoint = MathUtils.getPerpendicularFootOfLine(pointList, coordinate);
    return MathUtils.getQuadrangleFromTriangle([...pointList, newPoint]);
  }

  /**
   * Get the radius from quadrangle under top-view
   *
   * Return Range  [0 , 2PI]
   * @param points
   * @returns
   */
  public static getRadiusFromQuadrangle(points: [ICoordinate, ICoordinate, ICoordinate, ICoordinate]) {
    const [, point2, point3] = points;

    const y = point3.y - point2.y;
    const x = point2.x - point3.x;

    const len = this.getLineLength(point2, point3);

    const cosX = y / len;

    const radius = Math.acos(cosX);

    // Key Point
    if (x > 0) {
      return Math.PI * 2 - radius;
    }

    return radius;
  }

  /**
   * Rewrite the CollectionPoint Calculation (Diff`from getCollectionPointByAnnotationData)
   * @param annotations
   * @returns
   */
  public static getCollectionPointByAnnotationDataPromise(annotations: TAnnotationViewData[]) {
    const points = annotations.filter((v) => v.type === 'point').map((v) => v.annotation) as IBasicPoint[];
    const backgroundList = annotations
      .filter((v) => {
        if (['polygon', 'line'].includes(v.type)) {
          return true;
        }
        return false;
      })
      .map((v) => {
        if (v.type === 'polygon') {
          return {
            ...v.annotation,
            pointList: PolygonUtils.concatBeginAndEnd(v.annotation.pointList),
          };
        }

        return v.annotation;
      }) as IBasicLine[];

    const mathUtilsWorker = new MathUtilsWorker();

    return {
      promise: new Promise(function collectionPromise(resolve) {
        mathUtilsWorker.postMessage({ points, backgroundList });
        mathUtilsWorker.onmessage = (e: any) => {
          resolve(e.data);
          mathUtilsWorker.terminate();
        };
      }),
      close: () => {
        mathUtilsWorker.terminate();
      },
    };
  }

  public static getCollectionPointByAnnotationData(annotations: TAnnotationViewData[]) {
    const connectionPoints: ICoordinate[] = [];
    const cacheSet = new Set<string>();

    const points = annotations.filter((v) => v.type === 'point').map((v) => v.annotation) as IBasicPoint[];
    const backgroundList = annotations
      .filter((v) => {
        if (['polygon', 'line'].includes(v.type)) {
          return true;
        }
        return false;
      })
      .map((v) => {
        if (v.type === 'polygon') {
          return {
            ...v.annotation,
            pointList: PolygonUtils.concatBeginAndEnd(v.annotation.pointList),
          };
        }

        return v.annotation;
      }) as IBasicLine[];

    const judgeIsConnectPoint = (point: ICoordinate, polygonList: Array<any | IPolygonData>) => {
      const { dropFoot } = PolygonUtils.getClosestPoint(point, polygonList, ELineTypes.Line, 1, { isClose: false });

      if (dropFoot !== point) {
        const s = `${dropFoot.x} + ${dropFoot.y}`;
        // Filter the same point.
        if (!cacheSet.has(s)) {
          connectionPoints.push(point);
        }

        cacheSet.add(s);
      }
    };

    // Point & BackgroundList;
    points.forEach((point) => {
      judgeIsConnectPoint(point, backgroundList);
    });

    backgroundList.forEach((v) => {
      let traverseID = '';
      traverseID = v.id;

      backgroundList.forEach((annotation, i) => {
        if (annotation.id === traverseID) {
          return;
        }

        const newPolygonList = [...backgroundList];
        newPolygonList.splice(i, 1);

        annotation.pointList.forEach((point) => {
          judgeIsConnectPoint(point, newPolygonList);
        });
      });
    });
    return { connectionPoints };
  }

  /**
   * Calculate new coordinates by given new length and width
   * @param coordinates
   * @param newWidth
   * @param newHeight
   */
  public static getModifiedRectangleCoordinates(coordinates: ICoordinate[], newWidth: number, newHeight: number) {
    if (coordinates.length !== 4) {
      throw new Error('Invalid number of coordinates. Four coordinates are required.');
    }

    const fixedPoint = coordinates[0];
    const secondPoint = coordinates[1];
    const thirdPoint = coordinates[2];

    // Calculate the original length and width
    const originalWidth = Math.sqrt((secondPoint.x - fixedPoint.x) ** 2 + (secondPoint.y - fixedPoint.y) ** 2);
    const originalHeight = Math.sqrt((thirdPoint.x - secondPoint.x) ** 2 + (thirdPoint.y - secondPoint.y) ** 2);

    // Calculate scaling factors for new length and width
    const lengthScaleFactor = newWidth / originalWidth;
    const widthScaleFactor = newHeight / originalHeight;

    const newSecondPoint = {
      x: fixedPoint.x + (secondPoint.x - fixedPoint.x) * lengthScaleFactor,
      y: fixedPoint.y + (secondPoint.y - fixedPoint.y) * lengthScaleFactor,
    };

    const newThirdPoint = {
      x: newSecondPoint.x + (thirdPoint.x - secondPoint.x) * widthScaleFactor,
      y: newSecondPoint.y + (thirdPoint.y - secondPoint.y) * widthScaleFactor,
    };

    const newFourthPoint = {
      x: fixedPoint.x + (newThirdPoint.x - secondPoint.x),
      y: fixedPoint.y + (newThirdPoint.y - secondPoint.y),
    };

    return [fixedPoint, newSecondPoint, newThirdPoint, newFourthPoint];
  }

  public static calculatePointsInsideBox = (params: ICalculatePointsInsideBoxParams) => {
    const { indexMap, polygon, zScope, box } = params;

    let count = 0;

    indexMap.forEach((point, key) => {
      const keyArr = key.split('@');
      const cubicX = Number(keyArr[0]);
      const cubicY = Number(keyArr[1]);
      const cubicZ = Number(keyArr[2]);

      const smallCube = { x: cubicX - 0.5, y: cubicY - 0.5, z: cubicZ - 0.5, width: 1, height: 1, depth: 1 };

      const cubePosition = getCubePosition(polygon, zScope, smallCube);

      if (cubePosition === CubePosition.FullyInside) {
        count += point.length;
      }

      if (
        cubePosition === CubePosition.PartiallyInside ||
        (cubePosition === CubePosition.Outside && (box.width <= 1 || box.height <= 1))
      ) {
        point.forEach((p) => {
          if (MathUtils.isPointInsideCube(p, polygon, zScope)) {
            count++;
          }
        });
      }
    });

    return count;
  };

  public static isPointInsideCube(point: I3DSpaceCoord, polygon: IPolygonPoint[], zScope: [number, number]): boolean {
    const [zMin, zMax] = zScope;

    const inPolygon = isInPolygon({ x: point.x, y: point.y }, polygon);

    if (inPolygon && point.z >= zMin && point.z <= zMax) {
      return true;
    }
    return false;
  }
}
