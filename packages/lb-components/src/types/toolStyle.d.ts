// Like: 'rgba(204, 204, 204, 1)'
type Color = string;

export type ToolColorItemMap = Record<
  'valid' | 'invalid' | 'validSelected' | 'invalidSelected' | 'validHover' | 'invalidHover',
  Record<'stroke' | 'fill', Color>
>;

export type ToolColor = Record<string, ToolColorItemMap>;

export interface ToolStyle {
  toolColor: ToolColor;
  attributeColor: ToolColorItemMap[];
  lineColor: Record<string, Color>;
  attributeLineColor: Color[];
  color: number;
  width: number;
  borderOpacity: number;
  fillOpacity: number;
  hiddenText: boolean;
  leftZoom: number;
}
