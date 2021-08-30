import { ELang } from '../constant/annotation';
import enMessages from './en_US/message';
import zhMessages from './zh_CN/message';

class Locale {
  static getMessagesByLocale = (key: string, locale: string) => {
    switch (locale) {
      case ELang.US:
        return enMessages[key];
      case ELang.Zh:
      default:
        return zhMessages[key];
    }
  };
}

export default Locale;
