/**
 * @file Process audio tool data
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2024.05.14
 */

import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils';
import _ from 'lodash';

export default class DataTransform {
  // clip tool get text by config
  public static getClipTextByConfig = (
    region: IAudioTimeSlice,
    clipTextList: ITextConfigItem[],
    isDefault = false,
  ) => {
    const newRegion = _.cloneDeep(region);
    clipTextList.forEach((i, index) => {
      // index === 0: Compatible with old data
      const defaultValue = i?.default ?? ''
      if (index === 0) {
        Object.assign(newRegion, { text: isDefault ? defaultValue : region[i.key] });
      } else {
        Object.assign(newRegion, { [i.key]: isDefault ? defaultValue : region[i.key] });
      }
    });
    return newRegion;
  };
}
