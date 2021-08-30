export const headerHeight = 61;
export const tipsHeight = 40;
export const footerHeight = 40;
export const sidebarWidth = 240;
// 编辑步骤的侧边栏宽度
export const editStepWidth = 320;

/** 标注步骤的类型 */
export enum EStepType {
  ANNOTATION = 1, // 正常标注
  QUALITY_INSPECTION, // 标注质检
  PRE_ANNOTATION, // 预标注
  MANUAL_CORRECTION, // 人工修正
}

/** 标注工具中最大获取的图片数 */
export const ANNOTATION_MAX_SIZE = 100;

/** 翻页操作 */
export enum EPageTurningOperation {
  Backward,
  Forward,
  Jump,
}

/** 拖拽状态 */
export enum EDragStatus {
  Start,
  Stop,
  Wait,
}

/** 拖拽的内容 */
export enum EDragTarget {
  Point,
  Line,
  Plane,
}
