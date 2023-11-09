// 编辑步骤的侧边栏宽度
export const editStepWidth = 320;

export enum EPointCloudName {
  /** 点云工具 */
  PointCloud = 'pointCloudTool',
}

export enum EVideoToolName {
  /** 视频文本工具 */
  VideoTextTool = 'videoTextTool',
  /** 视频标签工具 */
  VideoTagTool = 'videoTagTool',
  /** 视频截取工具 */
  VideoClipTool = 'videoClipTool',
}

export enum EAudioToolName {
  /** 音频综合工具 */
  AudioTextTool = 'audioTextTool',
}

/** 新：工具type */
export enum EToolType {
  Rect = 0,
  Tag = 1,
}

export enum EToolName {
  /** 拉框工具 */
  Rect = 'rectTool',
  /** 标签工具 */
  Tag = 'tagTool',
  /** 标点工具 */
  Point = 'pointTool',
  /** 列表标点工具 */
  PointMarker = 'pointMarkerTool',
  /** 前景分割工具 */
  Segmentation = 'segmentationTool',
  /** 筛选工具 */
  Filter = 'filterTool',
  /** 文本工具 */
  Text = 'textTool',
  /** 多边形工具 */
  Polygon = 'polygonTool',
  /** 线条 */
  Line = 'lineTool',
  /** 列表线条工具 */
  LineMarker = 'lineMarkerTool',
  /** 空工具，表示当前没有选择的工具，没有实际的业务逻辑 */
  Empty = 'emptyTool',
  /** 文件夹标签工具 */
  FolderTag = 'folderTagTool',
  /** 拉框跟踪工具 */
  RectTrack = 'rectTrackTool',
  /** 涂抹工具 */
  ScribbleTool = 'scribbleTool',
  /** 人脸106工具 */
  Face = 'faceTool',
  /** 客户端属性工具 */
  ClientAttribute = 'clientAttributeTool',
  /** OCR关联关系工具 */
  OCRRelation = 'OCRRelationTool',
  /** 算法分割辅助工具 */
  SegmentByRect = 'segmentByRectTool',
  /** 立体框工具  */
  Cuboid = 'cuboidTool',
  /** 点云多边形工具 */
  PointCloudPolygon = 'pointCloudPolygon',
  /** LLM标注工具-大模型 */
  LLM = 'LLMTool',
}

export enum ECheckModel {
  Check = 'check',
}

export enum ERectPattern {
  'nothing',
  'RectBG',
  'showOrder',
}

export type ToolName = typeof EToolName | typeof EVideoToolName | typeof EPointCloudName;
export type THybridToolName = EToolName | Array<EToolName>;

export const TOOL_NAME: { [a: string]: string } = {
  [EToolName.Rect]: '拉框',
  [EToolName.Tag]: '标签',
  [EToolName.Point]: '标点',
  [EToolName.PointMarker]: '列表标点',
  [EToolName.Segmentation]: '前景分割',
  [EToolName.Filter]: '筛选',
  [EToolName.Text]: '文本',
  [EToolName.Polygon]: '多边形',
  [EToolName.Line]: '线条',
  [EToolName.LineMarker]: '列表线条',
  [EToolName.FolderTag]: '文件夹标签',
  [EToolName.RectTrack]: '拉框跟踪',
  [EToolName.Face]: '人脸106工具',
  [EToolName.ClientAttribute]: '客户端属性工具',
  [EToolName.OCRRelation]: 'OCR关联关系工具',
  [EToolName.SegmentByRect]: '算法分割辅助工具',
  [EVideoToolName.VideoTextTool]: '视频文本',
  [EVideoToolName.VideoTagTool]: '视频标签',
  [EVideoToolName.VideoClipTool]: '视频截取',
  [EPointCloudName.PointCloud]: '点云',
  [EToolName.Cuboid]: '立体框',
  [EToolName.LLM]: '大模型',
};

export const TOOL_NAME_EN: { [a: string]: string } = {
  [EToolName.Rect]: 'Rect',
  [EToolName.Tag]: 'Tag',
  [EToolName.Point]: 'Point',
  [EToolName.PointMarker]: 'PointMarker',
  [EToolName.Segmentation]: 'Segmentation',
  [EToolName.Filter]: 'Filter',
  [EToolName.Text]: 'Text',
  [EToolName.Polygon]: 'Polygon',
  [EToolName.Line]: 'Line',
  [EToolName.LineMarker]: 'LineMarker',
  [EToolName.FolderTag]: 'FolderTag',
  [EToolName.RectTrack]: 'RectTrack',
  [EToolName.Face]: 'Face',
  [EToolName.ClientAttribute]: 'ClientAttribute',
  [EToolName.OCRRelation]: 'OCRRelation',
  [EToolName.SegmentByRect]: 'SegmentByRect',
  [EVideoToolName.VideoTextTool]: 'VideoTextTool',
  [EVideoToolName.VideoTagTool]: 'VideoTagTool',
  [EVideoToolName.VideoClipTool]: 'VideoClipTool',
  [EPointCloudName.PointCloud]: 'PointCloud',
  [EToolName.Cuboid]: 'Cuboid',
  [EToolName.LLM]: 'LLM',
};

export enum EDependPattern {
  'noDepend' = 1, // 无依赖对象
  'dependOrigin', // 依赖原题
  'dependShape', // 依赖框体
  'dependLine', // 依赖线条
  'dependPolygon', // 依赖多边形
  'dependPreShape' = 101, // 依赖预标注
  'dependPreLine' = 102, // 依赖预标注线条
  'dependPrePolygon' = 103, // 依赖预标注多边形
}

export enum EFilterToolOperation {
  lc = 'leftClick',
  rc = 'rightClick',
  clc = 'ctrlLeftClick',
  crc = 'ctrlRightClick',
}

export const OPERATION_LIST = {
  leftClick: '鼠标左键',
  rightClick: '鼠标右键',
  ctrlLeftClick: 'ctrl + 鼠标左键',
  ctrlRightClick: 'ctrl + 鼠标右键',
};

/** 标注模式 */
export enum EAnnotationMode {
  /** 正常标注 */
  Normal = 1,
  /** 修改标注 */
  Modify,
}

/** 线条类型 */
export enum ELineTypes {
  Line,
  Curve,
}

/** 线条颜色 */
export enum ELineColor {
  SingleColor,
  MultiColor,
}

export enum ESelectedType {
  Form = 1, // 表单模式
  Json, // json 模式
}

export enum EDragTarget {
  Point,
  Line,
  Plane,
}

// 多边形绘制点的形式
export enum EDrawPointPattern {
  None, // 不绘制
  Drawing, // 绘制中， 最后一个点不绘制
  Edit, // 全部进行绘制
}

export enum EPageOperator {
  Backward,
  Forward,
  JumpSkip,
  None,
}

export enum EAuditStatus {
  Wait,
  Pass,
  Fail,
  Loading,
}

// 文本标注类型
export enum ETextType {
  AnyString, // 任意字符
  Order, // 序号
  EnglishOnly, // 仅英文
  NumberOnly, // 仅数字
  CustomFormat, // 自定义文本格式
}

export const TEXT_TYPE = {
  0: '任意字符',
  1: '序号',
  2: '仅英文',
  3: '仅数字',
  // 4: '自定义文本格式',
};

/** 文本标注字数上限 */
export const TEXT_ATTRIBUTE_MAX_LENGTH = 1000;

/** 文本标注的文本高度 */
export const TEXT_ATTRIBUTE_LINE_HEIGHT = 16;

/** 文本默认的最大宽度 */
export const DEFAULT_TEXT_MAX_WIDTH = 300;

export const DEFAULT_FONT = 'normal normal 500 14px Arial';

/** 缩略图下的模式 */
export enum EThumbnailOption {
  ImgList = 1000,
  TrackPrediction,
  ImgSearch,
}

export const CLIENT_TOOL_HEAD_TYPE: { [a: string]: string } = {
  [EPointCloudName.PointCloud]: 'sensebeepc',
  [EToolName.ClientAttribute]: 'sensebeepc-EnumAttributeTool',
  [EToolName.Face]: 'sensebeepc-FacePointsLabellingTool',
  [EToolName.OCRRelation]: 'sensebeepc-OCRRelationTool',
};

export const CLIENT_TOOL_NAME: { [a: string]: string } = {
  [EPointCloudName.PointCloud]: '点云客户端',
  [EToolName.ClientAttribute]: '客户端属性工具',
  [EToolName.Face]: '人脸106点工具',
  [EToolName.OCRRelation]: 'OCR关联关系工具',
};

/** 曲线分割点数 */
export const SEGMENT_NUMBER = 16;

// 边缘吸附的延伸范围
export const edgeAdsorptionScope = 10;

/**
 * 多边形的标注模式
 */
export enum EPolygonPattern {
  Normal,
  Rect,
}

export enum EScribblePattern {
  Scribble = 1, // 涂抹操作
  Erase = 2, // 橡皮刷
}

/**
 * RectOperation - Experimental
 */
export enum EOperationMode {
  General = 1, // Common
  MultiMove = 2, // Experimental
}
