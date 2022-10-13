/**
 * @file Image Conversion Utils
 * @createDate 2022-08-08
 * @author Ron <ron.f.luo@gmail.com>
 */
import { colorArr } from "../constant/color";

/**
 * Notice！！
 * 
 * The number is from 0 to 255. Alpha is also in [0, 255]. It needs to distinguish it from rgba (a in rgba is [0 ,1])
 */
interface IColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ICustomColor {
  channel?: number; // Single Channel Value.
  color?: string; // You can use color to define it like 'red' | 'blue'
  rgba?: IColorRGBA; // Priority over color.
}

const BLACK_BACKGROUND_RGBA = { 
  r: 0,
  g: 0,
  b: 0,
  a: 255
}

const BLACK_BACKGROUND_RGBA_WITH_OPACITY = { 
  r: 0,
  g: 0,
  b: 0,
  a: 125
}

const TRANSPARENCY_BACKGROUND_RGBA = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
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
    customColor,
    hiddenUndefinedColor = false,
    backgroundRGBA = BLACK_BACKGROUND_RGBA_WITH_OPACITY,
    basicImgCanvas
  }: {
    renderCanvas: HTMLCanvasElement;
    imgData: ImageData;
    imgNode: HTMLImageElement;
    customColor?: ICustomColor[];
    hiddenUndefinedColor?: boolean;
    backgroundRGBA: IColorRGBA,
    basicImgCanvas?: HTMLCanvasElement
  }) {
    const ctx = renderCanvas.getContext("2d");

    if (ctx) {
      /**
       * 1. Traversing image pixels
       *
       * If no color is set then the default color is drawn (From 'constant/color', But is can be hidden by hiddenUndefinedColor)
       */
      const opacity = 0.3;
      const getColor = ({ r }: IColorRGBA) => {
        const colorByCustom = customColor?.find((i) => i?.channel === r)?.rgba; // use r to
        if (hiddenUndefinedColor === true && !colorByCustom) {
          return undefined;
        }
        return colorByCustom ?? {
          ...colorArr[r].rgb,
          a: Math.floor(255 * opacity),
        };
      };

      ImgConversionUtils.renderPixelByImgData({
        ctx,
        imgData,
        getColor,
        originBackgroundRGBA:  BLACK_BACKGROUND_RGBA,
        backgroundRGBA
      });

      if (basicImgCanvas) {
        const basicCtx = basicImgCanvas.getContext('2d');
        if (basicCtx) {
          basicCtx.drawImage(renderCanvas, 0, 0);
          return basicImgCanvas.toDataURL("image/png");
        }
      }

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
    backgroundRGBA = BLACK_BACKGROUND_RGBA
  }: {
    renderCanvas: HTMLCanvasElement;
    imgData: ImageData;
    imgNode: HTMLImageElement;
    customColor?: ICustomColor[];
    backgroundRGBA?: IColorRGBA
  }) {
    const ctx = renderCanvas.getContext("2d");
    if (ctx) {
      /**
       * Traversing image pixels
       *
       * If no color is set then the default color is drawn (From 'constant/color'
       */
      const getColor = ({ r, g, b }: IColorRGBA) => {
        let color = undefined;

        customColor?.some((v) => {
          if (v.rgba) {
            const scope = 2;

            // If pixel edge is the same with the customColor with the scope of 2.
            if (
              r >= v.rgba.r - scope &&
              r <= v.rgba.r + scope &&
              g >= v.rgba.g - scope &&
              g <= v.rgba.g + scope &&
              b >= v.rgba.b - scope &&
              b <= v.rgba.b + scope
            ) {
              color = {
                r: v.channel,
                g: v.channel,
                b: v.channel,
                a: 255,
              }
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
        getColor,
        originBackgroundRGBA: TRANSPARENCY_BACKGROUND_RGBA,
        backgroundRGBA,
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
    getColor,

    originBackgroundRGBA,
    backgroundRGBA
  }: {
    ctx: CanvasRenderingContext2D;
    imgData: ImageData;
    getColor: ({ r, g, b, a }: IColorRGBA) => IColorRGBA | undefined;
    
    originBackgroundRGBA: IColorRGBA
    backgroundRGBA: IColorRGBA
  }) {
    for (let i = 0; i < imgData.data.length / 4; i++) {
      const index = i * 4;
      const r = imgData.data[index];
      const g = imgData.data[index + 1];
      const b = imgData.data[index + 2];
      const a = imgData.data[index + 3];

      
      
      const color = getColor({ r, g, b, a });

      const isOriginBackground = originBackgroundRGBA.r === r &&  originBackgroundRGBA.g === g && originBackgroundRGBA.b === b && originBackgroundRGBA.a === a
      // If it is originBackgroundRGBA. It needs to update to backgroundRGBA
      if (isOriginBackground || !color) {
        imgData.data[index] =  backgroundRGBA.r;
        imgData.data[index + 1] = backgroundRGBA.g;
        imgData.data[index + 2] = backgroundRGBA.b;
        imgData.data[index + 3] = backgroundRGBA.a;
        continue;
      }
      
      imgData.data[index] = color.r;
      imgData.data[index + 1] = color.g;
      imgData.data[index + 2] = color.b;
      imgData.data[index + 3] = color.a;
    }
    ctx.putImageData(imgData, 0, 0);
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
    backgroundRGBA: IColorRGBA;
    hiddenUndefinedColor?: boolean;
  }) => {
    const {
      maskSrc,
      customColor,
      basicImgSrc,
      hiddenUndefinedColor = false,
      backgroundRGBA
    } = params;
    try {
      const imgNode = await this.createImgDom(maskSrc);
      const { canvas: maskCanvas, ctx: basicCtx } = this.createCanvas(imgNode);
      basicCtx.drawImage(imgNode, 0, 0, imgNode.width, imgNode.height);

      const { canvas: basicImgCanvas, ctx: basicImgRenderCtx } =
        this.createCanvas(imgNode);

      /**
       * Rendering the underlying image by the way
       */
      if (basicImgSrc) {
        const basicImg = await this.createImgDom(basicImgSrc);
        basicImgRenderCtx.drawImage(basicImg, 0, 0);
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
        renderCanvas: maskCanvas,
        imgData,
        imgNode,
        customColor,
        hiddenUndefinedColor,
        basicImgCanvas,
        backgroundRGBA,
      });


      return newImgSrc;
    } catch (e) {
      console.error("Failed to load image", e);
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
