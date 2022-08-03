/**
 * 筛选当前的步骤配置
 * @param toolName
 */
import { ECheckModel, EToolName } from '@/constant/tool';
import CheckOperation from '../../core/toolOperation/checkOperation';
import PolygonOperation from '../../core/toolOperation/polygonOperation';
import RectOperationAsNewName from '../../core/toolOperation/rectOperation';
import TagOperation from '../../core/toolOperation/tagOperation';
import LineToolOperation from '../../core/toolOperation/LineToolOperation';
import PointOperation from '../../core/toolOperation/pointOperation';
import TextToolOperation from '../../core/toolOperation/TextToolOperation';
import SegmentByRect from '../../core/toolOperation/segmentByRect';

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
    default:
      throw new Error('not match tool');
  }
};
export { getCurrentOperation };
