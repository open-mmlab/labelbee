import React from 'react';
/**
 * 后续下方的定义由 @labelbee/lb-annotation 提供
 */
export interface ISize {
  width: number;
  height: number;
}

export interface IInputList {
  key: string;
  value: string;
  isMulti?: boolean;
  subSelected?: IInfoList[];
}

export interface IInfoList {
  key: string;
  value: string;
}

export type Sider = ({
  toolIcon,
  attributeList,
  annotationText,
  toolStyle,
  imageAttributeInfo,
  operation,
  tagToolSideBar,
  textToolSideBar,
  horizontal,
  scribbleSidebar,
  LLMSidebar,
  videoClipSidebar,
}: {
  toolIcon: React.ReactNode;
  attributeList: React.ReactNode;
  annotationText: React.ReactNode;
  toolStyle: React.ReactNode;
  imageAttributeInfo: React.ReactNode;
  operation: React.ReactNode;
  tagToolSideBar: React.ReactNode;
  textToolSideBar: React.ReactNode;
  horizontal: React.ReactNode;
  scribbleSidebar: React.ReactNode;
  LLMSidebar: React.ReactNode;
  videoClipSidebar: React.ReactNode;
  // PointCloud
  pointCloudToolSidebar: React.ReactNode;
  pointCloudOperation: React.ReactNode;
}) => React.ReactNode | React.ReactNode;

export type DrawLayerSlot = (props: {
  zoom?: number;
  currentPos?: { x?: number; y?: number };
  direct?: boolean;
}) => React.ReactNode;

interface IFooter {
  /** 快捷键 (FooterTips) */
  footerTips: React.ReactNode;
  /** 标注隐藏中  (HiddenTips) */
  hiddenTips: React.ReactNode;
  /** 本页件数  */
  pageNumber: React.ReactNode;
  /** 页码切换 */
  pagination: React.ReactNode;
  /** 缩放切换 ZoomController */
  zoomController: React.ReactNode;
  /** 当前分页 */
  curItems: React.ReactNode;
  /** footer 分隔符 */
  footerDivider: React.ReactNode;
  /** 属性标注列表 */
  annotateAttrList: React.ReactNode;

  /** 快捷键组件 */
  ToolHotKeyCom: React.ReactNode;

  /** 快捷键列表 */
  shortCutTable: {
    [a: string]: any;
  };
}

export type RenderFooter = ({
  footerTips,
  hiddenTips,
  pageNumber,
  pagination,
  zoomController,
  curItems,
  footerDivider,
  ToolHotKeyCom,
  shortCutTable,
}: IFooter) => React.ReactNode;

export type Header = ({
  backNode,
  headerNameNode,
  stepListNode,
  headerOptionNode,
  langNode,
  PointCloudSwitchPattern,
}: {
  backNode: React.ReactNode;
  headerNameNode: React.ReactNode;
  stepListNode: React.ReactNode;
  headerOptionNode: React.ReactNode;
  langNode: React.ReactNode;
  PointCloudSwitchPattern?: React.ReactNode;
}) => React.ReactNode;
