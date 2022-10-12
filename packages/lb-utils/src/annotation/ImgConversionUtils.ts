/**
 * @file Image Conversion Utils
 * @createDate 2022-08-08
 * @author Ron <ron.f.luo@gmail.com>
 */
import { colorArr } from "../constant/color";
import MathUtils from "./MathUtils";

interface ICustomColor {
  channel?: number; // 单通道的值
  color?: string; // 传入颜色(传入rbg格式)
  rgb?: {
    r: number;
    g: number;
    b: number;
  };
}

interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

class ImgConversionUtils {
  public static createCanvas(imgNode: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = imgNode.width;
    canvas.height = imgNode.height;
    const ctx = canvas.getContext("2d")!;
    return { canvas, ctx };
  }

  public static createImgDom(src: string): Promise<HTMLImageElement> {
    const imgNode = new Image();
    imgNode.crossOrigin = "Anonymous";
    imgNode.src = src;

    return new Promise((resolve) => {
      imgNode.onload = () => {
        resolve(imgNode);
      };
      imgNode.onerror = (e) => {
        console.error(e);
      };
    });
  }

  public static nextTick = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
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
    backgroundColor = "rgb(0, 0, 0)",
    hiddenUndefinedColor = false,
  }: {
    renderCanvas: HTMLCanvasElement;
    imgData: ImageData;
    imgNode: HTMLImageElement;
    customColor?: ICustomColor[];
    backgroundColor?: string;
    hiddenUndefinedColor?: boolean;
  }) {
    const ctx = renderCanvas.getContext("2d");

    if (ctx) {
      // 1. The default background color is black.
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, imgNode.width, imgNode.height);

      /**
       * 2. Traversing image pixels
       *
       * If no color is set then the default color is drawn (From 'constant/color', But is can be hidden by hiddenUndefinedColor)
       */
      const getColor = ({ r }: IColor) => {
        const colorByCustom = customColor?.find((i) => i?.channel === r)?.color; // use r to
        if (hiddenUndefinedColor === true && !colorByCustom) {
          return "";
        }
        return colorByCustom || colorArr[r].hexString;
      };

      ImgConversionUtils.renderPixelByImgData({
        ctx,
        imgData,
        size: imgNode,
        getColor,
      });

      // 3. Export Img
      const newImgSrc = renderCanvas.toDataURL("image/png");
      return newImgSrc;
    }
  }

  /**
   * Render Single Channel Mask by Color Img.
   * @param param0
   * @returns
   */
  public static renderMaskByColor({
    renderCanvas,
    imgData,
    imgNode,
    customColor,
    backgroundColor = "rgb(0, 0, 0)",
  }: {
    renderCanvas: HTMLCanvasElement;
    imgData: ImageData;
    imgNode: HTMLImageElement;
    customColor?: ICustomColor[];
    backgroundColor?: string;
  }) {
    const ctx = renderCanvas.getContext("2d");
    if (ctx) {
      // 1. The default background color is black.
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, imgNode.width, imgNode.height);

      /**
       * 2. Traversing image pixels
       *
       * If no color is set then the default color is drawn (From 'constant/color'
       */
      const getColor = ({ r, g, b }: IColor) => {
        let color = "";

        customColor?.some((v) => {
          if (v.rgb) {
            const scope = 2;

            // If pixel edge is the same with the customColor with the scope of 2.
            if (
              r >= v.rgb.r - scope &&
              r <= v.rgb.r + scope &&
              g >= v.rgb.g - scope &&
              g <= v.rgb.g + scope &&
              b >= v.rgb.b - scope &&
              b <= v.rgb.b + scope
            ) {
              color = `rgb(${v.channel},${v.channel},${v.channel})`;
              return true;
            }
            return false;
          }
        });
        return color;
      };
      ImgConversionUtils.renderPixelByImgData({
        ctx,
        imgData,
        size: imgNode,
        getColor,
      });

      // 3. Export Img
      const newImgSrc = renderCanvas.toDataURL("image/png");
      return newImgSrc;
    }
  }

  /**
   * Traversing image pixels
   *
   * If no color is set then the default color is drawn (From 'constant/color', But is can be hidden by hiddenUndefinedColor)
   * @param ctx
   * @param imgData
   * @param size
   * @param getColor
   */
  public static renderPixelByImgData({
    ctx,
    imgData,
    size,
    getColor,
  }: {
    ctx: CanvasRenderingContext2D;
    imgData: ImageData;
    size: { width: number; height: number };
    getColor: ({ r, g, b, a }: IColor) => string;
  }) {
    for (let i = 0; i < imgData.data.length / 4; i++) {
      const index = i * 4;
      const r = imgData.data[index];
      const g = imgData.data[index + 1];
      const b = imgData.data[index + 2];
      const a = imgData.data[index + 3];

      const color = getColor({ r, g, b, a });
      if (!color) {
        continue;
      }
      ctx.fillStyle = color;
      const x = Math.floor(i % size.width);
      const y = Math.floor(i / size.width);
      ctx.fillRect(x, y, 1, 1);
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
    backgroundColor?: string;
    hiddenUndefinedColor?: boolean;
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

      const { canvas: renderCanvas, ctx: renderCtx } =
        this.createCanvas(imgNode);

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
      const imgData = basicCtx.getImageData(
        0,
        0,
        imgNode.width,
        imgNode.height
      );
      const newImgSrc = this.renderColorByMask({
        renderCanvas,
        imgData,
        imgNode,
        customColor,
        backgroundColor: params.backgroundColor,
        hiddenUndefinedColor,
      });
      return newImgSrc;
    } catch (e) {
      console.error("Failed to load image");
    }
  };

  /**
   * Transfer ColorMask to Gray-scale Mask.
   *
   * 1. Clear the border sub pixel.
   * 2.
   * @param colorMaskBase64
   * @param colorMapping
   */
  public static getMaskByColorImg = async ({
    maskSrc,
    customColor,
  }: {
    maskSrc: string;
    customColor: ICustomColor[];
  }) => {
    try {
      const imgNode = await ImgConversionUtils.createImgDom(maskSrc);
      const { ctx: basicCtx } = this.createCanvas(imgNode);
      basicCtx.drawImage(imgNode, 0, 0, imgNode.width, imgNode.height);

      const { canvas: renderCanvas } = this.createCanvas(imgNode);

      /**
       * imgData requires delayed fetching.
       */
      await this.nextTick();
      const imgData = basicCtx.getImageData(
        0,
        0,
        imgNode.width,
        imgNode.height
      );
      const newImgSrc = this.renderMaskByColor({
        renderCanvas,
        imgData,
        imgNode,
        customColor,
      });
      return newImgSrc;
    } catch (e) {
      console.error("Failed to load image");
    }
  };
}

export default ImgConversionUtils;
