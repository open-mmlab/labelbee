export default class ImgUtils {
  public static load(src: string){
    return new Promise((resolve, reject) => {
      const imgNode = new Image();
      // TODO 暂时加入 encodeURI， 需要测试线上环境是否 ok
      imgNode.src = encodeURI(src);
      imgNode.onload = () => {
        resolve(imgNode);
      };

      imgNode.onerror = () => {
        reject();
      };
    })
  }
}