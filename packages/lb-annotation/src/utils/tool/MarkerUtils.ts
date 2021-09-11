import AttributeUtils from './AttributeUtils';

export default class MarkerUtils {
  /**
   * 获取列表标注的显示的数据
   * @param marker
   * @param markerList
   * @returns
   */
  static getMarkerShowText(marker: string | undefined, markerList: IInputList[] = []) {
    return AttributeUtils.getAttributeShowText(marker, markerList);
  }
}
