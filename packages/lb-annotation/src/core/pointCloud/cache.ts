/**
 * @file Cache the data that PointCloud can share
 * @createDate 2022-07-26
 * @author Ron <ron.f.luo@gmail.com>
 */

import { PCDLoader } from './PCDLoader';

type TCacheInfo = {
  src: string;
};

export class PointCloudCache {
  public pcdLoader: PCDLoader;

  public MAX_SIZE: number = 50; // Tetatively set at 50.

  private pointsMap: Map<string, Float32Array>;

  private colorMap: Map<string, Float32Array>;

  private cacheList: Array<TCacheInfo> = [];

  private static instance: PointCloudCache;

  private constructor() {
    this.pcdLoader = new PCDLoader();
    this.pointsMap = new Map();
    this.colorMap = new Map();
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new PointCloudCache();
    }
    return this.instance;
  }

  /**
   * Directly update the color of PointCloud
   * @param src
   * @param color
   */
  public updateColor(src: string, color: Float32Array) {
    this.colorMap.set(src, color);
  }

  public loadPCDFile = (src: string): Promise<{ points: Float32Array; color: Float32Array }> => {
    return new Promise((resolve, reject) => {
      const clonePoints = this.pointsMap.get(src);
      const cloneColor = this.colorMap.get(src);

      // Cached
      if (clonePoints && cloneColor) {
        resolve({ points: clonePoints, color: cloneColor });
        return;
      }

      /**
       * Garbage Collection.
       * If it exceeds the MAX_SIZE, clear the first one.(FIFO)
       */
      if (this.cacheList.length > this.MAX_SIZE) {
        const firstCacheInfo = this.cacheList.shift();
        if (firstCacheInfo) {
          this.pointsMap.delete(firstCacheInfo.src);
        }
      }

      this.cacheList.push({ src });
      this.pcdLoader.load(
        src,
        (points: any) => {
          const pointsArray = points.geometry.attributes.position.array;
          const colorArray = points.geometry.attributes.color.array;
          this.pointsMap.set(src, pointsArray);
          this.colorMap.set(src, colorArray);
          resolve({ points: pointsArray, color: colorArray });
        },
        () => {},
        (err: string) => {
          reject(err);
        },
      );
    });
  };
}
