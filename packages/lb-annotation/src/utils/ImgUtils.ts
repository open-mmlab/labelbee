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
