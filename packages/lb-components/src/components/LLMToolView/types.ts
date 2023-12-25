export interface IndicatorScore {
  label: string;
  value: string;
  text?: string;
  score?: number;
}

export interface IndicatorDetermine {
  label: string;
  value: string;
}
export interface IAnswerList {
  order: number;
  answer: string;
  score?: number;
  indicatorScore?: {
    [key: string]: number;
  };
  indicatorDetermine?: {
    [key: string]: boolean;
  };
  newAnswer?: string;
  url?: string; // used to display picture
}

export interface IModelAPIAnswer {
  id: string;
  answer: string;
  name: string;
}

declare interface IModelAPIConfig {
  id: string;
  name: string;
  enableAdvanced: boolean;
  endpoint: string;
  authorization: string;
  key: string;
  templateParams?: string;
  template?: any;
  responseSelector?: string;
  secretKey?: string;
}

// LLM工具配置
export interface ILLMToolConfig {
  enableModelAPI?: boolean;
  modelAPIConfigList?: IModelAPIConfig[];
  enableSort?: boolean;
  indicatorScore?: IndicatorScore[]; // 指标评分
  indicatorDetermine?: IndicatorDetermine[]; // 指标判断
  score?: number; // 整体评分
  text?: ITextList[];
  dataType: {
    prompt: string;
    response: string;
  };
  isTextEdit: boolean;
  textEdit: ITextList[];
}

// LLM文本
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

// 单个答案
export interface IWaitAnswerSort {
  title: number;
  id: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface ITagVertexPoint {
  bl: IPoint;
  br: IPoint;
  tl: IPoint;
  tr: IPoint;
}
export interface IAnswerSort {
  title: number;
  id: number;
  tagCenterPoint?: IPoint;
  tagVertexPoint?: ITagVertexPoint;
}

export interface ILLMBoxResult {
  answerList: IAnswerList[];
  id: number;
  sort?: number[][];
  textAttribute?: ITextList[];
}
