export enum EStepType {
  Check = 0, // 查看模式
  ANNOTATION = 1, // 正常标注
  QUALITY_INSPECTION, // 标注质检
  PRE_ANNOTATION, // 预标注
  MANUAL_CORRECTION, // 人工修正
}

export enum ESubmitType {
  Backward = 1, // 向前翻页
  Forward = 2, // 向后翻页
  Jump = 3, // 分页器的跳页翻页
  Quit = 4, // 左上角后退触发
  Export = 5, // 数据导出时
  StepChanged = 6, // 切换步骤
}
// css 命名前缀
export const prefix = 'bee';
