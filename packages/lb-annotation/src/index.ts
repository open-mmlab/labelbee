/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-05-16 20:37:05
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-13 20:09:22
 */
import { RectOperation } from './core/toolOperation/rectOperation';
import TagOperation from './core/toolOperation/tagOperation';
import PointOperation from './core/toolOperation/pointOperation';
import LineToolOperation from './core/toolOperation/LineToolOperation';
import TextToolOperation from './core/toolOperation/TextToolOperation';
import PolygonOperation from './core/toolOperation/polygonOperation';
import MeasureOperation from './core/toolOperation/measureOperation';
import PointCloud2DRectOperation from './core/toolOperation/pointCloud2DRectOperation';
import { BasicToolOperation } from './core/toolOperation/basicToolOperation';
import ViewOperation from './core/toolOperation/ViewOperation';
import ScribbleTool from './core/toolOperation/ScribbleTool';
import PointCloud2dOperation from './core/toolOperation/pointCloud2dOperation';
import SegmentByRect from './core/toolOperation/segmentByRect';
import SegmentBySAM from './core/toolOperation/segmentBySAM';

// Constant
import * as cAnnotation from './constant/annotation';
import * as cAnnotationTask from './constant/annotationTask';
import * as cKeyCode from './constant/keyCode';
import * as cStyle from './constant/style';
import * as cTool from './constant/tool';

// Utils
import TagUtils from './utils/tool/TagUtils';
import uuid from './utils/uuid';
import EnhanceCommonToolUtils from './utils/tool/EnhanceCommonToolUtils';
import MarkerUtils from './utils/tool/MarkerUtils';
import RectUtils from './utils/tool/RectUtils';
import AxisUtils from './utils/tool/AxisUtils';
import DrawUtils from './utils/tool/DrawUtils';
import ImgUtils from './utils/ImgUtils';
import MathUtils from './utils/MathUtils';
import AttributeUtils from './utils/tool/AttributeUtils';
import ActionsHistory from './utils/ActionsHistory';
import EventBus from './utils/EventBus';
import CanvasUtils from './utils/tool/CanvasUtils';

// ToolListener
import DblClickEventListener from './utils/tool/DblClickEventListener'; // temporarily supports the use of external tools in this way

import AnnotationEngine from './core';

import UnitUtils from './utils/tool/UnitUtils';
import StyleUtils from './utils/tool/StyleUtils';
import CursorTextClass from './core/toolOperation/cursorTextClass';
import { EMessage } from './locales/constants';
import MESSAGE_CN from './locales/zh_CN/message';

const CommonToolUtils = EnhanceCommonToolUtils;
const toolUtils = EnhanceCommonToolUtils; // Compatible with the old version of the definition

export {
  // 各类图形操作
  RectOperation,
  TagOperation,
  PointOperation,
  LineToolOperation,
  PolygonOperation,
  TextToolOperation,
  BasicToolOperation,
  PointCloud2DRectOperation,
  MeasureOperation,
  ViewOperation,
  PointCloud2dOperation,
  SegmentByRect,
  SegmentBySAM,
  CursorTextClass,
  // 固定操作
  cAnnotation,
  cAnnotationTask,
  cKeyCode,
  cStyle,
  cTool,
  // 工具包
  toolUtils,
  DblClickEventListener,
  CommonToolUtils,
  uuid,
  MarkerUtils,
  RectUtils,
  AxisUtils,
  TagUtils,
  DrawUtils,
  ImgUtils,
  MathUtils,
  AttributeUtils,
  CanvasUtils,
  AnnotationEngine,
  ScribbleTool,
  UnitUtils,
  StyleUtils,
  // 其他特殊基础功能
  ActionsHistory,
  EventBus,
  EMessage,
  MESSAGE_CN,
};

export * from './newCore';
export * from './constant/tool';
export * from './core/pointCloud';

// test
