/**
 * 标注渲染样式
 */
declare interface IAnnotationStyle {
  strokeColor: string;
  fillColor: string;
  textColor: string;
  toolColor: any;
}

/**
 * 标注数据格式
 */
declare type TAnnotationType = IRect | IPolygonData | IPoint | ILine | ITagResult | IBasicText;

/**
 * 数据渲染增强
 */
declare interface IRenderEnhance {
  staticRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void; //
  selectedRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
  creatingRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
}

/**
 * 创建时数据时的增强
 */
declare type TDataInjectionAtCreateion = (data: IRect | IPolygonData | IPoint | ILine | ITagResult | IBasicText) => {
  [a: string]: any;
};
