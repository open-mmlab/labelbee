/**
 * @file PointCloud Utils
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import { IPointCloudBox, IPointCloudConfig, IPointCloudSphere } from './types/pointCloud';
import { ICoordinate, ISize } from './types/common';
import { IBasicBox3d } from './types';

export const POINT_CLOUD_DEFAULT_STEP = `step_1`;

class PointCloudUtils {
  public static genColorByCoord(x: number, y: number, z: number) {
    if (z <= 0) {
      return [128, 128, 128];
    }

    if (z < 5) {
      return [255, 0, 0];
    }

    if (z < 10) {
      return [0, 255, 0];
    }

    return [0, 0, 255];
  }

  public static getStandardColorByCoord(x: number, y: number, z: number) {
    const pdColor = this.genColorByCoord(x, y, z);
    return pdColor.map((hex) => hex / 255);
  }

  /**
   * TE
   * @param content
   * @param defaultValue
   * @returns
   */
  public static jsonParser = (content: any) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return {};
    }
  };

  public static parsePointCloudCurrentResult(result: string) {
    const data = this.jsonParser(result);

    const ptResult = data?.[POINT_CLOUD_DEFAULT_STEP] ?? {};

    const boxParamsList = ptResult?.result ?? [];
    /**
     * Notice.
     *
     * It needs to be compatible with the error data structure(`renderPolygon`), `resultPolygon` is the correct one.
     */
    const polygonList = ptResult?.resultPolygon ?? ptResult?.renderPolygon ?? [];
    const lineList = ptResult?.resultLine ?? [];
    const sphereParamsList = ptResult?.resultPoint ?? [];
    const segmentation = ptResult?.segmentation ?? [];
    const rectList = ptResult?.resultRect ?? [];

    return {
      boxParamsList,
      polygonList,
      lineList,
      sphereParamsList,
      segmentation,
      rectList,
    };
  }

  public static getBoxParamsFromResultList(result: string): IPointCloudBox[] {
    const data = this.jsonParser(result);

    const pointCloudDataList = data?.[POINT_CLOUD_DEFAULT_STEP]?.result ?? [];

    return pointCloudDataList;
  }

  public static getSphereParamsFromResultList(result: string): IPointCloudSphere[] {
    const data = this.jsonParser(result);

    const pointCloudDataList = data?.[POINT_CLOUD_DEFAULT_STEP]?.resultPoint ?? [];

    return pointCloudDataList;
  }

  public static getSegmentFromResultList(result: string) {
    const data = this.jsonParser(result);

    const pointCloudDataList = data?.[POINT_CLOUD_DEFAULT_STEP]?.segmentation ?? [];

    return pointCloudDataList;
  }

  /**
   * Get the coordinate from canvas2d-coordinate to world coordinate
   */
  public static transferCanvas2World = (
    currentPos: { x: number; y: number },
    size: { width: number; height: number },
  ) => {
    const { width: w, height: h } = size;
    const { x, y, ...otherProps } = currentPos;

    // x-Axis is the Positive Direction, so the x-coordinates need to be swapped with the y-coordinates
    return {
      x: -y + h / 2,
      y: -(x - w / 2),
      ...otherProps,
    };
  };

  public static pointListTransferCanvas2World = (
    pointList: { x: number; y: number }[] | undefined,
    size: { width: number; height: number },
  ) => {
    return pointList?.map((i) => ({ ...i, ...this.transferCanvas2World(i, size) }));
  };

  /**
   * Get the coordinate from canvas2d-coordinate to world coordinate
   */
  public static transferWorld2Canvas = (
    currentPos: { x: number; y: number },
    size: { width: number; height: number },
  ) => {
    const { width: w, height: h } = size;
    const { x, y, ...otherProps } = currentPos;

    // x-Axis is the Positive Direction, so the x-coordinates need to be swapped with the y-coordinates
    return {
      x: -y + w / 2,
      y: -x + h / 2,
      ...otherProps,
    };
  };

  public static getLineListFromResultList(result: string): any[] {
    const data = this.jsonParser(result);

    const pointCloudDataList = data?.[POINT_CLOUD_DEFAULT_STEP]?.resultLine ?? [];

    return pointCloudDataList;
  }

  public static getPolygonListFromResultList(result: string): any[] {
    const data = this.jsonParser(result);

    /**
     * Notice.
     *
     * It needs to be compatible with the error data structure(`renderPolygon`), `resultPolygon` is the correct one.
     */
    const pointCloudDataList =
      data?.[POINT_CLOUD_DEFAULT_STEP]?.resultPolygon ??
      data?.[POINT_CLOUD_DEFAULT_STEP]?.renderPolygon ??
      [];

    return pointCloudDataList;
  }

  public static getFrontViewPolygon(boxParams: IPointCloudBox | IBasicBox3d) {
    const {
      center: { x, y, z },
      width,
      height,
      depth,
    } = boxParams;

    return [
      {
        x: x + width / 2,
        y: y + height / 2,
        z: z - depth / 2,
      },
      {
        x: x + width / 2,
        y: y + height / 2,
        z: z + depth / 2,
      },
      {
        x: x + width / 2,
        y: y - height / 2,
        z: z + depth / 2,
      },
      {
        x: x + width / 2,
        y: y - height / 2,
        z: z - depth / 2,
      },
      {
        x: x + width / 2,
        y: y + height / 2,
        z: z - depth / 2,
      },
    ];
  }

  public static getBackViewPolygon(boxParams: IPointCloudBox | IBasicBox3d) {
    const {
      center: { x, y, z },
      width,
      height,
      depth,
    } = boxParams;

    return [
      {
        x: x - width / 2,
        y: y - height / 2,
        z: z - depth / 2,
      },
      {
        x: x - width / 2,
        y: y + height / 2,
        z: z - depth / 2,
      },
      {
        x: x - width / 2,
        y: y + height / 2,
        z: z + depth / 2,
      },
      {
        x: x - width / 2,
        y: y - height / 2,
        z: z + depth / 2,
      },
      {
        x: x - width / 2,
        y: y - height / 2,
        z: z - depth / 2,
      },
    ];
  }

  public static getAllDirectionLine(boxParams: IPointCloudBox | IBasicBox3d) {
    const {
      center: { x, y, z },
      width,
      height,
      depth,
    } = boxParams;

    return [
      [
        {
          x: x + width / 2,
          y: y - height / 2,
          z: z - depth / 2,
        },
        {
          x: x - width / 2,
          y: y - height / 2,
          z: z - depth / 2,
        },
      ],
      [
        {
          x: x + width / 2,
          y: y + height / 2,
          z: z - depth / 2,
        },
        {
          x: x - width / 2,
          y: y + height / 2,
          z: z - depth / 2,
        },
      ],
      [
        {
          x: x + width / 2,
          y: y - height / 2,
          z: z + depth / 2,
        },
        {
          x: x - width / 2,
          y: y - height / 2,
          z: z + depth / 2,
        },
      ],
      [
        {
          x: x + width / 2,
          y: y + height / 2,
          z: z + depth / 2,
        },
        {
          x: x - width / 2,
          y: y + height / 2,
          z: z + depth / 2,
        },
      ],
    ];
  }

  /**
   * Get the set of viewData of the cube
   * 2 plane && 4 line
   * @param boxParams
   * @returns
   */
  public static getAllViewData(boxParams: IPointCloudBox | IBasicBox3d) {
    const {
      center: { x, y, z },
      width,
      height,
      depth,
    } = boxParams;
    return [
      {
        type: 'polygon',
        pointList: this.getFrontViewPolygon(boxParams),
      },
      {
        type: 'polygon',
        pointList: this.getBackViewPolygon(boxParams),
      },
      ...this.getAllDirectionLine(boxParams).map((v) => ({
        type: 'line',
        pointList: v,
      })),
    ];
  }

  /**
   * Transform Box to Kitti format.
   *
   * Kitti format Information
   * 1. Position.
   *
   * height: The height of car
   * length: It means the Length of car front facing
   * width: It means the car's width;
   *
   * 2. rotate
   *
   * rotation_y:
   *
   *
   * 3. Link
   * https://blog.csdn.net/Solomon1558/article/details/70173223
   * @param boxParams
   * @returns
   */
  public static transferBox2Kitti(boxParams: IPointCloudBox) {
    return {
      height: boxParams.depth ?? 0,
      length: boxParams.width ?? 0,
      width: boxParams.height ?? 0,
      rotation_y: boxParams.rotation
        ? this.transferRotation2KittiRotation_y(boxParams.rotation)
        : 0,
    };
  }

  /**
   * Restrict angle range to [0 - 2PI]
   * @param rotation
   */
  public static restrictAngleRange(rotation: number) {
    const standardRange = Math.PI * 2;
    let updatedRotation = rotation % standardRange;

    if (updatedRotation < 0) {
      return standardRange + updatedRotation;
    }

    return updatedRotation;
  }

  /**
   * rotation range = [0, 2Pi]
   * kitti rotation_y range = [-PI, PI]
   * @param rotation
   */
  public static transferRotation2KittiRotation_y(rotation: number) {
    if (rotation < 0) {
      return -rotation;
    }

    const newRotation = 2 * Math.PI - rotation;

    if (newRotation > Math.PI && newRotation < 2 * Math.PI) {
      return -1 * rotation;
    }

    return 2 * Math.PI - rotation;
  }

  /**
   * Get the pointCloud result from imgList
   *
   * Application Scenarios:
   * 1. Retrieving basic information such as TrackID.
   * @param param0
   * @returns
   */
  public static getAllPointCloudResult({
    imgList,
    step = 1,
    extraBoxList,
    extraSphereList = [],
    ignoreIndexList = [],
    isPreResult = false,
  }: {
    imgList: Array<{ result: string; preResult?: string }>;
    step?: number;
    extraBoxList: IPointCloudBox[];
    extraSphereList?: IPointCloudSphere[];
    ignoreIndexList?: number[];
    isPreResult?: boolean;
  }) {
    const resultList = imgList
      .filter((_, i) => !ignoreIndexList?.includes(i))
      .map((v) => this.jsonParser(v?.[isPreResult ? 'preResult' : 'result'] ?? ''));
    const DEFAULT_STEP_NAME = `step_${step}`;

    let boxList: Array<IPointCloudBox | IPointCloudSphere> = [];

    resultList.forEach((result) => {
      if (result?.[DEFAULT_STEP_NAME]?.['result']?.length > 0) {
        boxList = boxList.concat(result[DEFAULT_STEP_NAME]['result']);
      }
    });

    if (extraBoxList) {
      boxList = boxList.concat(extraBoxList);
    }

    if (extraSphereList) {
      boxList = boxList.concat(extraSphereList);
    }

    return boxList;
  }

  public static getIndexByTrackID(
    id: number,
    imgList: Array<{ result?: string }>,
    isPreResult: boolean,
  ) {
    const arr: number[] = [];
    // 解析字符串
    const resultList = imgList.map((v: any) =>
      this.jsonParser(v?.[isPreResult ? 'preResult' : 'result'] ?? ''),
    );

    const DEFAULT_STEP_NAME = `step_1`;

    resultList.forEach((result: any, index: number) => {
      const boxes = result?.[DEFAULT_STEP_NAME]?.['result'];
      if (boxes?.length > 0) {
        const box = boxes?.find((v: any) => v?.trackID === id);
        if (box) {
          arr.push(index);
        }
      }
    });

    return arr;
  }

  public static getNextTrackID({
    imgList,
    step = 1,
    extraBoxList,
    extraSphereList,
  }: {
    imgList: Array<{ result: string }>;
    step?: number;
    extraBoxList: IPointCloudBox[];
    extraSphereList?: IPointCloudSphere[];
  }) {
    let trackID = 1;
    const boxList = this.getAllPointCloudResult({ imgList, step, extraBoxList, extraSphereList });

    boxList.forEach((data: IPointCloudBox | IPointCloudSphere) => {
      if (typeof data?.trackID === 'number' && data.trackID >= trackID) {
        trackID = data.trackID + 1;
      }
    });

    return trackID;
  }

  public static batchUpdateTrackID({
    id,
    newID,
    result,
    step = 1,
  }: {
    id: number;
    newID: number;
    result?: string;
    step?: number;
  }) {
    const DEFAULT_STEP_NAME = `step_${step}`;
    const originResult = this.jsonParser(result);
    const dataList = originResult?.[DEFAULT_STEP_NAME]?.result; // PointCloudData1

    if (!dataList) {
      return result;
    }

    dataList.forEach((v: IPointCloudBox) => {
      if (v?.trackID === id) {
        // Side Effect Update
        v.trackID = newID;
      }

      return v;
    });

    return JSON.stringify(originResult);
  }

  public static batchUpdateTrackIDCheck({
    newID,
    result,
    step = 1,
  }: {
    newID: number;
    result?: string;
    step?: number;
  }) {
    const DEFAULT_STEP_NAME = `step_${step}`;
    const originResult = this.jsonParser(result);
    const dataList = originResult?.[DEFAULT_STEP_NAME]?.result;

    if (!dataList) {
      return false;
    }

    return dataList.some((v: IPointCloudBox) => v.trackID === newID);
  }

  public static batchUpdateResultByTrackID({
    id,
    newData,
    result,
    step = 1,
  }: {
    id: number;
    newData: Partial<IPointCloudBox>;
    result?: string;
    step?: number;
  }) {
    const DEFAULT_STEP_NAME = `step_${step}`;
    const originResult = this.jsonParser(result);
    const dataList = originResult?.[DEFAULT_STEP_NAME]?.result; // PointCloudData1

    if (!dataList) {
      return result;
    }

    originResult[DEFAULT_STEP_NAME].result = dataList.map((v: IPointCloudBox) => {
      if (v?.trackID === id) {
        // SubAttribute needs to be incremental updating.

        const updateResult = {
          ...newData,
        };
        const newSubAttribute = updateResult.subAttribute;

        if (newSubAttribute && v.subAttribute) {
          Object.assign(updateResult, { subAttribute: { ...v.subAttribute, ...newSubAttribute } });
        }

        return {
          ...v,
          ...updateResult,
        };
      }

      return v;
    });

    return JSON.stringify(originResult);
  }

  public static getMaxSizeFromBox({
    trackID,
    imgList,
  }: {
    trackID: number;
    imgList: Array<{ result: string }>;
  }) {
    let basicSize: { width: number; height: number; depth: number } | undefined = undefined;

    imgList.forEach((imgInfo) => {
      const originResult = this.jsonParser(imgInfo.result);
      const dataList = originResult?.[POINT_CLOUD_DEFAULT_STEP]?.result; // PointCloudData1

      if (!dataList) {
        return;
      }

      dataList.forEach((v: IPointCloudBox) => {
        if (v?.trackID === trackID) {
          if (!basicSize) {
            basicSize = {
              width: v.width,
              height: v.height,
              depth: v.depth,
            };
            return;
          }

          if (v.width > basicSize.width) {
            basicSize.width = v.width;
          }

          if (v.height > basicSize.height) {
            basicSize.height = v.height;
          }

          if (v.depth > basicSize.depth) {
            basicSize.depth = v.depth;
          }
        }
      });
    });

    return basicSize;
  }

  public static getSubAttributeName(
    subAttribute: { [key: string]: string },
    config: IPointCloudConfig,
  ) {
    const subAttributeList = config.inputList;
    return Object.entries(subAttribute).map(([label, value]) => {
      const data = subAttributeList.find((v) => v.value === label);
      if (data) {
        const subValue = data?.subSelected?.find((v) => v.value === value);

        if (subValue) {
          return {
            label: data.key,
            value: subValue.key,
          };
        }
      }
      return {
        label,
        value,
      };
    });
  }

  /**
   * Get intersection coordinates by slope
   * @param p1  A point on line
   * @param line1  A line parallel to p1
   * @param p2  A point on line
   * @param line2  A line parallel to p2
   */
  static getIntersectionBySlope(params: {
    p1: ICoordinate;
    line1: [ICoordinate, ICoordinate];
    p2: ICoordinate;
    line2: [ICoordinate, ICoordinate];
  }) {
    const { p1, line1, p2, line2 } = params;
    if (p1.x === p2.x && p1.y === p2.y) {
      return p1;
    }

    let x, y;
    // When the line is parallel to the coordinate axis
    if (line1[0].x === line1[1].x) {
      x = p1.x;
    }
    if (line1[0].y === line1[1].y) {
      y = p1.y;
    }
    if (line2[0].x === line2[1].x) {
      x = p2.x;
    }
    if (line2[0].y === line2[1].y) {
      y = p2.y;
    }

    const k1 = (line1[0].y - line1[1].y) / (line1[0].x - line1[1].x);
    const k2 = (line2[0].y - line2[1].y) / (line2[0].x - line2[1].x);

    x = x ?? (p1.y - p2.y - k1 * p1.x + k2 * p2.x) / (k2 - k1);
    y = y ?? p1.y - k1 * (p1.x - x);

    return { x, y };
  }

  public static getCloudKeys(x: number, y: number, z: number) {
    return [x, y, z].join('@');
  }

  public static splitPointsFromIndexes(originIndexes: number[], splitIndexes: number[]) {
    const splitSet = new Set();
    for (let i = 0; i < splitIndexes.length; i += 1) {
      splitSet.add(splitIndexes[i]);
    }

    const result = [];
    for (let i = 0; i < originIndexes.length; i += 1) {
      if (!splitSet.has(originIndexes[i])) {
        result.push(originIndexes[i]);
      }
    }

    return result;
  }

  public static splitPointsFromPoints(originPoints: Float32Array, splitPoints: Float32Array) {
    const splitMap = new Map();
    for (let i = 0; i < splitPoints.length; i += 3) {
      splitMap.set(
        PointCloudUtils.getCloudKeys(splitPoints[i], splitPoints[i + 1], splitPoints[i + 2]),
        1,
      );
    }

    const result = [];
    for (let i = 0; i < originPoints.length; i += 3) {
      const key = PointCloudUtils.getCloudKeys(
        originPoints[i],
        originPoints[i + 1],
        originPoints[i + 2],
      );
      if (!splitMap.has(key)) {
        result.push(originPoints[i], originPoints[i + 1], originPoints[i + 2]);
      }
    }

    return new Float32Array(result);
  }

  public static getDefaultOrthographicParams(size: ISize) {
    return {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 0.1, // Must more than 0.
      far: 10000, // Need to set to a larger range, in conjunction with the camera's position on the z-axis.
    };
  }
}

export default PointCloudUtils;
