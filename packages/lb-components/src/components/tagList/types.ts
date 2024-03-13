export interface IInputList {
  key: string;
  value: string;
  isMulti: boolean;
  isOverall: boolean;
  subSelected: Array<{
    key: string;
    value: string;
    isDefault: boolean;
  }>;
}

export interface ISelectedTags {
  [key: string]: string[];
}

export interface ITagListProps {
  updateValue: (value: { key: string; value: string[] }) => void;
  inputList?: IInputList[];
  selectedTags: ISelectedTags;
  checkMode?: boolean;
}
