import { isObject } from 'lodash';

export class ConfigUtils {
  public static jsonParser(content: any, defaultValue: any = {}) {
    try {
      if (typeof content === 'string') {
        return JSON.parse(content);
      }
      return isObject(content) ? content : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
}
