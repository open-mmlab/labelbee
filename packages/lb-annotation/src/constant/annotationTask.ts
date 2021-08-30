export const ANNOTATION_TYPE: { [a: number]: string } = {
  0: '目标检测',
  1: '图像分类',
};
export const ANNOTATION_STATUS: { [a: number]: string } = {
  0: '标注文件传输中',
  1: '标注文件传输重试',
  2: '标注文件传输失败',
  3: '标注中',
  4: '任务终止',
  5: '任务完成',
  6: '数据已发布',
};

/** 标注任务的状态 */
export enum EAnnotationStatus {
  Upload,
  UploadRetry,
  UploadFail,
  Annotation,
  Terminated,
  Finish,
  Publish,
}
