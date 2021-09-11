/**
 * 图像初始化相关函数的
 */

export default class ImgPosUtils {
  /**
   * 初始化图片在页面中的大小
   * @param canvasSize
   * @param imgSize
   * @param rotate
   * @param zoomRatio
   * @param isOriginalSize
   */
  public static getInitImgPos(canvasSize: ISize, imgSize: ISize, rotate = 0, zoomRatio = 1, isOriginalSize = false) {
    // rotate 仅在 90 270 中判断
    if (rotate === 90 || rotate === 270) {
      imgSize = {
        width: imgSize.height,
        height: imgSize.width,
      };
    }

    const wScale = (canvasSize.width * zoomRatio) / imgSize.width;
    const hScale = (canvasSize.height * zoomRatio) / imgSize.height;

    let scale = isOriginalSize ? 1 : Math.min(wScale, hScale);
    const currentPos = {
      x: (canvasSize.width - imgSize.width * scale) / 2,
      y: (canvasSize.height - imgSize.height * scale) / 2,
    };

    const width = imgSize.width * scale;
    const height = imgSize.height * scale;

    if (isOriginalSize) {
      scale = 1;
    }

    return {
      zoom: scale,
      currentPos,
      imgInfo: { width, height },
    };
  }

  // 获取底层依赖矩形的 currentPos
  public static getBasicRecPos(
    imgNode: any,
    basicRect: IRect,
    size: { width: number; height: number },
    shrinkRatio: number = 0.9,
    zoomRatio: number = 1,
    isOriginalSize: boolean = false,
  ) {
    if (basicRect && imgNode) {
      const { x, y, height, width } = basicRect;
      // 获取矩形框与 canvas size 的比例
      let initZoom = size.height / height;

      if (width / height > size.width / size.height) {
        // 说明是长扁形
        initZoom = size.width / width;
      }

      const zoom = isOriginalSize ? 1 : initZoom * shrinkRatio * zoomRatio;

      const viewCenter = {
        x: size.width / 2,
        y: size.height / 2,
      };

      const imgCenter = {
        x: (x + width / 2) * zoom,
        y: (y + height / 2) * zoom,
      };

      const currentPos = {
        x: viewCenter.x - imgCenter.x,
        y: viewCenter.y - imgCenter.y,
      };

      return {
        currentPos,
        innerZoom: zoom,
      };
    }
    return false;
  }
}
