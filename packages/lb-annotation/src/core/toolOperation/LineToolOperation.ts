/**
 * @file 实现线条工具的交互
 * @author lijingchi <lijingchi1@sensetime.com>
 */

import _ from 'lodash';
import { ELineColor, EDependPattern, ELineTypes, ETextType } from '@/constant/tool';
import ActionsHistory from '@/utils/ActionsHistory';
import uuid from '@/utils/uuid';
import EKeyCode from '@/constant/keyCode';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import LineToolUtils from '../../utils/tool/LineToolUtils';
import {
  isInPolygon,
  createSmoothCurvePoints,
  createSmoothCurvePointsFromPointList,
} from '../../utils/tool/polygonTool';
import CommonToolUtils from '../../utils/tool/CommonToolUtils';
import CanvasUtils from '../../utils/tool/CanvasUtils';
import DrawUtils from '../../utils/tool/DrawUtils';
import DependencyUtils from '../../utils/tool/DependencyUtils';
import StyleUtils from '../../utils/tool/StyleUtils';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import TextAttributeClass from './textAttributeClass';
import MathUtils from '@/utils/MathUtils';

enum EStatus {
  Create = 0,
  /** 正在激活 */
  Active = 1,
  /** 没有操作，初始化状态 */
  None = 2,
}

/** 曲线分割点数 */
export const SEGMENT_NUMBER = 16;

export const LINE_ORDER_OFFSET = {
  x: 0,
  y: 20,
};

/** 圆的半径 */
export const POINT_RADIUS = 3;
/** 圆的激活半径 */
export const POINT_ACTIVE_RADIUS = 5;
/** 内侧圆的半径 */
export const INNER_POINT_RADIUS = 2;

interface ILineOperationProps extends IBasicToolOperationProps {}

class LineToolOperation extends BasicToolOperation {
  /**
   * 渲染激活的线段
   * @param coord 当前的坐标
   * @param e 鼠标事件
   */
  public drawActivatedLine = (coord?: ICoordinate, e?: MouseEvent, hideTempAxis?: boolean) => {
    const activeLine = _.cloneDeep(this.activeLine);

    if (!activeLine || activeLine.length === 0) {
      return;
    }

    const isActiveLineValid = this.isActiveLineValid();

    let order;
    const existLine = this.selectedID ? this.lineList.find((i) => i.id === this.selectedID) : undefined;
    if (existLine) {
      order = existLine.order;
    } else {
      order = this.nextOrder();
    }
    const color = this.getLineColorByAttribute({ attribute: this.defaultAttribute, valid: !!isActiveLineValid });

    activeLine.map((point) => Object.assign(point, this.getRenderAxis(point)));
    this.updateActiveArea();
    this.drawLine(activeLine, coord, color, true, true);
    this.drawLineNumber(activeLine[0], order, color, '', this.defaultAttribute, isActiveLineValid);

    if (coord && this.isCreate) {
      this.arc(coord, POINT_RADIUS, color);
    }
    if (this.cursor && !this.selectedPoint && !hideTempAxis && !this.isShift) {
      this.arc(this.cursor, POINT_ACTIVE_RADIUS, color);
    }
  };

  /**
   * 绘制hover圆点
   * @param coord
   */
  public drawPointWhenHover = (coord: ICoordinate) => {
    if (!coord || this.isMousedown || !this.activeLine || this.activeLine?.length < 2) {
      return;
    }

    const pointList = this.getPointList(this.activeLine);
    const hoverPoint = this.activeLine.find(
      (i: ILinePoint) => LineToolUtils.calcDistance(this.getRenderAxis(i), coord) <= POINT_ACTIVE_RADIUS,
    );
    let nearestPoint;
    if (!hoverPoint && this.activeLine) {
      nearestPoint = this.findNearestPoint(pointList, coord);
    }
    this.hoverPointID = hoverPoint ? hoverPoint.id : undefined;
    this.cursor = hoverPoint ? undefined : nearestPoint?.point;
  };

  private lineList: ILine[] = [];

  private activeLine?: ILinePoint[] = [];

  private selectedID?: string;

  private status: EStatus;

  private isMousedown: boolean;

  private prevAxis: ICoordinate;

  private activeArea?: IRectArea;

  /** 临时点的渲染坐标 */
  private cursor?: ICoordinate;

  private selectedPoint?: ILinePoint;

  private actionsHistory?: ActionsHistory;

  private coordsClickedActiveArea: boolean = false;

  private hoverEdgeIndex: number = -1;

  /** 临时点锁定，避免由于点击延迟造成的坐标偏移 */
  private isShift: boolean = false;

  private isCtrl: boolean = false;

  private isAlt: boolean = false;

  private hoverPointID?: string;

  private lineMoved: boolean;

  private dependPattern: EDependPattern;

  private dependConfig?: any;

  private isReference: boolean = false;

  private _textAttributeInstance?: TextAttributeClass;

  private textEditingID?: string;

  private isLineValid: boolean;

  private hoverID?: string;

  private dependData?: any;

  constructor(props: ILineOperationProps) {
    super(props);
    this.status = EStatus.None;
    this.isMousedown = false;
    this.dependPattern = EDependPattern.dependOrigin;
    this.lineMoved = false;
    this.isLineValid = true;
    this.setConfig(props.config);
    this.prevAxis = {
      x: 0,
      y: 0,
    };
    this.textEditingID = '';
    this.updateSelectedTextAttribute = this.updateSelectedTextAttribute.bind(this);
    this.actionsHistory = new ActionsHistory();
  }

  /** 创建状态 */
  get isCreate() {
    return this.status === EStatus.Create;
  }

  /** 激活状态 */
  get isActive() {
    return this.status === EStatus.Active;
  }

  /** 无状态  */
  get isNone() {
    return this.status === EStatus.None;
  }

  /** 线条类型是否为曲线 */
  get isCurve() {
    return this.config.lineType === ELineTypes.Curve;
  }

  /** 线条是否为多色 */
  get isMultipleColor() {
    return this.config.lineColor === ELineColor.MultiColor;
  }

  get imageSize() {
    if (this.rotate % 180 === 0) {
      return this.basicImgInfo;
    }
    return {
      width: this.basicImgInfo.height,
      height: this.basicImgInfo.width,
    };
  }

  get lineListLen() {
    return this.lineList.length;
  }

  /** 是否允许边缘吸附 */
  get edgeAdsorptionEnabled() {
    return this.edgeAdsorption && !this.isCurve && this.lineListLen > 0;
  }

  get attributeConfigurable() {
    return this.config.attributeConfigurable;
  }

  get isTextConfigurable() {
    return this.config.textConfigurable;
  }

  get isDependPolygon() {
    return DependencyUtils.isDependPolygon(this.dependPattern);
  }

  get isDependRect() {
    return DependencyUtils.isDependRect(this.dependPattern);
  }

  get isCurrentAttributeLocked() {
    return this.attributeLockList.includes(this.defaultAttribute);
  }

  get attributeFilteredLines() {
    if (this.attributeLockList.length > 0) {
      return this.lineList.filter((v) => this.attributeLockList.includes(v?.attribute || ''));
    }

    return this.lineList;
  }

  get enableOutOfTarget() {
    return this.config.enableOutOfTarget;
  }

  get showOrder() {
    return this.config.showOrder;
  }

  get edgeAdsorption() {
    return this.config.edgeAdsorption;
  }

  get attributeList() {
    return this.config.attributeList;
  }

  get lowerLimitPointNum() {
    return this.config.lowerLimitPointNum;
  }

  get upperLimitPointNum() {
    return this.config.upperLimitPointNum;
  }

  get textCheckType() {
    return this.config.textCheckType;
  }

  get customFormat() {
    return this.config.customFormat;
  }

  get dataList() {
    return this.lineList;
  }

  /**
   * 视野内的线条
   */
  get viewPortLines() {
    const viewPort = CanvasUtils.getViewPort(this.canvas, this.currentPos, this.zoom);
    if (this.isHidden) {
      return [];
    }
    return this.attributeFilteredLines.filter((i: any) =>
      i?.pointList?.some((p: ICoordinate) => CanvasUtils.inViewPort(p, viewPort)),
    );
  }

  get lineStyle() {
    return {
      lineWidth: this.style.width,
      color: this.getLineColor(this.defaultAttribute),
      opacity: this.style.opacity,
    };
  }

  public updateStatus(status: EStatus, resetText: boolean = false) {
    if (status === this.status) {
      return;
    }

    if (resetText) {
      let defaultText = '';
      if (this.textCheckType === ETextType.Order && this.isTextConfigurable) {
        defaultText = AttributeUtils.getTextAttribute(this.lineList, this.textCheckType);
      }

      this.emit('updateText', defaultText);
    }
    this.status = status;
    this.lineStatusChanged();
  }

  public isInPolygon(coord: ICoordinate) {
    return isInPolygon(coord, this.dependData?.pointList || [], this.dependConfig.lineType);
  }

  public getPolygonPointList() {
    if (!this.dependData) {
      return [];
    }
    const { pointList } = this.dependData;
    const { lineType } = this.dependConfig;
    return lineType === ELineTypes.Line
      ? pointList
      : createSmoothCurvePoints(
          pointList.reduce((acc: any[], cur: any) => {
            return [...acc, cur.x, cur.y];
          }, []),
          0.5,
          true,
          20,
        );
  }

  /**
   * 限制点在图上
   * @param coord
   * @returns 绝对坐标
   */
  public pointOverImage(coord: ICoordinate) {
    const preAxis = this.activeLine?.slice(-1)[0];
    if (preAxis) {
      return LineToolUtils.pointOverTarget(
        coord,
        preAxis,
        this.dependPattern,
        this.dependData,
        this.dependConfig,
        this.imageSize,
        POINT_RADIUS,
        this.zoom,
        this.getRenderAxis,
        this.getAbsAxis,
      );
    }

    return coord;
  }

  /**
   * 限制点在图上
   * @param coord
   * @returns 渲染坐标
   */
  public pointRenderingAxisOverImage(coord: ICoordinate) {
    const absAxis = this.getAbsAxis(coord);
    return this.getRenderAxis(this.pointOverImage(absAxis));
  }

  /**
   * 检查点是否在线上
   * @param pointList 所有点
   * @param checkPoint
   * @param scope
   */
  public pointInLine(pointList: ILinePoint[], checkPoint: ICoordinate, scope: number) {
    if (pointList.filter((i) => i).length < 2) {
      return false;
    }
    return pointList.some((point: ILinePoint, index) => {
      if (index === 0) {
        return false;
      }
      const point1 = this.getRenderAxis(pointList[index - 1]);
      const point2 = this.getRenderAxis(point);
      return LineToolUtils.isInLine(checkPoint, point1, point2, scope);
    });
  }

  /** 获取坐标值 */
  public getAxis = (e: MouseEvent) => {
    const coord = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - coord.left,
      y: e.clientY - coord.top,
    };
  };

  /**
   * 根据坐标绘制圆点
   * @param coord
   * @param size
   * @param color
   */
  public arc(coord: ICoordinate, size: number = POINT_RADIUS, color?: string) {
    if (this.ctx) {
      const { x, y } = coord;
      this.ctx?.save();
      this.ctx?.beginPath();
      this.ctx.fillStyle = color || this.lineStyle.color;
      this.ctx?.arc(x, y, size, 0, 360);
      this.ctx?.closePath();
      this.ctx?.fill();
      this.ctx?.restore();
    }
  }

  /**
   *  对存在绘制对象，绘制热区
   */
  public renderActiveArea() {
    if (this.isActive && this.activeArea && this.ctx) {
      const { top, left, right, bottom } = this.activeArea;
      const { x, y } = this.getRenderAxis({ x: left, y: top });
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#B3B8FF';
      this.ctx.rect(x, y, (right - left) * this.zoom, (bottom - top) * this.zoom);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  /**
   * 添加点
   * @param coord 坐标
   */
  public addPoint(coord: ICoordinate) {
    const absAxis = this.getAbsAxis(coord);
    this.activeLine?.push({ ...absAxis, id: uuid() });

    if (this.activeLine?.length === 1) {
      this.actionsHistory?.initRecord(this.activeLine);
    } else {
      this.actionsHistory?.pushHistory(this.activeLine);
    }
  }

  /**
   * 当前激活的线条是否为有效线, 优先获取存在的数据
   */
  public isActiveLineValid() {
    return this.selectedID ? this.lineList.find((i) => i.id === this.selectedID)?.valid : this.isLineValid;
  }

  public nextOrder() {
    return this.lineListLen === 0 ? 1 : this.lineList.slice(-1)[0].order + 1;
  }

  public drawCurveLine = (
    ctx: any,
    points: ILinePoint[],
    config: any,
    applyLineWidth: boolean = true,
    isReference: boolean = false,
    hoverEdgeIndex: number,
  ) => {
    const pointList = createSmoothCurvePointsFromPointList(points, SEGMENT_NUMBER);
    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = config.color;

    if (applyLineWidth) {
      ctx.lineWidth = config.lineWidth;
    }

    if (isReference) {
      LineToolUtils.setReferenceCtx(ctx);
    }

    points.forEach(({ specialEdge }: ILinePoint, index: number) => {
      const curveLinePoints = pointList.splice(0, SEGMENT_NUMBER + 1);
      ctx.save();
      ctx.beginPath();

      if (hoverEdgeIndex === index) {
        ctx.lineWidth = 4;
      }

      curveLinePoints.forEach(({ x, y }: ILinePoint, pointIndex) => {
        const fn = pointIndex > 0 ? 'lineTo' : 'moveTo';
        if (specialEdge) {
          LineToolUtils.setSpecialEdgeStyle(ctx);
        }

        ctx[fn](x, y);
      });
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  };

  /**
   * 绘制线段
   * @param points 点列表
   * @param cursor 临时的左边，用于实时绘制
   * @param color 线条颜色
   * @param showPoint 是否显示点
   */
  public drawLine = (
    points: Array<ILinePoint | ICoordinate>,
    cursor: ICoordinate | undefined,
    color: string,
    showPoint: boolean = false,
    isActive: boolean = false,
  ) => {
    const pointsToDraw = (cursor ? points.concat(cursor) : points) as ILinePoint[];
    const lineConfig = { color, lineWidth: isActive ? 1 : this.lineStyle.lineWidth };

    if (this.isCurve) {
      LineToolUtils.drawCurveLine(
        this.ctx,
        pointsToDraw,
        lineConfig,
        !showPoint,
        this.isReference,
        isActive ? this.hoverEdgeIndex : -1,
      );
    } else {
      this.drawStraightLine(pointsToDraw, lineConfig, isActive);
    }

    if (showPoint) {
      points.forEach((point: ILinePoint | ICoordinate) => {
        const pointID = (point as ILinePoint).id;

        const pointRadius =
          pointID && [this.hoverPointID, this.selectedPoint?.id].includes(pointID) ? POINT_ACTIVE_RADIUS : POINT_RADIUS;
        this.arc(point, pointRadius, color);

        if (![this.hoverPointID, this.selectedPoint?.id].includes(pointID)) {
          this.arc(point, INNER_POINT_RADIUS, 'white');
        }
      });
    }
  };

  public drawStraightLine = (points: any[], config: any, isActive: boolean = false) => {
    const { ctx } = this;
    if (ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = config.color;
      ctx.lineWidth = config.lineWidth;

      if (this.isReference) {
        LineToolUtils.setReferenceCtx(ctx);
      }
      points.forEach((point, index) => {
        ctx.beginPath();
        if (index > 0) {
          const prePoint = points[index - 1];
          ctx.save();
          if (prePoint?.specialEdge) {
            LineToolUtils.setSpecialEdgeStyle(ctx);
          }

          if (isActive && this.hoverEdgeIndex + 1 === index) {
            ctx.lineWidth = 4;
          }

          ctx.moveTo(prePoint.x, prePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          ctx.restore();
        }
      });
      ctx.restore();
    }
  };

  public getLineColorByAttribute(line: { attribute: string; valid: boolean } | ILine, isSelected: boolean = false) {
    return StyleUtils.getStrokeAndFill(this.getColor(line.attribute), line.valid, { isSelected }).stroke;
  }

  public drawLines = () => {
    try {
      const lineList = _.cloneDeep(this.attributeFilteredLines);

      if (this.isHidden) {
        return;
      }

      lineList.forEach((line: ILine) => {
        if (line.id === this.selectedID) {
          return;
        }
        if (line.pointList) {
          line.pointList.map((i) => Object.assign(i, this.getRenderAxis(i)));
          const { order, label } = line;
          const displayOrder = order;
          const color = line && this.getLineColorByAttribute(line);

          this.drawLine(line.pointList, undefined, color, false);
          this.drawLineNumber(line.pointList[0], displayOrder, color, label, line.attribute, line.valid);

          if (line.id !== this.textEditingID) {
            this.drawLineTextAttribute(line.pointList[1], color, line?.textAttribute);
          }
        }
      });
    } catch (e) {
      console.error(e, '线条工具数据解析错误');
      this.lineList = [];
      this.clearCanvas();
    }
  };

  /**
   * 渲染已经绘制的线段
   */
  public render = (nextPoint?: IPoint) => {
    super.render();
    this.drawLines();
    this.drawActivatedLine(nextPoint, undefined, true);
    this.renderTextAttribute();
    this.renderCursorLine(this.getLineColor(this.defaultAttribute));
  };

  /** 重新计算并渲染热区 */
  public updateActiveArea() {
    this.activeArea = this.getActiveArea();
    this.renderActiveArea();
  }

  public getActiveArea() {
    return this.activeLine && this.activeLine.length > 0
      ? MathUtils.calcViewportBoundaries(this.activeLine, this.isCurve, SEGMENT_NUMBER, this.zoom)
      : undefined;
  }

  /**
   * 绘制线条序号（包含属性或者标签）
   * @param coord
   * @param order
   * @param color
   * @param label
   * @param attribute
   * @param valid
   */
  public drawLineNumber(
    coord: ICoordinate,
    order: number = 1,
    color: string,
    label: string = '',
    attribute?: string,
    valid: boolean = true,
  ) {
    if ((this.showOrder || this.attributeConfigurable) && this.ctx) {
      let text = this.showOrder ? order.toString() : `${label}`;

      if (this.attributeConfigurable) {
        const keyForAttribute = attribute
          ? this.attributeList?.find((i: any) => i.value === attribute)?.key ?? attribute
          : '';

        text = [text, `${!valid && keyForAttribute ? '无效' : ''}${keyForAttribute}`].filter((i) => i).join('_');
      }

      this.drawText(coord, text, color);
    }
  }

  /**
   * 绘制线条的文本属性
   * @param coord
   * @param text
   * @param color
   */
  public drawLineTextAttribute(coord: ICoordinate, color: string, text?: string) {
    if (coord && text) {
      return this.drawText(coord, text, color, 200);
    }
  }

  public drawText(coord: ICoordinate, text: string, color: string, lineWidth?: number) {
    if (this.ctx) {
      this.ctx?.save();
      this.ctx.font = 'italic bold 14px SourceHanSansCN-Regular';
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      this.ctx.shadowOffsetY = 2;
      this.ctx.shadowBlur = 4;

      if (lineWidth) {
        DrawUtils.wrapText(this.canvas, text, coord.x - LINE_ORDER_OFFSET.x, coord.y - LINE_ORDER_OFFSET.y, lineWidth);
      } else {
        this.ctx.fillText(text, coord.x - LINE_ORDER_OFFSET.x, coord.y - LINE_ORDER_OFFSET.y);
      }

      this.ctx?.restore();
    }
  }

  /**
   * 更新热区
   * @param offsetX
   * @param offsetY
   */
  public moveActiveArea(offsetX: number, offsetY: number) {
    if (this.activeArea) {
      this.activeArea = Object.assign(this.activeArea, {
        top: this.activeArea.top + offsetY,
        bottom: this.activeArea.bottom + offsetY,
        right: this.activeArea.right + offsetX,
        left: this.activeArea.left + offsetX,
      });
    }

    if (this.activeLine) {
      this.activeLine.map((i) => Object.assign(i, { x: i.x + offsetX, y: i.y + offsetY }));
      this.updateLines();
    }
  }

  /**
   * 找到当前hover的点
   * @param coord
   */
  public findHoveredPoint(coord: ICoordinate) {
    if (!this.activeLine) {
      return;
    }
    return this.activeLine.find((i) => {
      const iAxis = this.getRenderAxis(i);
      return LineToolUtils.calcDistance(iAxis, coord) <= POINT_ACTIVE_RADIUS;
    });
  }

  /** 找到当前hover的线段 */
  public findHoverLine(coord: ICoordinate) {
    const line = _.cloneDeep(this.lineList)
      .reverse()
      .find(({ pointList }) => {
        const list = pointList ? this.getPointList(pointList) : [];
        const scope = this.getLineWidthScope();
        return list.some((point, index) => {
          if (index === 0) {
            return false;
          }
          const point1 = this.getRenderAxis(point);
          const point2 = this.getRenderAxis(list[index - 1]);
          return LineToolUtils.isInLine(coord, point1, point2, scope);
        });
      });

    return line;
  }

  /**
   * 找到当前点的边缘吸附范围
   * @param coord
   */
  public findAdsorptionPoint(coord: ICoordinate) {
    let point: ICoordinate | undefined;
    let minDistance: number;
    let snappedPoint: ICoordinate | undefined;

    _.cloneDeep(this.lineList)
      .reverse()
      .forEach(({ pointList, id }) => {
        if (id === this.selectedID || !pointList || pointList?.length < 2) {
          return;
        }

        if (snappedPoint) {
          return;
        }

        const nearestPoint = this.findNearestPoint(pointList, coord);

        if (nearestPoint) {
          /** 匹配到顶点时退出 */
          if (nearestPoint.minDistance === 0) {
            point = nearestPoint.point;
            return;
          }

          if (minDistance === undefined || nearestPoint.minDistance < minDistance) {
            point = nearestPoint.point;
            minDistance = nearestPoint.minDistance;
          }
        }
      });
    return snappedPoint || point;
  }

  /**
   * 找到由pointList连成线的最近的点, 优先匹配顶点
   * @param axisAreas
   * @param coord 渲染坐标
   * @param pointList
   * @returns 落点的渲染坐标
   */
  public findNearestPoint(pointList: ICoordinate[], coord: ICoordinate, minLength: number = 7) {
    let point: ICoordinate | undefined;
    const minDistance: number = minLength;
    for (let i = 1; i <= pointList.length - 1; i++) {
      const point1 = this.getRenderAxis(pointList[i]);
      const point2 = this.getRenderAxis(pointList[i - 1]);
      const { length, footPoint } = MathUtils.getFootOfPerpendicular(coord, point1, point2);
      const twoPointDistance1 = LineToolUtils.calcTwoPointDistance(point1, coord);
      const twoPointDistance2 = LineToolUtils.calcTwoPointDistance(point2, coord);

      if (twoPointDistance1 <= minLength * 2) {
        point = point1;
        minLength = 0;
        break;
      }

      if (twoPointDistance2 <= minLength * 2) {
        point = point2;
        minLength = 0;
        break;
      }

      if (length < minLength) {
        point = footPoint;
        minLength = length;
      }
    }
    return point ? { point, minDistance } : undefined;
  }

  public getPointList(pointList: ILinePoint[]) {
    return this.isCurve ? createSmoothCurvePointsFromPointList(pointList, SEGMENT_NUMBER) : pointList;
  }

  /**
   * 计算依赖拉框、多边形的情况下移动后点是否都在范围内
   * @param offsetX
   * @param offsetY
   */
  public moveLineInPolygon = (offsetX: number, offsetY: number) => {
    if (!Array.isArray(this.activeLine)) {
      return false;
    }

    const allPointsInRange = this.activeLine?.every((i) => {
      return this.isInPolygon({ x: i.x + offsetX, y: i.y + offsetY });
    });

    if (allPointsInRange) {
      this.lineMoved = true;
      this.moveActiveArea(offsetX, offsetY);
    }
  };

  /**
   * 在矩形内移动线条
   * @param offsetX x轴的偏移量
   * @param offsetY y轴的偏移量
   * @param rectHorizontalRange 矩形的水平范围
   * @param rectVerticalRange 矩形的垂直范围
   */
  public moveLineInRectRange = (
    offsetX: number,
    offsetY: number,
    rectHorizontalRange: number[],
    rectVerticalRange: number[],
  ) => {
    if (this.activeArea === undefined) {
      return;
    }
    const { top, left, right, bottom } = this.activeArea;
    const hBoundaries = [left, right].map((i) => (_.isNumber(i) ? i + offsetX : 0));
    const vBoundaries = [top, bottom].map((i) => (_.isNumber(i) ? i + offsetY : 0));
    const horizontalInRange = left >= 0 && right && MathUtils.isInRange(hBoundaries, rectHorizontalRange);
    const verticalInRange = top >= 0 && bottom && MathUtils.isInRange(vBoundaries, rectVerticalRange);
    const calcOffsetX = horizontalInRange ? offsetX : 0;
    const calcOffsetY = verticalInRange ? offsetY : 0;

    this.lineMoved = true;
    this.moveActiveArea(calcOffsetX, calcOffsetY);
  };

  /**
   * 移动选中的线段
   * @param coord
   */
  public moveSelectedLine(coord: ICoordinate) {
    if (this.activeArea === undefined) {
      return;
    }

    const offsetX = (coord.x - this.prevAxis.x) / this.zoom;
    const offsetY = (coord.y - this.prevAxis.y) / this.zoom;

    /** 允许目标外 */
    if (this.enableOutOfTarget) {
      this.lineMoved = true;
      this.moveActiveArea(offsetX, offsetY);
      return;
    }

    if (this.isDependPolygon) {
      this.moveLineInPolygon(offsetX, offsetY);
      return;
    }

    let rectHorizontalRange = [0, this.imageSize.width];
    let rectVerticalRange = [0, this.imageSize.height];

    if (this.isDependRect) {
      const { x, y, width, height } = this.dependData;
      rectHorizontalRange = [x, x + width];
      rectVerticalRange = [y, y + height];
    }
    this.moveLineInRectRange(offsetX, offsetY, rectHorizontalRange, rectVerticalRange);
  }

  /**
   * 移动选中的点
   * @param coord
   */
  public moveSelectPoint(coord: ICoordinate) {
    const offsetX = coord.x - this.prevAxis.x;
    const offsetY = coord.y - this.prevAxis.y;
    const newX = (this.selectedPoint ? this.selectedPoint.x : 0) + offsetX / this.zoom;
    const newY = (this.selectedPoint ? this.selectedPoint.y : 0) + offsetY / this.zoom;
    const pointPosition = {
      x: newX,
      y: newY,
    };

    if (this.isDependPolygon && !this.isInPolygon(pointPosition) && !this.enableOutOfTarget) {
      return;
    }

    Object.assign(this.selectedPoint, this.pointOverImage(pointPosition));
    this.updateLines();
  }

  /**
   * 计算出下一个将要绘制的点
   * @param e
   * @param nextPoint
   */
  public getNextPoint(e: MouseEvent | KeyboardEvent | { altKey: boolean; shiftKey?: boolean }, nextPoint: ICoordinate) {
    let newPoint = nextPoint;

    if (this.activeLine && this.activeLine.length > 0) {
      const lastPoint = this.activeLine.slice(-1)[0];
      newPoint = LineToolUtils.newPointPosition(
        !!e.shiftKey,
        lastPoint,
        nextPoint,
        this.getAbsAxis(nextPoint),
        this.getRenderAxis(lastPoint),
      );
    }

    if (this.edgeAdsorptionEnabled && !e.altKey) {
      const edgeAdsorptionPoint = this.findAdsorptionPoint(newPoint);
      newPoint = edgeAdsorptionPoint || newPoint;
    }

    return this.calcNextPointOfTarget(newPoint);
  }

  public calcNextPointOfTarget(newPoint: ICoordinate) {
    return this.enableOutOfTarget ? newPoint : this.pointRenderingAxisOverImage(newPoint);
  }

  // TODO: 渲染hover样式
  public lineHover(coord: ICoordinate) {
    const hitLine = this.findHoverLine(coord);
    this.hoverID = hitLine?.id;
    this.render();
  }

  /** 鼠标移动事件 */
  public mouseMoveHandler(e: MouseEvent) {
    const coord = this.getAxis(e);
    const isLeftClick = e.which === 1;
    if (this.isCreate) {
      if (this.activeLine && this.activeLine.length > 0) {
        this.renderNextPoint(e, coord);
      }
      return;
    }

    if (this.isNone) {
      this.lineHover(coord);
      if (this.edgeAdsorptionEnabled && !e.altKey) {
        const edgeAdsorptionPoint = this.findAdsorptionPoint(coord);
        if (edgeAdsorptionPoint) {
          this.arc(edgeAdsorptionPoint);
        }
      }
    }

    if (this.isActive) {
      if (this.selectedPoint && isLeftClick) {
        this.moveSelectPoint(coord);
        this.render();
        return;
      }

      if (isLeftClick && this.isMousedown && this.coordsClickedActiveArea) {
        this.moveSelectedLine(coord);
        this.drawActivatedLine(undefined, undefined, true);
        return;
      }

      if (!this.isMousedown) {
        if (this.isShift) {
          const hoverEdgeIndex = this.getPointInsertIndex(coord, 2) - 1;
          this.hoverEdgeIndex = hoverEdgeIndex > -1 ? hoverEdgeIndex : -1;
        } else {
          this.drawPointWhenHover(coord);
        }

        this.render();
      }
    }
  }

  public onMouseMove(e: MouseEvent) {
    if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
      return;
    }
    const coord = this.getAxis(e);
    this.mouseMoveHandler(e);
    this.prevAxis = coord;
  }

  /**
   * 设置激活区域
   * @param coord
   * @param outsideCancel
   * @todo 拖拽区域取消选中
   */
  public setActiveArea(coord: ICoordinate, outsideCancel: boolean = false) {
    const activeLine = this.findHoverLine(coord);
    if (activeLine) {
      const index = this.lineList.findIndex((i) => i.id === activeLine?.id);
      const area = MathUtils.calcViewportBoundaries(
        activeLine?.pointList || [],
        this.isCurve,
        SEGMENT_NUMBER,
        this.zoom,
      );
      const line = this.lineList[index];
      this.updateStatus(EStatus.Active);
      this.setActiveLine(line.pointList);
      this.setSelectedLineID(line.id);
      this.activeArea = area;
      this.updateLineAttributes(line);
    } else if (outsideCancel) {
      this.setNoneStatus();
    }

    this.render();
  }

  /**
   * 根据id选中线条
   * @param id
   */
  public setActiveLineByID(id: string) {
    const line = this.lineList.find((i) => i.id === id);
    if (line) {
      const area = MathUtils.calcViewportBoundaries(line?.pointList || [], this.isCurve, SEGMENT_NUMBER, this.zoom);
      this.updateStatus(EStatus.Active);
      this.setActiveLine(line.pointList);
      this.setSelectedLineID(line.id);
      this.activeArea = area;
      this.updateLineAttributes(line);
    }

    this.render();
  }

  public setActiveLine(pointList?: ILinePoint[]) {
    this.activeLine = pointList ? _.cloneDeep(pointList) : undefined;
  }

  public onContextmenu = (e: MouseEvent) => {
    super.onContextmenu(e);

    e.preventDefault();
    this.cursor = undefined;

    this.emit('contextmenu');

    if (this.isCreate) {
      if (this.activeLine && this.activeLine?.length < this.lowerLimitPointNum) {
        // message.info(`顶点数不能少于${this.lowerLimitPointNum}`);
        return true;
      }
      /** 新建线条后在文本标注未开启时默认不选中, 续标后默认选中 */
      const isActiveAfterCreating = this.selectedID ? true : !!this.isTextConfigurable;

      this.stopLine(true, isActiveAfterCreating);
      return;
    }

    this.setActiveArea(this.getAxis(e), true);
  };

  /**
   * 获取绝对坐标
   * @param coord
   */
  public getAbsAxis = (coord: ICoordinate) => {
    return {
      x: (coord.x - this.currentPos.x) / this.zoom,
      y: (coord.y - this.currentPos.y) / this.zoom,
    };
  };

  /**
   * 获取画布渲染的坐标
   * @param coord
   */
  public getRenderAxis = (coord: ICoordinate) => {
    return {
      x: coord.x * this.zoom + this.currentPos.x,
      y: coord.y * this.zoom + this.currentPos.y,
    };
  };

  public historyChanged(funcName: 'undo' | 'redo') {
    if (this.isCreate) {
      const record = this.actionsHistory && this.actionsHistory[funcName]();
      this.setActiveLine(record);
      this.render();
      return;
    }

    if (this.history) {
      const currentHistory = this.history[funcName]();
      const activeLine = currentHistory.find((i: ILine) => i.id === this.selectedID);
      this.lineList = currentHistory;
      if (this.selectedID && activeLine) {
        this.setActiveLine(activeLine?.pointList);
      } else {
        this.setNoneStatus();
      }
      this.render();
    }

    this.emit('dataUpdated', this.lineList);
  }

  public updateSelectedAttributeAfterHistoryChanged = () => {
    if (this.selectedID) {
      const line = this.lineList.find((i) => i.id === this.selectedID);
      const attribute = line?.attribute;
      if (typeof attribute === 'string') {
        this.defaultAttribute = attribute;
        this.updateAttribute(attribute);
        this.render();
      }
    }
  };

  public undo() {
    this.historyChanged('undo');
    this.updateSelectedAttributeAfterHistoryChanged();
  }

  public redo() {
    this.historyChanged('redo');
    this.updateSelectedAttributeAfterHistoryChanged();
  }

  /** 坐标是否在图片内 */
  public axisAtTarget(coord: ICoordinate) {
    if (this.isDependPolygon) {
      return this.isInPolygon(coord);
    }
    if (this.isDependRect) {
      const { x, y, width, height } = this.dependData;
      const rectHorizontalRange = [x, x + width];
      const rectVerticalRange = [y, y + height];
      return MathUtils.isInRange(coord.x, rectHorizontalRange) && MathUtils.isInRange(coord.y, rectVerticalRange);
    }

    return (
      MathUtils.isInRange(coord.x, [0, this.imageSize.width]) &&
      MathUtils.isInRange(coord.y, [0, this.imageSize.height])
    );
  }

  /**
   * 获取当前点插入的索引
   * @returns index
   */
  public getPointInsertIndex(coord?: ICoordinate, scope?: number) {
    if (coord && this.activeLine) {
      const pointList = this.getPointList(this.activeLine);
      if (this.activeLine.length === 2) {
        return 1;
      }

      return this.activeLine.findIndex((i, index) => {
        if (index > 0) {
          const straightLinePoints = this.activeLine ? this.activeLine[index - 1] : undefined;

          const points = this.isCurve
            ? pointList.slice((index - 1) * (SEGMENT_NUMBER + 1), index * (SEGMENT_NUMBER + 1))
            : [straightLinePoints, i];
          return this.pointInLine(points, coord, scope || this.getLineWidthScope());
        }
        return false;
      });
    }
    return -1;
  }

  public getLineWidthScope() {
    return this.lineStyle.lineWidth;
  }

  public onClick = (e: MouseEvent) => {
    const coord = this.getAxis(e);
    const { lineMoved } = this;

    this.lineMoved = false;

    /** 空格点击为拖拽事件 */
    if (this.isSpaceKey) {
      return;
    }

    if (this.isNone && e.ctrlKey) {
      const hitLine = this.findHoverLine(coord);
      if (hitLine) {
        this.setInvalidLine(hitLine.id);
      }
      return;
    }

    /** 超过上线点无法继续添加 */
    if (
      this.isCreate &&
      this.activeLine &&
      this.upperLimitPointNum &&
      ~~this.upperLimitPointNum <= this.activeLine.length
    ) {
      return;
    }

    const clickToNewLine = this.isActive && !this.coordsClickedActiveArea && !this.selectedPoint;

    if (this.isCreate || this.isNone || clickToNewLine) {
      /** 禁止目标外标注 */
      if (
        !this.enableOutOfTarget &&
        (clickToNewLine || (this.isNone && this.activeLine?.length === 0)) &&
        !this.axisAtTarget(this.getAbsAxis(coord))
      ) {
        return;
      }

      const nextAxis = this.getNextPoint(e, coord);

      /** 激活点击时候重新创建线条 */
      if (clickToNewLine) {
        this.setNoneStatus(false);
        this.updateStatus(EStatus.Create, true);
      }

      this.arc(nextAxis);
      this.addPoint(nextAxis);
      this.updateStatus(EStatus.Create, !this.selectedID);
      return;
    }

    if (this.activeLine && this.activeLine.length > 0) {
      if (this.isActive) {
        if (this.selectedPoint) {
          const prePoint = this.activeLine.find((i: any) => i.id === this.selectedPoint?.id);

          if (prePoint && !_.isEqual(prePoint, this.selectedPoint)) {
            Object.assign(prePoint, this.selectedPoint);
            this.updateLines();
            this.history?.pushHistory(this.lineList);
          }

          this.selectedPoint = undefined;
          this.render();
          return;
        }

        const insertIndex = this.getPointInsertIndex(this.cursor);
        const pointsWithInRange = this.pointsWithinRange(this.activeLine?.length + 1);

        /** 添加点 */
        if (this.cursor && !this.selectedPoint && insertIndex > -1 && !lineMoved && pointsWithInRange && !e.shiftKey) {
          this.activeLine.splice(insertIndex, 0, { ...this.getAbsAxis(this.cursor), id: uuid() });
          this.updateLines();
          this.history?.pushHistory(this.lineList);
          this.render();
          this.cursor = undefined;
          return;
        }

        const specialEdgeIndex = this.getPointInsertIndex(coord, 2) - 1;

        /** 设置为特殊边 */
        if (!this.selectedPoint && specialEdgeIndex > -1 && !lineMoved && e.shiftKey) {
          const pointData = this.activeLine[specialEdgeIndex];
          pointData.specialEdge = !pointData.specialEdge;
          this.hoverEdgeIndex = -1;
          this.render();
          return;
        }

        if (this.coordsClickedActiveArea && e.ctrlKey) {
          this.setInvalidLine(this.selectedID);
        }
      }
    }
  };

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation || !this.imgInfo) {
      return;
    }

    const coord = this.getAxis(e);
    this.isMousedown = true;
    this.prevAxis = coord;
    if (e.which === 3) {
      this.cursor = undefined;
      return;
    }
    this.selectedPoint = this.findHoveredPoint(coord);
    this.coordsClickedActiveArea =
      this.isActive && this.activeArea ? LineToolUtils.inArea(this.activeArea, this.getAbsAxis(coord)) : false;
    this.lineMoved = false;
  }

  public lineHasChanged() {
    const line = this.lineList.find((i) => i.id === this.selectedID);
    return line ? JSON.stringify(line.pointList) !== JSON.stringify(this.activeLine) : false;
  }

  public updateLines() {
    const line = this.lineList.find((i) => i.id === this.selectedID);
    if (line) {
      line.pointList = _.cloneDeep(this.activeLine);
      this.emit('dataUpdated', this.lineList);
    }
  }

  public onMouseUp(e: MouseEvent) {
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    /** 非创建状态，记录当前被修改的线条 */
    if (this.isMousedown && !this.isCreate) {
      const lineChanged = this.lineHasChanged();
      if (lineChanged) {
        this.updateLines();
        this.history?.pushHistory(this.lineList);
      }
    }

    this.isMousedown = false;
  }

  public onDblclick = () => {};

  public isTextValid(text: string) {
    return AttributeUtils.textAttributeValidate(this.textCheckType, this.customFormat, text);
  }

  public createLineData() {
    const id = uuid();
    const newLine: ILine = {
      pointList: _.cloneDeep(this.activeLine),
      id,
      valid: this.isLineValid,
      order: this.nextOrder(),
    };
    newLine.attribute = this.defaultAttribute;
    return newLine;
  }

  /**
   * 停止当前的线条绘制
   * @param isAppend
   */
  public stopLine(isAppend: boolean = true, setActive: boolean = true) {
    let selectedID;
    if (isAppend) {
      if (this.selectedID) {
        const line = this.lineList.find((i) => i.id === this.selectedID);
        selectedID = this.selectedID;
        if (line) {
          line.pointList = _.cloneWith(this.activeLine);
          if (!_.isEqual(line.pointList, this.history?.pushHistory(this.lineList))) {
            this.history?.pushHistory(this.lineList);
          }
        }
      } else if (this.isCreate && this.activeLine && this.activeLine.length > 1) {
        const newLine = this.createLineData();
        selectedID = newLine.id;
        this.lineList.push(newLine);
        this.history?.pushHistory(this.lineList);
      }
    }

    if (setActive) {
      this.setActiveStatus(selectedID);
    } else {
      this.setNoneStatus();
    }

    this.actionsHistory?.empty();
    this.emit('dataUpdated', this.lineList);
    this.render();
  }

  public setActiveStatus(id?: string) {
    const line = id ? this.lineList.find((i) => i.id === id) : undefined;
    if (line) {
      const pointList = line?.pointList;
      this.updateStatus(EStatus.Active);
      this.setActiveLine(pointList);
      this.setSelectedLineID(id);
    } else {
      this.setNoneStatus();
    }
  }

  /**
   * 设置为无状态
   * @param updateStatus
   */
  public setNoneStatus(updateStatus: boolean = true) {
    if (updateStatus) {
      this.updateStatus(EStatus.None);
    }
    this.activeLine = [];
    this.setSelectedLineID(undefined);
    this.activeArea = undefined;
    this.isLineValid = true;
    this.cursor = undefined;
  }

  public setKeyDownStatus(e: KeyboardEvent, value?: boolean) {
    this.isShift = value ?? e.keyCode === EKeyCode.Shift;
    this.isCtrl = value ?? e.keyCode === EKeyCode.Ctrl;
    this.isAlt = value ?? e.keyCode === EKeyCode.Alt;
  }

  public onKeyUp = (e: KeyboardEvent) => {
    super.onKeyUp(e);

    this.isShift = false;
    this.hoverEdgeIndex = -1;

    if (e.keyCode === EKeyCode.Esc) {
      this.stopLine(false);
      return;
    }

    if (this.isActive) {
      if (e.keyCode === EKeyCode.Delete) {
        this.deleteLine();
        this.render();
        return;
      }

      if (e.keyCode === EKeyCode.F && this.selectedID) {
        this.setInvalidLine(this.selectedID);
        return;
      }

      if (e.keyCode === EKeyCode.Space) {
        this.updateStatus(EStatus.Create);
        this.cursor = undefined;
        this.actionsHistory?.pushHistory(this.activeLine);
        this.render();
        return;
      }
    }

    if (this.isCreate) {
      this.renderNextPointByKeyboardEvent(e);
    }
  };

  /** 创建无效线条，activeLineID存在时为续标（没有按ctrl时不会修改其有无效性），不会设置无效的属性 */
  public setInvalidLineOnCreating(e: KeyboardEvent) {
    if ((this.selectedID && e.keyCode !== EKeyCode.Ctrl) || !this.isCreate) {
      return;
    }
    const valid = !e.ctrlKey;
    if (this.selectedID) {
      this.setInvalidLine(this.selectedID, valid, false);
    } else {
      this.isLineValid = valid;
    }
  }

  public onKeyDown(e: KeyboardEvent) {
    super.onKeyDown(e);

    this.setKeyDownStatus(e);

    if (e.keyCode === EKeyCode.Z && !e.ctrlKey) {
      this.toggleIsHide();
    }

    /** 绘制水平/垂直线 */
    if (e.keyCode === EKeyCode.Shift) {
      this.render();
    }

    if (e.keyCode === EKeyCode.Tab) {
      e.preventDefault();
      this.selectToNextLine(e);
      return;
    }

    if (this.isCreate) {
      this.renderNextPointByKeyboardEvent(e);
    }
  }

  private selectToNextLine(e: KeyboardEvent) {
    const nextSelectedLine = CommonToolUtils.getNextSelectedRectIDByEvent(
      this.viewPortLines.map((i: any) => ({
        ...i,
        x: i.pointList[0]?.x ?? 0,
        y: i.pointList[0]?.y ?? 0,
      })),
      e,
      this.selectedID,
    );

    if (nextSelectedLine) {
      this.setActiveLineByID(nextSelectedLine.id);
    }
  }

  /**
   * 在线条创建时候的键盘事件。
   *  1.设为无效。
   *  2.Alt取消边缘吸附。
   *  3.Shift绘制垂直/水平线
   * @param e
   */
  public renderNextPointByKeyboardEvent(e: KeyboardEvent) {
    if (e.keyCode === EKeyCode.Ctrl) {
      this.setInvalidLineOnCreating(e);
    }

    if ([EKeyCode.Shift, EKeyCode.Alt].includes(e.keyCode)) {
      this.renderNextPoint(e, this.prevAxis);
    }
  }

  /**
   * 计算出下一个点并渲染
   * @param e
   * @param coord
   */
  public renderNextPoint(e: MouseEvent | KeyboardEvent | { altKey: boolean }, coord: ICoordinate) {
    const nextPoint = this.getNextPoint(e, coord);
    this.render(nextPoint);
  }

  public onRightDblClick = (e: MouseEvent) => {
    super.onRightDblClick(e);

    const coord = this.getAxis(e);
    if (this.isActive) {
      const hoverPoint = this.findHoveredPoint(coord);

      /* 删除点 */
      if (hoverPoint && this.activeLine) {
        const pointsWithinRange = this.pointsWithinRange(this.activeLine?.length - 1);
        if (pointsWithinRange) {
          this.setActiveLine(this.activeLine.filter((i) => i.id !== hoverPoint.id));
          this.updateLines();
          this.history?.pushHistory(this.lineList);
        }
        this.cursor = undefined;
        this.render();
        return;
      }

      /** 删除线 */
      const area = MathUtils.calcViewportBoundaries(this.activeLine, this.isCurve, SEGMENT_NUMBER, this.zoom);
      const axisOnArea = LineToolUtils.inArea(area, this.getAbsAxis(coord));
      if (axisOnArea) {
        this.deleteLine();
      }
    }
  };

  /** 删除激活的线段 */
  public deleteLine() {
    this.lineList = this.lineList.filter((i) => i.id !== this.selectedID);
    this.history?.pushHistory(this.lineList);
    this.setNoneStatus();
    this.emit('dataUpdated', this.lineList);
    this.render();
  }

  public setInvalidLine(id?: string, valid?: boolean, isRender: boolean = true) {
    const line = this.lineList.find((i) => i.id === id);
    if (line) {
      line.valid = valid !== undefined ? valid : !line.valid;
      this.history?.pushHistory(this.lineList);
      if (isRender) {
        this.render();
      }
    }
  }

  /**
   * 数据清空
   */
  public empty() {
    this.lineList = [];
    this.setNoneStatus();
    this.selectedPoint = undefined;
    this.actionsHistory?.empty();
    this.history?.init();
    this.emit('dataUpdated', this.lineList);
    this.render();
  }

  /** 设置线条属性 */
  public setAttribute(attribute: string) {
    if (this.attributeConfigurable) {
      this.defaultAttribute = attribute;
      this.setLineAttribute('attribute', attribute);
      if (this.selectedID) {
        this.history?.pushHistory(this.lineList);
      }
    }
  }

  /** 设置线条文本标注属性 */
  public setTextAttribute(text: string) {
    if (this.isTextConfigurable) {
      this.setLineAttribute('textAttribute', text);
      this.history?.applyAttribute(this.selectedID, 'textAttribute', text);
    }
  }

  /** 更新线条的属性 */
  public setLineAttribute(key: 'attribute' | 'textAttribute', value: string, id?: string) {
    const targetID = id || this.selectedID;

    if (targetID) {
      const line = this.lineList.find((i) => i.id === targetID);
      if (line) {
        line[key] = value;
      }
    }

    this.render();
  }

  /** 更新外部属性列表的选中值 */
  public updateAttribute(attribute: string) {
    this.emit('updateAttribute', attribute);
  }

  /** 更新线条的属性 */
  public updateLineAttributes(line: ILine) {
    if (this.attributeConfigurable && line) {
      const attribute = line?.attribute || '';
      this.defaultAttribute = attribute;
      this.updateAttribute(attribute);
    }

    if (this.isTextConfigurable && line) {
      const text = line?.textAttribute || '';
      this.updateTextAttribute(text);
    }

    this.history?.updateHistory(this.lineList);
  }

  public lineStatusChanged() {
    this.emit('lineStatusChanged', {
      status: this.status,
      selectedLineID: this.selectedID,
    });
  }

  public updateTextAttribute(text: string) {
    if (this.selectedID) {
      const line = this.lineList.find((i) => i.id === this.selectedID);
      if (line) {
        line.textAttribute = text;
      }
    }

    this.emit('updateText', text);
  }

  /** 保存当前绘制的数据, 避免创建中的数据不会被保存到 */
  public saveData() {
    this.stopLine();
    this.setNoneStatus();
    this.render();
  }

  public setTextEditingID(id: string) {
    this.textEditingID = id;
    this.render();
  }

  public setSelectedLineID(id?: string) {
    if (this.selectedID === id) {
      return;
    }

    if (!id) {
      this._textAttributeInstance?.changeSelected();
      this._textAttributeInstance?.clearTextAttribute();
    }

    this.selectedID = id;
    this.emit('selectedChange');
  }

  public attributeLockListChange(attributeLockList: string[]) {
    this.attributeLockList = attributeLockList;
    this.render();
  }

  public setReference = (isReference: boolean) => {
    this.isReference = isReference;
  };

  /** 线条的点数在限制范围内 */
  public pointsWithinRange = (count: number) => {
    if (this.lowerLimitPointNum && count < this.lowerLimitPointNum) {
      return false;
    }

    if (this.upperLimitPointNum && count > this.upperLimitPointNum) {
      return false;
    }

    return true;
  };

  public setResult(lineList: ILine[]) {
    this.setNoneStatus();
    this.setLineList(lineList);
    this.render();
  }

  public setLineList = (lineList: ILine[]) => {
    const lengthChanged = lineList.length !== this.lineListLen;

    this.lineList = lineList;

    if (lengthChanged) {
      this.emit('updatePageNumber');
    }
  };

  public setConfig(config: string) {
    super.setConfig(config);
  }

  public toggleIsHide() {
    this.setIsHidden(!this.isHidden);
    this.render();
  }

  public clearCanvas() {
    super.clearCanvas();
  }

  public exportData() {
    return [this.lineList, this.basicImgInfo];
  }

  public setDefaultAttribute(attribute: string = '') {
    if (this.attributeConfigurable) {
      this.defaultAttribute = attribute;
      this.setLineAttribute('attribute', attribute);
      if (this.selectedID) {
        this.history?.pushHistory(this.lineList);
      }
    }
  }

  public renderTextAttribute() {
    if (!this.ctx || !this.activeLine || this.activeLine?.length < 2) {
      return;
    }

    const valid = this.isActiveLineValid();
    const attribute = this.defaultAttribute;

    const { x, y } = this.activeLine[1];

    const coordinate = this.getRenderAxis({ x, y });
    const toolColor = this.getColor(attribute);
    const color = valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    const textAttribute = this.lineList.find((i) => i.id === this.selectedID)?.textAttribute ?? '';

    if (!this._textAttributeInstance) {
      this._textAttributeInstance = new TextAttributeClass({
        container: this.container,
        icon: this.getTextIconSvg(attribute),
        color,
        getCurrentSelectedData: () => ({
          color,
          textAttribute,
        }),
        updateSelectedTextAttribute: this.updateSelectedTextAttribute,
      });
    }

    if (this._textAttributeInstance && !this._textAttributeInstance?.isExit) {
      this._textAttributeInstance.appendToContainer();
    }

    this._textAttributeInstance.update(`${textAttribute}`, {
      left: coordinate.x,
      top: coordinate.y,
      color,
    });
  }

  public getTextIconSvg(attribute = '') {
    return AttributeUtils.getTextIconSvg(
      attribute,
      this.config.attributeList,
      this.config.attributeConfigurable,
      this.baseIcon,
    );
  }

  /** 更新文本输入，并且进行关闭 */
  public updateSelectedTextAttribute(newTextAttribute?: string) {
    if (this._textAttributeInstance && newTextAttribute && this.selectedID) {
      let textAttribute = newTextAttribute;
      if (AttributeUtils.textAttributeValidate(this.config.textCheckType, '', textAttribute) === false) {
        this.emit('messageError', AttributeUtils.getErrorNotice(this.config.textCheckType, this.lang));
        textAttribute = '';
      }

      this.setTextAttribute(textAttribute);
      this.emit('updateTextAttribute');
      this.render();
    }
  }

  public textChange = (v: string) => {
    if (this.config.textConfigurable === false || !this.selectedID) {
      return;
    }

    this.setTextAttribute(v);
    this.emit('selectedChange'); // 触发外层的更新
    this.render();
  };
}

export default LineToolOperation;
