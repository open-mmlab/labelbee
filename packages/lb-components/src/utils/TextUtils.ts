/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-01-12 13:15:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-05-30 15:51:43
 */
import { ETextType } from '@/data/enums/ToolType';
import { i18n } from '@labelbee/lb-utils';

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
        return i18n.t("TextCheckNumberOnly");
      case ETextType.EnglishOnly:
        return i18n.t("TextCheckEnglishOnly");
      case ETextType.CustomFormat:
        return i18n.t("TextCheckCustomFormat");
      default:
        return '';
    }
  }
}
