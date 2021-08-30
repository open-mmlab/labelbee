declare interface IBaseColorStyle {
  stroke: string;
  fill: string;
}

declare interface IToolColorStyle {
  valid: IBaseColorStyle;
  invalid: IBaseColorStyle;
  validSelected: IBaseColorStyle;
  invalidSelected: IBaseColorStyle;
  validHover: IBaseColorStyle;
  invalidHover: IBaseColorStyle;
  validTextColor: string;
  invalidTextColor: string;
}
