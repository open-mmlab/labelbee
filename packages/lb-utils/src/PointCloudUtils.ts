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
    const pointCloudDataList = data[DEFAULT_STEP]?.result ?? [];

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
}

export default PointCloudUtils;
