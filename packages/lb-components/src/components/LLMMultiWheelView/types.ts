
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
export interface IAnswerList {
  id: string;
  answer: string;
  newAnswer: string;
  indicatorScore: {
    [key: string]: number;
  };
  indicatorDetermine: {
    [key: string]: boolean;
  };
  tagList: { [key: string]: string[] };
}

export interface IModelData {
  id: number;
  sort: Array<number[]>;
  answerList: IAnswerList[];
}

export interface IModelResult {
  sort: Array<number[]>;
  answerSort: { [key: string]: number[] };
  textAttribute: ITextList[];
  modelData: IModelData[];
}

export interface ISortData {
  newSort?: IAnswerSort[][];
  waitSorts?: IWaitAnswerSort[];
}

export interface IWaitAnswerSort {
  title: string;
  id: string;
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
  title: string;
  id: string;
  tagCenterPoint?: IPoint;
  tagVertexPoint?: ITagVertexPoint;
}
