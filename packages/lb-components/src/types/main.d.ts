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
}) => React.ReactNode | React.ReactNode;

export type Footer = ({
  footerTips,
  hiddenTips,
  pageNumber,
  pagination,
  zoomController,
  curItems,
  footerDivider,
}: {
  footerTips: React.ReactNode;
  hiddenTips: React.ReactNode;
  pageNumber: React.ReactNode;
  pagination: React.ReactNode;
  zoomController: React.ReactNode;
  curItems: React.ReactNode;
  footerDivider: React.ReactNode;
}) => React.ReactNode | React.ReactNode;

export type Header = ({
  backNode,
  headerNameNode,
  stepListNode,
  headerOptionNode,
  langNode,
}: {
  backNode: React.ReactNode;
  headerNameNode: React.ReactNode;
  stepListNode: React.ReactNode;
  headerOptionNode: React.ReactNode;
  langNode: React.ReactNode;
}) => React.ReactNode | React.ReactNode;
