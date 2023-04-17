import { IPoint } from './common';
export interface ILinePoint extends IPoint {
  id?: string;
  specialEdge?: boolean;
  actual?: IPoint; // For internal use only
}
export interface ILine {
  id: string;
  valid: boolean;
  pointList?: ILinePoint[];
  order: number;
  label?: string;
  sourceID?: string;
  attribute?: string;
  textAttribute?: string;
  isReference?: boolean;
}
