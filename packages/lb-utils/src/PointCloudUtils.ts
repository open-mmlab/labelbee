/**
 * @file PointCloud Utils
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

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
}

export default PointCloudUtils;
