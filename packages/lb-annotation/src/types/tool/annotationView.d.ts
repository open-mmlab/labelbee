/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-02-15 16:41:44
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-05-17 17:10:30
 */
declare interface IBasicStyle {
  stroke?: string; // 边框颜色
  fill?: string; // 填充颜色
  thickness?: number; // 当前图形宽度
}

declare interface IRenderEnhanceParams {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  currentPos: ICoordinate;
  zoom: number;
  data: IAnnotationData;
  toolInstance: ViewOperation;
}

declare interface IGraphicsBasicConfig extends IBasicStyle {
  hiddenText?: boolean; // 是否隐藏文本
  isReference?: boolean; // 是否进行的参考显示
  renderEnhance?: (params: IRenderEnhanceParams) => void;
}

declare interface IAnnotationData {
  type: 'rect' | 'polygon' | 'line' | 'point' | 'text';
  annotation: IBasicRect & IBasicPolygon & IBasicLine & IPoint & IBasicText;
}

declare interface IBasicRect extends IGraphicsBasicConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

declare interface IBasicPoint extends IGraphicsBasicConfig {
  id: string;
  x: number;
  y: number;
  radius?: number;
}

declare interface IBasicPolygon extends IGraphicsBasicConfig {
  id: string;
  pointList: IBasicPoint[];
  showDirection?: boolean;
  specialPoint?: boolean; // 顶点是否特殊点
  specialEdge?: boolean; // 顶点与a其下一个顶点连成的边是否为特殊边

  lineType?: ELineTypes;
  showKeyPoint: boolean; // 是否展示关键点
}

declare type IBasicLine = IBasicPolygon;

declare interface IBasicText {
  id: string;
  x: number;
  y: number;
  text: string; // Use \n for line feed
  position: 'rt';
  textMaxWidth?: number;

  color?: string;
  background?: string;
  lineHeight?: number;
  font?: string; // canvas-font https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
  style?: StyleSheetList;
}
