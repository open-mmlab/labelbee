/**
 * @file PointCloud Utils
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import { IPointCloudBox } from './types/pointCloud';

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

  public static getPolygonListFromResultList(result: string): any[] {
    const data = this.jsonParser(result);

    const DEFAULT_STEP = `step_1`;
    const pointCloudDataList = data?.[DEFAULT_STEP]?.renderPolygon ?? [];

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
}

export default PointCloudUtils;
