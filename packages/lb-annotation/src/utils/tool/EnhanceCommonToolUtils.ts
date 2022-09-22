/**
 * @file Enhance CommonToolUtils with getCurrentOperation, solving circular reference problems.
 * @createDate 2022-08-12
 * @author Ron <ron.f.luo@gmail.com>
 */

import { ECheckModel, EToolName } from '@/constant/tool';
import ScribbleTool from '@/core/toolOperation/ScribbleTool';
import CheckOperation from '../../core/toolOperation/checkOperation';
import PolygonOperation from '../../core/toolOperation/polygonOperation';
import RectOperationAsNewName from '../../core/toolOperation/rectOperation';
import TagOperation from '../../core/toolOperation/tagOperation';
import LineToolOperation from '../../core/toolOperation/LineToolOperation';
import PointOperation from '../../core/toolOperation/pointOperation';
import TextToolOperation from '../../core/toolOperation/TextToolOperation';
import SegmentByRect from '../../core/toolOperation/segmentByRect';
import CommonToolUtils from './CommonToolUtils';

const getCurrentOperation = (toolName: EToolName | ECheckModel) => {
  switch (toolName) {
    case EToolName.Rect:
    case EToolName.RectTrack:
      return RectOperationAsNewName;
    case EToolName.SegmentByRect:
      return SegmentByRect;
    case EToolName.Tag:
      return TagOperation;
    case EToolName.Polygon:
      return PolygonOperation;
    case ECheckModel.Check:
      return CheckOperation;
    case EToolName.Line:
      return LineToolOperation;
    case EToolName.Point:
      return PointOperation;
    case EToolName.Text:
      return TextToolOperation;
    case EToolName.ScribbleTool:
      return ScribbleTool;
    default:
      throw new Error('not match tool');
  }
};

class EnhanceCommonToolUtils extends CommonToolUtils {
  public static getCurrentOperation = getCurrentOperation;
}

export { getCurrentOperation };
export default EnhanceCommonToolUtils;
