import { colorArr } from "../constant/color";

interface ICustomColor {
  channel?: number; // 单通道的值
  color?: string; // 传入颜色(传入rbg格式)
}

class ImgConversionUtils {
  /**
   * 获取绘制的mask图片
   * @param color
   * @param imgSrc
   * @param channel
   * @returns
   */

  public static getDrawnMaskImg = (params: {
    imgSrc: string;
    customColor?: ICustomColor[];
  }) => {
    const { imgSrc, customColor } = params;
    const imgNode = new Image();
    imgNode.crossOrigin = "";
    imgNode.src = imgSrc;

    const oldCanvas = document.createElement("canvas");
    const ctx = oldCanvas.getContext("2d")!;
    oldCanvas.width = imgNode.width;
    oldCanvas.height = imgNode.height;
    return new Promise(() => {
      imgNode.onload = () => {
        ctx.drawImage(imgNode, 0, 0, imgNode.width, imgNode.height);
        const imgData = ctx.getImageData(0, 0, imgNode.width, imgNode.height);
        const newCanvas = document.createElement("canvas");
        const newCtx = newCanvas.getContext("2d");
        newCanvas.width = imgNode.width;
        newCanvas.height = imgNode.height;

        if (newCtx) {
          newCtx.fillStyle = "black";
          newCtx.fillRect(0, 0, imgNode.width, imgNode.height);

          for (let i = 0; i < imgData.data.length / 4; i++) {
            const value = imgData.data[i * 4];
            const color = customColor?.find((i) => i?.channel === value)?.color;
            const colorRgb = colorArr[value]?.rgb;
            const r = colorRgb?.r;
            const g = colorRgb?.g;
            const b = colorRgb?.b;
            newCtx.fillStyle = color ? color : `rgb(${r}, ${g}, ${b})`;
            const y = Math.floor(i / imgNode.width);
            const x = Math.floor(i % imgNode.width);
            newCtx.fillRect(x, y, 1, 1);
          }

          const newImgSrc = newCanvas.toDataURL("image/png");
          return newImgSrc;
        }
      };
    });
  };
}

export default ImgConversionUtils;
