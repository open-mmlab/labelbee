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
  Save = 7, // 点击保存
  BatchUpdateTrackID = 8, // 批量更改 TrackID (PointCloud)
  BatchUpdateImgList = 9, // 批量更改 ImgList (PointCloud)
  SyncImgList = 10001, // 仅更改数据
  SyncCurrentPageData = 10002, // 同步当页数据
}
// css 命名前缀
export const prefix = 'bee';
export const componentCls = `${prefix}-component`;

// 数据格式类型
export enum EDataFormatType {
  Default = 'default', // 原文
  Markdown = 'markdown', // markdown
}

// LLM工具的数据类型
export enum ELLMDataType {
  Picture = 'picture',
  Text = 'text',
  None = 'none',
}
