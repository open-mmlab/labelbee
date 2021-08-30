import { ETextType } from '@/data/enums/ToolType';

export const REGEXP_NUMBER = '^[0-9]+$';
export const REGEXP_ENGLISH = '^[A-Za-z]+$';

export class TextUtils {
  public static checkString(textCheckType: ETextType, customFormat: string) {
    let regExpString = '';
    switch (textCheckType) {
      case ETextType.Order:
      case ETextType.NumberOnly:
        regExpString = REGEXP_NUMBER;
        break;
      case ETextType.EnglishOnly:
        regExpString = REGEXP_ENGLISH;
        break;
      case ETextType.CustomFormat:
        regExpString = customFormat;
        break;
    }
    return regExpString;
  }

  public static getErrorNotice(textCheckType: ETextType) {
    switch (textCheckType) {
      case ETextType.Order:
      case ETextType.NumberOnly:
        return '请按仅数字的格式输入';
      case ETextType.EnglishOnly:
        return '请按仅英文的格式输入';
      case ETextType.CustomFormat:
        return '请按要求的格式输入';
      default:
        return '';
    }
  }
}
