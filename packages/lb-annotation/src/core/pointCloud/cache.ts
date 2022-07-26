/**
 * @file Cache the data that PointCloud can share
 * @createDate 2022-07-26
 * @author Ron <ron.f.luo@gmail.com>
 */

import { PCDLoader } from './PCDLoader';

export class PointCloudCache {
  public pcdLoader: PCDLoader;

  private pointsMap: Map<string, THREE.Points>;

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
