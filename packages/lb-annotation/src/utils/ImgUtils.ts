export default class ImgUtils {
  public static load(src: string) {
    return new Promise((resolve, reject) => {
      const imgNode = new Image();
      imgNode.src = src;
      imgNode.onload = () => {
        resolve(imgNode);
      };

      imgNode.onerror = () => {
        reject(imgNode);
      };
    });
  }
}
