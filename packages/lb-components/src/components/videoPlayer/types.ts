export interface ITagLabelItem {
  keyLabel: string;
  valuesLabelArray: string[];
}

export type ITagLabelsArray = ITagLabelItem[];

export interface ObjectString {
  [key: string]: string | undefined;
}
