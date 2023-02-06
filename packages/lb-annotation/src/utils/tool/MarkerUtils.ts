import { cloneDeep } from 'lodash';
import AttributeUtils from './AttributeUtils';

declare interface IAuxiliaryLine {
  start: IPointUnit['label'];
  end: IPointUnit['label'];
}

declare interface IAuxiliaryLineCoord {
  start: ICoordinate;
  end: ICoordinate;
}

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

  /**
   * v3.2.0 仅标点工具 列表标注 根据配置生成辅助线数组,start和end为IMarkerList[attr]
   * eg:[{key:"类别1",value:"类别1",target:["class-lm"]},{key:"类别lm",value:"class-lm",target:["类别1"]}] => [{start:"类别1",end:"类别lm"}]
   */
  static getAuxiliaryLineByMarkerList = (markerList: IMarkerList[], attr: 'key' | 'value'): IAuxiliaryLine[] => {
    const queue = cloneDeep(markerList);

    const auxiliaryLines: IAuxiliaryLine[] = [];

    let currentNode = queue.shift();
    while (currentNode) {
      // eslint-disable-next-line no-loop-func
      currentNode.target?.forEach((element) => {
        const targetMarkerListItem = queue.find((i) => i.value === element);
        if (targetMarkerListItem && currentNode?.[attr]) {
          auxiliaryLines.push({
            start: currentNode[attr],
            end: targetMarkerListItem[attr],
          });
        }
      });

      currentNode = queue.shift();
    }

    return auxiliaryLines;
  };

  /**
   * 根据辅助线和点数据生成辅助线首尾坐标
   */
  static getAuxiliaryLineCoord = (auxiliaryLines: IAuxiliaryLine[], pointList: IPointUnit[]): IAuxiliaryLineCoord[] => {
    const result: IAuxiliaryLineCoord[] = [];

    auxiliaryLines.forEach((line) => {
      const { start, end } = line;
      const startPoint = pointList.find((item) => item.label === start);

      if (!startPoint) {
        return;
      }

      const targetPoint = pointList.find((item) => item.label === end);

      if (!targetPoint) {
        return;
      }

      result.push({
        start: {
          x: startPoint.x,
          y: startPoint.y,
        },
        end: {
          x: targetPoint.x,
          y: targetPoint.y,
        },
      });
    });
    return result;
  };
}
