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

  /**
   * 获取对应的步骤配置
   * @param stepList 
   * @param step 
   */
  public static getStepConfig = (stepList: any[], step: number) =>
    stepList.find((i) => i.step === step);
}
