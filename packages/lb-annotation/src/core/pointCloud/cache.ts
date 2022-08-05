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

  private pointsMap: Map<string, THREE.Points>;

  private cacheList: Array<TCacheInfo> = [];

  private static instance: PointCloudCache;

  private constructor() {
    this.pcdLoader = new PCDLoader();
    this.pointsMap = new Map();
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new PointCloudCache();
    }
    return this.instance;
  }

  public loadPCDFile = (src: string) => {
    return new Promise((resolve, reject) => {
      // Cached
      if (this.pointsMap.get(src)) {
        const clonePoints = this.pointsMap.get(src)?.clone();

        resolve(clonePoints);
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
          this.pointsMap.set(src, points.clone());
          resolve(points);
        },
        () => {},
        (err: string) => {
          reject(err);
        },
      );
    });
  };
}
