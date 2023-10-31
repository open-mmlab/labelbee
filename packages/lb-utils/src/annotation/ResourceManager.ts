/**
 * ResourceManager.
 *
 * FeatureList:
 * 1. Preload resource. (Include img.)
 *
 * TODO:
 * 1. Preload Data by resource size.
 *
 */

const DEFAULT_CACHE_SIZE = 2;

class ResourceManager {
  public cacheMap: Map<string, boolean>;
  public size: number;

  constructor({ size = DEFAULT_CACHE_SIZE }: { size?: number } = { size: DEFAULT_CACHE_SIZE }) {
    this.cacheMap = new Map();
    this.size = size;
  }

  public fetchResource(url: string) {
    if (this.cacheMap.has(url)) {
      return;
    }

    fetch(url).then(() => {
      this.cacheMap.set(url, true);
    });
  }

  public preloadResourceList(urlList: string[]) {
    urlList.forEach((url) => {
      this.fetchResource(url);
    });
  }

  /**
   * Just use index & imgList to preload all data.
   * @param param0
   */
  public quickPreload({
    currentIndex,
    imgList,
    size = DEFAULT_CACHE_SIZE,
  }: {
    currentIndex: number;
    imgList: Array<{ url: string; webPointCloudFile?: { lidar: { url: string } } }>;
    size?: number;
  }) {
    const urlList = this.getResourceList({ currentIndex, imgList, size });
    this.preloadResourceList(urlList);
  }

  /**
   * Quick get the list of resource urls
   *
   * @param currentIndex
   * @param imgList TODO: Need to define the imgList for more file type(Such as Img、Video...)
   * @returns
   */
  public getResourceList({
    currentIndex,
    imgList,
    size = this.size,
  }: {
    currentIndex: number;
    imgList: Array<{ url: string; webPointCloudFile?: { lidar: { url: string } } }>;
    size?: number;
  }) {
    if (currentIndex + 1 >= imgList.length) {
      return [];
    }

    let urlList: string[] = [];
    const withInRange = (index: number) => index >= 0 && index < imgList.length;

    /**
     * The previous {size} and the next {size}
     */
    for (let i = 1; i <= size; i += 1) {
      [currentIndex - i, currentIndex + i].forEach((i: number) => {
        if (withInRange(i)) {
          const newUrlList = this.processResourceUrl(imgList[i]);

          urlList = [...urlList, ...newUrlList];
        }
      });
    }

    return urlList;
  }

  /**
   * Unified Resource Acquisition
   * @param imgInfo TODO: Need to Define
   */
  public processResourceUrl(imgInfo: any = {}) {
    const urlList = [];
    // Img Url.
    if (imgInfo?.url) {
      urlList.push(imgInfo.url);
    }

    // PointCloud-PCD
    const lidarUrl = imgInfo?.webPointCloudFile?.lidar?.url;
    if (lidarUrl) {
      urlList.push(lidarUrl);
    }
    return urlList;
  }
}

const resourceManagerInstance = new ResourceManager();

export { ResourceManager, resourceManagerInstance };
