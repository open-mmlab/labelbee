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
export interface ILLMToolConfig {
  // LLM工具
  enableSort: boolean;
  indicatorScore: IndicatorScore[]; // 指标评分
  indicatorDetermine: IndicatorDetermine[]; // 指标判断
  score: number; // 整体评分
  text?: boolean;
}
