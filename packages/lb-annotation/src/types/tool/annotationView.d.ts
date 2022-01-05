declare interface IBasicStyle {
  stroke?: string; // 边框颜色
  fill?: string; // 填充颜色
  thickness?: number; // 当前图形宽度
}

declare interface IGraphicsBasicConfig extends IBasicStyle {
  hiddenText?: boolean; // 是否隐藏文本
  isReference?: boolean; // 是否进行的参考显示
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
}
