import _ from 'lodash';
import { edgeAdsorptionScope, ELineTypes, EToolName } from '@/constant/tool';
import RectUtils from '@/utils/tool/RectUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import MarkerUtils from '@/utils/tool/MarkerUtils';
import MathUtils from '@/utils/MathUtils';
import { DEFAULT_TEXT_OFFSET, EDragStatus, ESortDirection } from '../../constant/annotation';
import EKeyCode from '../../constant/keyCode';
import locale from '../../locales';
import { EMessage } from '../../locales/constants';
import { IPolygonData } from '../../types/tool/polygon';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import AxisUtils from '../../utils/tool/AxisUtils';
import CommonToolUtils from '../../utils/tool/CommonToolUtils';
import DrawUtils from '../../utils/tool/DrawUtils';
import StyleUtils from '../../utils/tool/StyleUtils';
import uuid from '../../utils/uuid';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import TextAttributeClass from './textAttributeClass';
import Selection, { SetDataList } from './Selection';

const TEXTAREA_WIDTH = 200;

export interface IPointOperationProps extends IBasicToolOperationProps {
  style: any;
  forbidAddNew?: boolean;
  forbidDelete?: boolean;
}
class PointOperation extends BasicToolOperation {
  public config: IPointToolConfig;

  // 正在标的点

  public pointList: IPointUnit[];

  // 具体操作
  public hoverID?: string; // hover 到其中一个点上 会有hoverID

  // public selectedID?: string;

  public markerIndex: number; // 用于列表标签定位

  public dragInfo?: {
    dragStartCoord: ICoordinate;
    originPointList: IPointUnit[];
  };

  public selection: Selection;

  public _textAttributeInstance?: TextAttributeClass;

  public forbidAddNew?: boolean;

  public forbidDelete?: boolean;

  constructor(props: IPointOperationProps) {
    super(props);
    this.config = CommonToolUtils.jsonParser(props.config);
    this.pointList = [];
    this.markerIndex = 0;
    this.selection = new Selection(this);
    this.createPoint = this.createPoint.bind(this);
    this.getCurrentSelectedData = this.getCurrentSelectedData.bind(this);
    this.updateSelectedTextAttribute = this.updateSelectedTextAttribute.bind(this);
    this.setSelectedID = this.setSelectedID.bind(this);
    this.forbidAddNew = props.forbidAddNew ?? false;
    this.forbidDelete = props.forbidDelete ?? false;
  }

  get dataList() {
    return this.pointList;
  }

  get drawOutsideTarget() {
    // 兼容旧的目标外标注
    return this.config.drawOutsideTarget ?? this.config.drawPointOut;
  }

  get selectedID() {
    return this.selection.selectedID;
  }

  get selectedIDs() {
    return this.selection.selectedIDs;
  }

  get selectedPoints() {
    return this.pointList.filter((i) => this.selection.isIdSelected(i.id));
  }

  /**
   * 向外部提供标记的更改
   * @param markerIndex
   */
  public setMarkerIndex = (markerIndex: number) => {
    this.markerIndex = markerIndex;
  };

  /**
   * 更改当前列表标注位置，并且设置为选中
   * @param markerIndex
   * @returns
   */
  public setMarkerIndexAndSelect = (markerIndex: number) => {
    if (!this.config.markerList) {
      return;
    }

    this.markerIndex = markerIndex;
    const markerValue = this.config.markerList[markerIndex].value;

    const currentPoint = this.currentPageResult.find((point) => point.label === markerValue);

    if (currentPoint) {
      this.setSelectedID(currentPoint.id);
      if (this.config.attributeConfigurable === true) {
        this.setDefaultAttribute(currentPoint.attribute);
      }
    }
    this.emit('markIndexChange');
  };

  /**
   * 设置下一个列表选择器
   * @param pointList
   */
  public setNextMarker(pointList = this.pointList) {
    if (this.hasMarkerConfig) {
      const nextMarkerInfo = CommonToolUtils.getNextMarker(
        this.getCurrentPageResult(pointList),
        this.config.markerList,
      );
      if (nextMarkerInfo) {
        this.setMarkerIndexAndSelect(nextMarkerInfo.index);
      }
    }
  }

  public setResult(pointList: IPointUnit[]) {
    this.clearActiveStatus();
    this.setPointList(pointList);
    this.setNextMarker(pointList);
    this.recoverOperationMode();
    this.render();
  }

  /**
   * 设置当前的结果集
   * @param rectList
   * @param isUpload
   */
  public setPointList(pointList: IPointUnit[], isUpload = false) {
    const oldLen = this.pointList.length;
    this.pointList = pointList;

    if (oldLen !== pointList.length) {
      // 件数发生改变
      this.emit('updatePageNumber');
    }

    if (isUpload) {
      // 为了兼容外层实时同步数据 - （估计后面会干掉）
      this.emit('updateResult');
    }
  }

  public setConfig(config: string, isClear = false) {
    this.config = CommonToolUtils.jsonParser(config);
    if (isClear === true) {
      this.clearResult();
    }
  }

  // 全局操作
  public clearResult() {
    this.setPointList([]);
    this.setSelectedID(undefined);
    this.history.pushHistory([]);

    this.hoverID = '';
    this.render();
  }

  public setDefaultAttribute(defaultAttribute: string = '') {
    const oldDefault = this.defaultAttribute;
    this.defaultAttribute = defaultAttribute;

    if (oldDefault !== defaultAttribute) {
      // 如果更改 attribute 需要同步更改 style 的样式
      this.changeStyle(defaultAttribute);

      //  触发侧边栏同步
      this.emit('changeAttributeSidebar');

      // 如有选中目标，则需更改当前选中的属性
      if (this.selectedPoints.length > 0) {
        this.selectedPoints.forEach((point) => {
          point.attribute = defaultAttribute;
        });
        this.history.pushHistory(this.pointList);
        this.render();
      }

      if (this._textAttributeInstance) {
        if (this.attributeLockList.length > 0 && !this.attributeLockList.includes(defaultAttribute)) {
          // 属性隐藏
          this._textAttributeInstance.clearTextAttribute();
          return;
        }

        this._textAttributeInstance.updateIcon(this.getTextIconSvg(defaultAttribute));
      }
    }
  }

  /**
   * 外层 sidebar 调用
   * @param v
   * @returns
   */
  public textChange = (v: string) => {
    if (this.config.textConfigurable !== true || !this.selectedID) {
      return;
    }

    this.setPointList(AttributeUtils.textChange(v, this.selectedID, this.pointList));
    this.emit('selectedChange'); // 触发外层的更新
    this.render();
  };

  public get selectedText() {
    return this.pointList.find((item) => item.id === this.selectedID)?.textAttribute;
  }

  public setStyle(toolStyle: any) {
    super.setStyle(toolStyle);

    // 当存在文本 icon 的时候需要更改当前样式
    if (this._textAttributeInstance && this.config.attributeConfigurable === false) {
      this._textAttributeInstance?.updateIcon(this.getTextIconSvg());
    }
  }

  public setSelectedID(newID?: string, isAppend = false) {
    this.selection.setSelectedIDs(newID, isAppend);

    this.render();
    this.emit('selectedChange');
  }

  /**
   * 获取当前配置下的 icon svg
   * @param attribute
   */
  public getTextIconSvg(attribute = '') {
    return AttributeUtils.getTextIconSvg(
      attribute,
      this.config.attributeList,
      this.config.attributeConfigurable,
      this.baseIcon,
    );
  }

  /**
   *  清除所有的中间状态
   */
  public clearActiveStatus() {
    this.hoverID = undefined;
    this.dragStatus = EDragStatus.Wait;
    this.setSelectedID(undefined);
  }

  public setBasicResult(basicResult: any) {
    super.setBasicResult(basicResult);
    this.setNextMarker();

    this.clearActiveStatus();
  }

  /**
   * Offset is under zooming.
   * @param offset
   */
  public onDragMoveAll(offset: ICoordinate) {
    if (!this.dragInfo?.originPointList?.length) {
      return;
    }
    this.setPointList(
      this.dragInfo.originPointList.map((point: IPointUnit) => {
        const newRect = {
          ...point,
          x: point.x + offset.x / this.zoom,
          y: point.y + offset.y / this.zoom,
        };

        return newRect;
      }),
    );

    this.render();
  }

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation) {
      return;
    }

    // 当前目标下没有 hoverId 才进行标注
    if (e.button === 0 && !this.hoverID) {
      this.recoverOperationMode();
      this.createPoint(e);
      this.render();
      return;
    }

    /**
     * Drag precondition
     *
     * 1. hoverID === Selected ID
     * 2. It's multiMoveMode & Hover a point.
     */
    if (this.hoverID && this.selection.isIdSelected(this.hoverID) && e.button === 0) {
      this.dragStatus = EDragStatus.Start;
      this.dragInfo = {
        dragStartCoord: this.getCoordinateUnderZoom(e),
        originPointList: _.cloneDeep(this.selectedPoints),
      };
      return;
    }

    this.render();
    return true;
  }

  public onMouseMove(e: MouseEvent) {
    if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
      return;
    }

    this.hoverID = this.getHoverId();
    // 拖拽中
    if (this.dragStatus === EDragStatus.Start || this.dragStatus === EDragStatus.Move) {
      this.onDragMove(e);
    }

    // 鼠标划过 需要改变颜色
    if (this.hoverID) {
      this.render();
    }
    return undefined;
  }

  public onMouseUp(e: MouseEvent) {
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return true;
    }
    if (e.button === 2) {
      this.rightMouseUp(e);
    }
    // 拖拽停止
    if (this.dragStatus === EDragStatus.Move) {
      this.history.pushHistory(this.pointList);
      this.emit(
        'updatePointByDrag',
        this.pointList.find((v) => v?.id === this.selectedID),
        this.dragInfo?.originPointList,
      );
      this.dragInfo = undefined;
    }
    this.dragStatus = EDragStatus.Wait;
    this.render();
  }

  public onDragMove(e: MouseEvent) {
    if (!this.imgInfo) return;
    this.dragStatus = EDragStatus.Move;
    const coordinateZoom = this.getCoordinateUnderZoom(e);

    if (this.selectedIDs.length > 1 && this.dragInfo) {
      const offset = {
        x: coordinateZoom.x - this.dragInfo.dragStartCoord.x,
        y: coordinateZoom.y - this.dragInfo.dragStartCoord.y,
      };
      this.onDragMoveAll(offset);
      return;
    }
    // 缩放后的坐标
    const zoomCoordinate = AxisUtils.changeDrawOutsideTarget(
      coordinateZoom,
      { x: 0, y: 0 },
      this.imgInfo,
      this.drawOutsideTarget,
      this.basicResult,
      this.zoom,
    );
    const coordinate = this.drawOutsideTarget
      ? AxisUtils.getOriginCoordinateWithOffsetCoordinate(this.coord, this.zoom, this.currentPos) // 正常的坐标
      : AxisUtils.changePointByZoom(zoomCoordinate, 1 / this.zoom); // 恢复正常的坐标

    // 边缘判断
    if (this.drawOutsideTarget === false) {
      if (
        this.dependToolName === EToolName.Polygon &&
        this.basicResult?.pointList?.length > 0 &&
        !PolygonUtils.isInPolygon(coordinate, this.basicResult.pointList)
      ) {
        return;
      }
    }

    this.pointList.forEach((point) => {
      if (point.id === this.selectedID) {
        point.x = coordinate.x;
        point.y = coordinate.y;
      }
    });
    this.render();
  }

  public onKeyDown(e: KeyboardEvent) {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      // 如果为输入框则进行过滤
      return;
    }

    if (super.onKeyDown(e) === false) {
      return;
    }

    this.selection.triggerKeyboardEvent(e, this.setPointList.bind(this) as unknown as SetDataList);

    const { keyCode } = e;
    switch (keyCode) {
      case EKeyCode.Delete:
        this.deletePoint();
        break;
      case EKeyCode.Tab: {
        this.onTabKeyDown(e);
        break;
      }
      case EKeyCode.Z:
        this.setIsHidden(!this.isHidden);
        this.render();
        break;
      case EKeyCode.A:
        this.selection.selectAll();
        break;
      default: {
        if (this.config.attributeConfigurable) {
          const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(keyCode, this.config.attributeList);

          if (keyCode2Attribute !== undefined) {
            this.setDefaultAttribute(keyCode2Attribute);
          }
        }
        break;
      }
    }
  }

  // 点之间的距离不能小于0.2px
  public isMinDistance = (coord: ICoordinate) => {
    const transformCoord = AxisUtils.changePointByZoom(coord, this.zoom);
    return this.pointList.some((point) => {
      const transformPoint = AxisUtils.changePointByZoom(point, this.zoom);
      return MathUtils.getLineLength(transformPoint, transformCoord) < 0.2;
    });
  };

  public createPoint(e: MouseEvent) {
    if (!this.imgInfo) return;
    if (this.forbidAddNew) return;
    const { upperLimit } = this.config;
    if (upperLimit && this.currentPageResult.length >= upperLimit) {
      // 小于对应的下限点, 大于上限点无法添加
      this.emit('messageInfo', `${locale.getMessagesByLocale(EMessage.LowerLimitPoint, this.lang)}`);
      return;
    }

    const basicSourceID = CommonToolUtils.getSourceID(this.basicResult);
    const coordinateZoom = this.getCoordinateUnderZoom(e);
    let coordinate = AxisUtils.getOriginCoordinateWithOffsetCoordinate(this.coord, this.zoom, this.currentPos);

    if (this.config.edgeAdsorption && this.referenceData) {
      const isAllowEdgeAdsoption = [EToolName.Polygon, EToolName.Line].includes(this.referenceData?.toolName);

      // Currently only available for PolygonTool and LineTool
      if (isAllowEdgeAdsoption) {
        const isClose = this.referenceData?.toolName === EToolName.Polygon;

        const { dropFoot, hasClosed } = PolygonUtils.getClosestPoint(
          coordinate,
          this.referenceData.result as IPolygonData[],
          this.referenceData.config?.lineType ?? ELineTypes.Line,
          edgeAdsorptionScope / this.zoom,
          { isClose },
        );
        if (dropFoot) {
          coordinate = dropFoot;
        }
        if (hasClosed) {
          this.emit('messageSuccess', `${locale.getMessagesByLocale(EMessage.SuccessfulEdgeAdsorption, this.lang)}`);
        }
      }
    }

    // 边缘判断
    if (this.drawOutsideTarget === false) {
      if (this.dependToolName && this.basicCanvas) {
        let isOutSide = false;
        switch (this.dependToolName) {
          case EToolName.Rect: {
            // 依赖拉框
            isOutSide = !RectUtils.isInRect(coordinate, this.basicResult);
            break;
          }
          // 依赖多边型
          case EToolName.Polygon: {
            isOutSide = !PolygonUtils.isInPolygon(coordinate, this.basicResult.pointList);
            break;
          }
          default: {
            //
          }
        }

        if (isOutSide) {
          // 在边界外直接跳出
          return;
        }
      }

      if (
        coordinateZoom.x < 0 ||
        coordinateZoom.y < 0 ||
        coordinateZoom.x > this.imgInfo.width ||
        coordinateZoom.y > this.imgInfo.height
      ) {
        return;
      }
    }

    if (this.isMinDistance(coordinate)) {
      return;
    }

    let newDrawingPoint = {
      ...coordinate,
      attribute: this.defaultAttribute,
      valid: !e.ctrlKey,
      id: uuid(8, 62),
      sourceID: basicSourceID,
      textAttribute: '',
      order:
        CommonToolUtils.getMaxOrder(
          this.pointList.filter((v) => CommonToolUtils.isSameSourceID(v.sourceID, basicSourceID)),
        ) + 1,
    } as IPointUnit;

    // 文本注入
    if (this.config.textConfigurable) {
      let textAttribute = '';
      textAttribute = AttributeUtils.getTextAttribute(
        this.pointList.filter((point) => CommonToolUtils.isSameSourceID(point.sourceID, basicSourceID)),
        this.config.textCheckType,
      );
      // const { x, y } = AxisUtils.changePointByZoom(newDrawingPoint, 1 / this.zoom);
      newDrawingPoint = {
        ...newDrawingPoint,
        textAttribute,
      };
    }

    if (this.hasMarkerConfig) {
      const nextMarkInfo = CommonToolUtils.getNextMarker(
        this.currentPageResult,
        this.config.markerList,
        this.markerIndex,
      );

      if (nextMarkInfo) {
        newDrawingPoint = {
          ...newDrawingPoint,
          label: nextMarkInfo.label,
        };
        this.markerIndex = nextMarkInfo.index;
        this.emit('markIndexChange');
      } else {
        // 不存在则不允许创建新的
        this.emit('messageInfo', locale.getMessagesByLocale(EMessage.MarkerFinish, this.lang));
        return;
      }
    }

    this.hoverID = newDrawingPoint.id;
    const newPointList = [...this.pointList, newDrawingPoint];
    this.setPointList(newPointList);
    this.emit('pointCreated', newDrawingPoint, this.zoom);
    this.history.pushHistory(newPointList);
    this.setSelectedID(newDrawingPoint.id);
  }

  // 判断是是否在标点范围内
  public isInPoint(pos: ICoordinate, point: ICoordinate, zoom: number = this.zoom) {
    // 加上边框 2px
    return (this.style.width + 2) / zoom >= Math.sqrt((pos.x - point.x) ** 2 + (pos.y - point.y) ** 2);
  }

  public getHoverId() {
    // 获取鼠标的坐标点
    const pos = AxisUtils.getOriginCoordinateWithOffsetCoordinate(this.coord, this.zoom, this.currentPos);
    const selectPoint = this.pointList?.find((print) => this.isInPoint(pos, print));
    return selectPoint?.id;
  }

  public get selectedPoint() {
    return this.pointList.find((v) => v.id === this.selectedID);
  }

  public rightMouseUp(e: MouseEvent) {
    this.recoverOperationMode();

    // 删除操作
    if (this.selectedID === this.hoverID) {
      if (this.forbidDelete) return;
      const pointList = this.pointList.filter((point) => point.id !== this.selectedID);
      this.setPointList(pointList);
      this.history.pushHistory(pointList);
      this.emit('pointDeleted', this.selectedID);
      this.setSelectedID('');
      this.hoverID = '';
      return;
    }

    // 选中操作
    const hoverPoint = this.pointList.find((point) => point.id === this.hoverID);
    this.setSelectedID(this.hoverID, e.ctrlKey);
    this.emit('pointSelected', this.hoverID);
    if (hoverPoint) {
      this.setDefaultAttribute(hoverPoint?.attribute);
    }

    if (hoverPoint?.label && this.hasMarkerConfig) {
      const markerIndex = CommonToolUtils.getCurrentMarkerIndex(hoverPoint.label, this.config.markerList);
      if (markerIndex >= 0) {
        this.setMarkerIndex(markerIndex);
        this.emit('markIndexChange');
      }
    }
  }

  public onTabKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    // 拖拽中 禁止操作
    if (this.dragStatus === EDragStatus.Move || this.dragStatus === EDragStatus.Start) {
      return;
    }
    let sort = ESortDirection.ascend;
    if (e.shiftKey) {
      sort = ESortDirection.descend;
    }
    const [showingResult, selectedResult] = CommonToolUtils.getRenderResultList<IPolygonData>(
      this.pointList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );

    let pointList = [...showingResult];
    if (selectedResult) {
      pointList = [...pointList, ...selectedResult];
    }
    const nextSelectedRect = CommonToolUtils.getNextSelectedRectID(pointList as any, sort, this.selectedID);
    if (nextSelectedRect) {
      this.setSelectedID(nextSelectedRect.id);
      // 设置当前属性为默认属性
      // if (nextSelectedRect.attribute) {
      //   this.setDefaultAttribute(nextSelectedRect.attribute);
      // }
    }
  }

  /**
   * 当前依赖状态下本页的所有的点
   *
   * @readonly
   * @memberof RectOperation
   */
  public get currentPageResult() {
    const [showingPolygon] = CommonToolUtils.getRenderResultList<IPointUnit>(
      this.pointList,
      CommonToolUtils.getSourceID(this.basicResult),
      [],
    );
    return showingPolygon;
  }

  /**
   * 当前依赖状态下本页的所有框
   *
   * @readonly
   * @memberof RectOperation
   */
  public getCurrentPageResult(pointList: IPointUnit[]) {
    const [showingRect] = CommonToolUtils.getRenderResultList<IPointUnit>(
      pointList,
      CommonToolUtils.getSourceID(this.basicResult),
      [],
    );
    return showingRect;
  }

  /**
   * 导出结果
   */
  public exportData(): any[] {
    const { pointList } = this;

    return [pointList, this.basicImgInfo];
  }

  public deletePoint() {
    if (this.selectedIDs.length > 0) {
      this.setPointList(this.pointList.filter((point) => this.selection.isIdSelected(point.id)));
      this.history.pushHistory(this.pointList);
      this._textAttributeInstance?.clearTextAttribute();
      this.emit('selectedChange');
      this.emit('pointDeleted', this.selectedID);
      this.render();
    }
  }

  /** 撤销 和  重做 */
  public undoAndRedo(name: 'undo' | 'redo') {
    // 拖拽中 禁止撤销
    if (this.dragStatus === EDragStatus.Move || this.dragStatus === EDragStatus.Start) {
      return;
    }
    const rectList = this.history[name]?.() as IPointUnit[];

    // 当没有选中的id时 清空选中的id
    if (!rectList?.some((point) => point.id === this.selectedID)) {
      this.setSelectedID('');
    }
    if (rectList) {
      this.setPointList(rectList, true);
      this.render();
    }
  }

  /** 撤销 */
  public undo() {
    this.undoAndRedo('undo');
  }

  /** 重做 */
  public redo() {
    this.undoAndRedo('redo');
  }

  public getCurrentSelectedData() {
    if (!this.selectedID) return;
    // 后面这里可以用传参的形式 不用在重新过滤了
    const point = this.pointList?.find((item) => item.id === this.selectedID);
    const toolColor = this.getColor(point?.attribute);
    const color = point?.valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    this.dragStatus = EDragStatus.Wait;
    return {
      width: TEXTAREA_WIDTH * this.zoom * 0.6,
      textAttribute: point?.textAttribute || '',
      color,
    };
  }

  /** 更新文本输入，并且进行关闭 */
  public updateSelectedTextAttribute(newTextAttribute?: string) {
    if (this._textAttributeInstance && newTextAttribute && this.selectedID) {
      let textAttribute = newTextAttribute;
      if (AttributeUtils.textAttributeValidate(this.config.textCheckType, '', textAttribute) === false) {
        this.emit('messageError', AttributeUtils.getErrorNotice(this.config.textCheckType, this.lang));
        textAttribute = '';
      }

      this.setPointList(AttributeUtils.textChange(textAttribute, this.selectedID, this.pointList));

      this.emit('updateTextAttribute');
      this.render();
    }
  }

  public renderTextAttribute() {
    const point = this.pointList?.find((item) => item.id === this.selectedID);
    if (!this.ctx || this.config.textConfigurable !== true || !point) {
      return;
    }
    const { x, y, attribute, valid } = point;

    const newWidth = TEXTAREA_WIDTH * this.zoom * 0.6;
    const coordinate = AxisUtils.getOffsetCoordinate({ x, y }, this.currentPos, this.zoom);
    const toolColor = this.getColor(attribute);
    const color = valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    const distance = 4;
    if (!this._textAttributeInstance) {
      // 属性文本示例

      this._textAttributeInstance = new TextAttributeClass({
        width: newWidth,
        container: this.container,
        icon: this.getTextIconSvg(attribute),
        color,
        getCurrentSelectedData: this.getCurrentSelectedData,
        updateSelectedTextAttribute: this.updateSelectedTextAttribute,
      });
    }

    if (this._textAttributeInstance && !this._textAttributeInstance?.isExit) {
      this._textAttributeInstance.appendToContainer();
    }

    this._textAttributeInstance.update(`${point.textAttribute}`, {
      left: coordinate.x,
      top: coordinate.y + distance,
      color,
      width: newWidth,
    });
  }

  /**
   * 绘制标点
   */
  public renderPoint(point: IPointUnit, isSelected = false) {
    const { textAttribute = '', attribute } = point;
    const selected = isSelected || point.id === this.selectedID;
    const toolColor = this.getColor(attribute);

    const transformPoint = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);
    const { width = 2, hiddenText = false } = this.style;

    const toolData = StyleUtils.getStrokeAndFill(toolColor, point.valid, {
      isSelected: selected || point.id === this.hoverID,
    });

    // 绘制点
    DrawUtils.drawCircle(this.canvas, transformPoint, width, {
      startAngleDeg: 0,
      endAngleDeg: 360,
      thickness: 1,
      color: toolData.stroke,
      fill: toolData.fill,
    });

    let showText = '';

    const isShowOrder = this.config?.isShowOrder || this.config?.showOrder; // 兼容 SenseBee 旧配置

    if (isShowOrder && point.order && point?.order > 0) {
      showText = `${point.order}`;
    }

    if (point.label && this.hasMarkerConfig) {
      const order = CommonToolUtils.getCurrentMarkerIndex(point.label, this.config.markerList) + 1;

      showText = `${order}_${MarkerUtils.getMarkerShowText(point.label, this.config.markerList)}`;
    }

    if (point.attribute && !this.config.hideAttribute) {
      showText = `${showText}  ${AttributeUtils.getAttributeShowText(point.attribute, this.config?.attributeList)}`;
    }

    // 上方属性（列表、序号）
    if (!hiddenText) {
      DrawUtils.drawText(this.canvas, { x: transformPoint.x + width / 2, y: transformPoint.y - width - 4 }, showText, {
        textAlign: 'center',
        color: toolData.stroke,
      });
    }

    // 文本
    if (selected) {
      this.renderTextAttribute();
    } else if (!hiddenText) {
      DrawUtils.drawText(
        this.canvas,
        { x: transformPoint.x + width, y: transformPoint.y + width + 24 },
        textAttribute,
        {
          color: toolData.stroke,
          ...DEFAULT_TEXT_OFFSET,
        },
      );
    }
  }

  public renderMultiSelectedPoint() {
    this.selectedPoints.forEach((point) => {
      this.renderPoint(point, true);
    });
  }

  public renderPointList() {
    const [showingPointList, selectedPoints] = CommonToolUtils.getRenderResultList<IPointUnit>(
      this.pointList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );

    if (!this.isHidden) {
      showingPointList.forEach((point) => {
        this.renderPoint(point);
      });
    }

    if (selectedPoints) {
      selectedPoints.forEach((point) => {
        this.renderPoint(point, true);
      });
    }
  }

  /**
   * render auxiliaryLine - markerConfigurable should be true
   * 渲染辅助线-需开启列表标注
   */
  public renderAuxiliaryLine() {
    if (!this.config.markerConfigurable || !this.config.markerList?.length) {
      return;
    }

    const [showingPointList, selectedPoint] = CommonToolUtils.getRenderResultList<IPointUnit>(
      this.pointList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );

    const pointList = showingPointList;

    if (selectedPoint) {
      pointList.push(...selectedPoint);
    }

    if (pointList.length < 2) {
      return;
    }

    const auxiliaryLines = MarkerUtils.getAuxiliaryLineByMarkerList(this.config.markerList, 'value');
    const auxiliaryLinesCoord = MarkerUtils.getAuxiliaryLineCoord(auxiliaryLines, pointList);

    auxiliaryLinesCoord.forEach((item) => {
      const { start: startCoord, end: endCoord } = item;
      const pointListCoord = AxisUtils.changePointListByZoom([startCoord, endCoord], this.zoom, this.currentPos);
      DrawUtils.drawLine(this.canvas, pointListCoord[0], pointListCoord[1], {
        color: '#C5C5C5',
      });
    });
  }

  /**
   * 顶层渲染图标
   */
  public renderTop() {
    const color = this.getLineColor(this.defaultAttribute);
    this.renderCursorLine(color);

    if (this.config.edgeAdsorption && this.referenceData) {
      let coordinate = AxisUtils.getOriginCoordinateWithOffsetCoordinate(this.coord, this.zoom, this.currentPos);
      const isClose = this.referenceData?.toolName === EToolName.Polygon;

      const { dropFoot } = PolygonUtils.getClosestPoint(
        coordinate,
        this.referenceData.result as IPolygonData[],
        this.referenceData.config?.lineType ?? ELineTypes.Line,
        edgeAdsorptionScope / this.zoom,
        {
          isClose,
        },
      );
      if (dropFoot && coordinate !== dropFoot) {
        if (coordinate !== dropFoot) {
          coordinate = dropFoot;
          DrawUtils.drawCircle(this.canvas, AxisUtils.changePointByZoom(coordinate, this.zoom, this.currentPos), 5, {
            color: 'white',
            fill: 'white',
          });
          DrawUtils.drawCircle(this.canvas, AxisUtils.changePointByZoom(coordinate, this.zoom, this.currentPos), 3, {
            fill: color,
            color,
          });
        }
      }
    }
  }

  public render() {
    if (!this.ctx) return;

    super.render();
    this.renderAuxiliaryLine();
    this.renderPointList();
    this.renderTop();
  }
}
export default PointOperation;
