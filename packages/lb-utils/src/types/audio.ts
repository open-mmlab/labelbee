import { IToolConfig } from './common';
import { IInputList } from './base';
export interface IAudioTimeSlice {
  /** 开始的时间 */
  start: number;
  /** 结束的时间 */
  end: number;
  /** ID */
  id: string;
  /** 属性 */
  attribute: string;
  /** 文本标注 */
  text: string;
  subAttribute?: {
    [key: string]: string;
  };
  [key: string]: any;
}

export interface ITextConfigItem {
  label: string;
  key: string;
  required: boolean;
  default: string;
  maxLength: number;
}

export interface IAudioTextToolConfig extends IToolConfig {
  configList: ITextConfigItem[];
  inputList: IInputList[];
  tagConfigurable: boolean;
  textConfigurable: boolean;
  clipConfigurable: boolean;
  clipAttributeConfigurable: boolean;
  clipAttributeList: IInputList[];
  secondaryAttributeConfigurable?: boolean;
  subAttributeList?: IInputList[];
  clipTextConfigurable: boolean;
}
