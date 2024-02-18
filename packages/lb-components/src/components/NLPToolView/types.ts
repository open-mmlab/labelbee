import { IInfoList } from '@labelbee/lb-utils';
import React from 'react';

export interface IndicatorDetermine {
  label: string;
  value: string;
}

export interface INLPToolConfig {
  indicatorDetermine?: IndicatorDetermine[]; // 指标判断
  isTextEdit: boolean;
  textEdit: ITextList[];
  attributeConfigurable: boolean;
  attributeList: IInfoList[];
}

export interface ITextList {
  textId?: string;
  title?: string | number;
  tip?: string;
  min?: number;
  max?: number;
  value?: string;
  isFillAnswer?: boolean;
  textControl?: boolean;
  isLaText?: boolean;
}

export interface ITextData {
  content: string;
}

export interface INLPResult {
  id: number;
  newText: string;
  indicatorDetermine: any;
  textAnnotation: INLPTextAnnotation[];
}
export interface INLPTextAnnotation {
  id: string;
  start: number;
  end: number;
  attribute: string;
  text: string;
}

export interface INLPInterval {
  start: number;
  end: number;
  annotations?: INLPTextAnnotation[];
  text: string;
  attribute?: string;
  id?: string;
}

export interface ISelectText {
  id?: string;
  start?: number;
  end?: number;
  text?: string;
}

export interface IRemarkLayer {
  style: React.CSSProperties | undefined;
  onClose: () => void;
  submitData: ISelectText;
}

export interface IRemarkInterval {
  start: number;
  end: number;
  remarkAnnotations?: IRemarkAnnotation[];
  text: string;
  attribute?: string;
  id?: string;
}

export interface IRemarkAnnotation {
  auditID: number;
  text: string;
  id: string;
  start: number;
  end: number;
  uuid: string;
}
