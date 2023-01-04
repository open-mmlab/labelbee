/**
 * @file PointCloud Utils
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import { IPolygonData } from './types';
import { IPointCloudBox, IPointCloudConfig } from './types/pointCloud';

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

  public static getBoxParamsFromResultList(result: string): IPointCloudBox[] {
    const data = this.jsonParser(result);

    const DEFAULT_STEP = `step_1`;
    const pointCloudDataList = data?.[DEFAULT_STEP]?.result ?? [];

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

  public static getPolygonListFromResultList(result: string): any[] {
    const data = this.jsonParser(result);

    const DEFAULT_STEP = `step_1`;

    /**
     * Notice.
     *
     * It needs to be compatible with the error data structure(`renderPolygon`), `resultPolygon` is the correct one.
     */
    const pointCloudDataList =
      data?.[DEFAULT_STEP]?.resultPolygon ?? data?.[DEFAULT_STEP]?.renderPolygon ?? [];

    return pointCloudDataList;
  }

  public static getFrontViewPolygon(boxParams: IPointCloudBox) {
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

  public static getBackViewPolygon(boxParams: IPointCloudBox) {
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

  public static getAllDirectionLine(boxParams: IPointCloudBox) {
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
  public static getAllViewData(boxParams: IPointCloudBox) {
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
      height: boxParams.depth,
      length: boxParams.width,
      width: boxParams.height,
      rotation_y: this.transferRotation2KittiRotation_y(boxParams.rotation),
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
   * @param param0
   * @returns
   */
  public static getAllPointCloudResult({
    imgList,
    step = 1,
    extraBoxList,
    ignoreIndexList = [],
  }: {
    imgList: Array<{ result: string }>;
    step?: number;
    extraBoxList: IPointCloudBox[];
    ignoreIndexList?: number[];
  }) {
    const resultList = imgList
      .filter((_, i) => !ignoreIndexList?.includes(i))
      .map((v) => this.jsonParser(v.result));
    const DEFAULT_STEP_NAME = `step_${step}`;

    let boxList: IPointCloudBox[] = [];

    resultList.forEach((result) => {
      if (result?.[DEFAULT_STEP_NAME]?.['result']?.length > 0) {
        boxList = boxList.concat(result[DEFAULT_STEP_NAME]['result']);
      }
    });

    if (extraBoxList) {
      boxList = boxList.concat(extraBoxList);
    }

    return boxList;
  }

  public static getNextTrackID({
    imgList,
    step = 1,
    extraBoxList,
  }: {
    imgList: Array<{ result: string }>;
    step?: number;
    extraBoxList: IPointCloudBox[];
  }) {
    let trackID = 1;
    const boxList = this.getAllPointCloudResult({ imgList, step, extraBoxList });

    boxList.forEach((data: IPointCloudBox) => {
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
      const DEFAULT_STEP_NAME = `step_${1}`;
      const originResult = this.jsonParser(imgInfo.result);
      const dataList = originResult?.[DEFAULT_STEP_NAME]?.result; // PointCloudData1

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
}

export default PointCloudUtils;
