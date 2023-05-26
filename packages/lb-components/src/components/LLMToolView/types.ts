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
  indicatorScore: IndicatorScore;
  indicatorDetermine: IndicatorDetermine;
}
