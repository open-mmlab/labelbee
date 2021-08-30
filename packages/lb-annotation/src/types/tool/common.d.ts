declare interface ISize {
  width: number;
  height: number;
}

declare interface ILayout {
  rowNum: number;
  columnNum: number;
  pageSize: number;
}

declare interface ICoordinate {
  x: number;
  y: number;
}

declare interface IPoint {
  x: number;
  y: number;
}

declare interface IStepInfo {
  name: string;
  step: number;
  type: number; // 0：标注， 1：质检
  config: string;
  dataSourceStep: number;
  tool: string;
  tips: string;
  simpleDocument: string;
  progress: number;
  fileCount: number;
}

declare interface IImgInfo {
  id: string;
  path: string;
  url: string;
  processedUrl: string;
  result: string;
  // thumbnail?: string; // 缩略图url
  // preAnnotationJsonUrl?: string; // 预标注数据的文件路径
  // preResult?: string;
}

declare interface IToolConfig {
  showConfirm?: boolean;
}

// 当前canvas的偏移信息
declare interface IOffsetCanvasPosition {
  currentPos: ICoordinate;
  zoom: number;
  rotate: number;
}

/**
 * 矩形范围
 */
declare interface IRectArea {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
