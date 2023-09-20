export default class ImgUtils {
  public static load(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const imgNode = new Image();

      imgNode.crossOrigin = 'anonymous';

      // 暂时判断 file 协议的路径进行 encode 操作
      if (src.startsWith('file')) {
        imgNode.src = encodeURI(src);
      } else {
        imgNode.src = src;
      }

      imgNode.onload = () => {
        resolve(imgNode);
      };

      imgNode.onerror = () => {
        reject(imgNode);
      };
    });
  }
}

/**
 * Creates a new canvas, crops and enlarges an existing canvas, draws the cropped and enlarged image onto the new canvas,
 * and returns the data URL of the new canvas.
 *
 * @param {HTMLCanvasElement} canvas - The original canvas to be cropped and enlarged
 * @param {number} width - The width of the area to be cropped from the center of the original canvas
 * @param {number} height - The height of the area to be cropped from the center of the original canvas
 * @param {number} scale - The amount by which to enlarge the cropped area
 * @returns {string} - A data URL of the cropped and enlarged image
 */
const cropAndEnlarge = (canvas: HTMLCanvasElement, width: number, height: number, scale: number): string => {
  if (!canvas) {
    return '';
  }
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  // Calculate starting coordinates for cropping
  const sx = centerX - width / 2;
  const sy = centerY - height / 2;

  // Create a new canvas for the cropped and enlarged image
  const newCanvas = document.createElement('canvas');
  newCanvas.width = width * scale;
  newCanvas.height = height * scale;

  // Draw the cropped and enlarged image onto the new canvas
  const newCtx = newCanvas.getContext('2d');
  newCtx?.drawImage(canvas, sx, sy, width, height, 0, 0, width * scale, height * scale);

  // Convert the new canvas to a data URL and return it
  return newCanvas.toDataURL();
};

export { cropAndEnlarge };
