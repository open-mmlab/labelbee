/**
 * @file Image Conversion Utils
 * @createDate 2022-08-08
 * @author Ron <ron.f.luo@gmail.com>
 */
import { colorArr } from '../constant/color';

interface ICustomColor {
  channel?: number; // 单通道的值
  color?: string; // 传入颜色(传入rbg格式)
}

class ImgConversionUtils {
  public static createCanvas(imgNode: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgNode.width;
    canvas.height = imgNode.height;
    const ctx = canvas.getContext('2d')!;
    return { canvas, ctx };
  }

  public static createImgDom(src: string): Promise<HTMLImageElement> {
    const imgNode = new Image();
    imgNode.crossOrigin = 'Anonymous';
    imgNode.src = src;

    return new Promise((resolve) => {
      imgNode.onload = () => {
        resolve(imgNode);
      };
    });
  }

  public static nextTick = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      });
    });
  };

  /**
   * Extract single channel mask to render random colors
   * @param param0
   * @returns
   */
  public static renderColorByMask({
    renderCanvas,
    imgData,
    imgNode,
    customColor,
    hiddenUndefinedColor,
  }: {
    renderCanvas: HTMLCanvasElement;
    imgData: ImageData;
    imgNode: HTMLImageElement;
    customColor?: ICustomColor[];
    hiddenUndefinedColor?: boolean; // If the color of CustomColor isn't set, it will be backgroundColor.
  }) {
    const ctx = renderCanvas.getContext('2d');

    if (ctx) {
      // 1. The default background color is black.
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, imgNode.width, imgNode.height);

      /**
       * 2. Traversing image pixels
       *
       * If no color is set then the default color is drawn (From 'constant/color')
       */
      for (let i = 0; i < imgData.data.length / 4; i++) {
        const value = imgData.data[i * 4];
        const colorByCustom = customColor?.find((i) => i?.channel === value)?.color;

        if (!colorByCustom && hiddenUndefinedColor === true) {
          continue;
        }

        ctx.fillStyle = colorByCustom || colorArr[value].hexString;
        const x = Math.floor(i % imgNode.width);
        const y = Math.floor(i / imgNode.width);
        ctx.fillRect(x, y, 1, 1);
      }
      const newImgSrc = renderCanvas.toDataURL('image/png');

      return newImgSrc;
    }
  }

  /**
   * Obtaining a color map from a single channel image
   * @param params
   * @returns
   */
  public static getColorMapBySingleChannelMask = async (params: {
    maskSrc: string;
    basicImgSrc?: string;
    customColor?: ICustomColor[];
    opacity?: number;
    hiddenUndefinedColor?: boolean; // If the color of CustomColor isn't set, it will be backgroundColor.
  }) => {
    const {
      maskSrc,
      customColor,
      basicImgSrc,
      opacity = 0.3,
      hiddenUndefinedColor = false,
    } = params;
    try {
      const imgNode = await this.createImgDom(maskSrc);
      const { ctx: basicCtx } = this.createCanvas(imgNode);
      basicCtx.drawImage(imgNode, 0, 0, imgNode.width, imgNode.height);

      const { canvas: renderCanvas, ctx: renderCtx } = this.createCanvas(imgNode);

      /**
       * Rendering the underlying image by the way
       */
      if (basicImgSrc) {
        const basicImg = await this.createImgDom(basicImgSrc);
        renderCtx.drawImage(basicImg, 0, 0);

        // It needs to set transparency.
        renderCtx.globalAlpha = opacity;
      }

      /**
       * imgData requires delayed fetching.
       */
      await this.nextTick();
      const imgData = basicCtx.getImageData(0, 0, imgNode.width, imgNode.height);
      const newImgSrc = this.renderColorByMask({
        renderCanvas,
        imgData,
        imgNode,
        customColor,
        hiddenUndefinedColor,
      });
      return newImgSrc;
    } catch (e) {
      console.error('Failed to load image');
    }
  };
}

export default ImgConversionUtils;
