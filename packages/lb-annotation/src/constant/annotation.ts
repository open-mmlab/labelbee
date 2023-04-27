export const headerHeight = 61;
export const tipsHeight = 40;
export const footerHeight = 40;
export const sidebarWidth = 240;

/** 标注步骤的类型 */
export enum EStepType {
  ANNOTATION = 1, // 正常标注
  QUALITY_INSPECTION, // 标注质检
  PRE_ANNOTATION, // 预标注
  MANUAL_CORRECTION, // 人工修正
}

/** 标注工具中最大获取的图片数 */
export const ANNOTATION_MAX_SIZE = 1000;

/** 翻页行为 */
export enum EPageOperator {
  Backward,
  Forward,
  JumpSkip,
  None,
}

/** 拖拽状态 */
export enum EDragStatus {
  Start,
  Stop,
  Wait,
  Move,
}

/** 拖拽的内容 */
export enum EDragTarget {
  Point,
  Line,
  Plane,
  Cuboid,
}

/** 顺序 */
export enum ESortDirection {
  ascend, // 升序
  descend, // 降序
}

/** 缩放的模式 */
export enum EGrowthMode {
  Intelligence, // 智能增长
  Linear, // 线性
}

export enum ELang {
  Zh = 'zh_CN',
  US = 'en_US',
}

/**
 * 旋转方向
 */
export enum ERotateDirection {
  Clockwise, // 顺时针
  Anticlockwise, // 逆时针
}

/**
 * 默认多边形文本偏移量
 */
export const DEFAULT_TEXT_OFFSET = {
  offsetX: -10,
  offsetY: -10,
};

/**
 * 默认文本阴影
 */
export const DEFAULT_TEXT_SHADOW = {
  shadowColor: 'rgba(0, 0, 0, 1)',
  shadowOffsetX: 1,
  shadowOffsetY: 1,
  shadowBlur: 0,
};

// 文本展示的偏移
export const TEXT_ATTRIBUTE_OFFSET = {
  x: 8,
  y: 26,
};

export enum ECuboidPlain {
  Front = 'front',
  Back = 'back',
  Side = 'side',
}

export enum ECuboidPosition {
  TL = 'tl',
  TR = 'tr',
  BL = 'bl',
  BR = 'br',
}

export enum ECuboidDirection {
  Front = 'front',
  Back = 'back',
  Left = 'left',
  Right = 'right',
  Top = 'top',
}

export const DIAGONAL_POINT = {
  tl: 'br',
  tr: 'bl',
  br: 'tl',
  bl: 'tr',
};

export enum ECuboidLineDirection {
  Row = 'row',
  Column = 'column',
}

/**
 * Get the Position by the point and direction(Row or Column).
 */
export const CUBOID_ROW = {
  [ECuboidPosition.TL]: ECuboidPosition.TR,
  [ECuboidPosition.TR]: ECuboidPosition.TL,
  [ECuboidPosition.BL]: ECuboidPosition.BR,
  [ECuboidPosition.BR]: ECuboidPosition.BL,
};

export const CUBOID_COLUMN = {
  [ECuboidPosition.TL]: ECuboidPosition.BL,
  [ECuboidPosition.TR]: ECuboidPosition.BR,
  [ECuboidPosition.BL]: ECuboidPosition.TL,
  [ECuboidPosition.BR]: ECuboidPosition.TR,
};
