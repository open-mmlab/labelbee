import _ from 'lodash';
import { i18n } from '@labelbee/lb-utils';
import MathUtils from '@/utils/MathUtils';
import RectUtils from '@/utils/tool/RectUtils';
import {
  DEFAULT_TEXT_OFFSET,
  EDragStatus,
  EDragTarget,
  ERotateDirection,
  ESortDirection,
  TEXT_ATTRIBUTE_OFFSET,
} from '../../constant/annotation';
import EKeyCode from '../../constant/keyCode';
import {
  edgeAdsorptionScope,
  ELineTypes,
  EPolygonPattern,
  EToolName,
  ERectToolModeType,
  RECT_TOOL_MODE_NAME,
} from '../../constant/tool';
import locale from '../../locales';
import { EMessage } from '../../locales/constants';
import { IPolygonConfig, IPolygonData, IPolygonPoint } from '../../types/tool/polygon';
import ActionsHistory from '../../utils/ActionsHistory';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import AxisUtils from '../../utils/tool/AxisUtils';
import CanvasUtils from '../../utils/tool/CanvasUtils';
import CommonToolUtils from '../../utils/tool/CommonToolUtils';
import DrawUtils from '../../utils/tool/DrawUtils';
import PolygonUtils from '../../utils/tool/PolygonUtils';
import StyleUtils from '../../utils/tool/StyleUtils';
import uuid from '../../utils/uuid';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import TextAttributeClass from './textAttributeClass';
import Selection, { SetDataList } from './Selection';

const TEXT_MAX_WIDTH = 164;

export interface IPolygonOperationProps extends IBasicToolOperationProps {}

class PolygonOperation extends BasicToolOperation {
  public config: IPolygonConfig;

  // RENDER
  public drawingPointList: IPolygonPoint[]; // 正在绘制的多边形，在 zoom 底下

  public polygonList: IPolygonData[];

  public hoverID?: string;

  public hoverPointIndex: number;

  public hoverEdgeIndex: number;

  public editPolygonID?: string; // 是否进入编辑模式

  public pattern: EPolygonPattern; // 当前多边形标注形式

  public isCombined: boolean; // 是否开启合并操作

  public dragInfo?: {
    dragStartCoord: ICoordinate;
    initPointList: IPolygonPoint[];
    changePointIndex?: number[]; // 用于存储拖拽点 / 边的下标
    dragTarget: EDragTarget;

    originPolygon?: IPolygonData; // For comparing data before and after drag and drop.
    selectedPolygons?: IPolygonData[]; // For comparing data before and after drag and drop.
    dragPrevCoord: ICoordinate;
    originPolygonList: IPolygonData[];
  };

  private drawingHistory: ActionsHistory; // 用于正在编辑中的历史记录

  public isCtrl: boolean; // 当前的是否按住了 ctrl

  public isAlt: boolean; // 当前是否按住了 alt

  public _textAttributeInstance?: TextAttributeClass;

  public forbidAddNewPolygonFuc?: (e: MouseEvent) => boolean;

  public selection: Selection;

  private rectToolMode?: ERectToolModeType;

  constructor(props: IPolygonOperationProps) {
    super(props);
    this.config = CommonToolUtils.jsonParser(props.config);
    this.drawingPointList = [];
    this.polygonList = [];
    this.hoverPointIndex = -1;
    this.hoverEdgeIndex = -1;

    this.drawingHistory = new ActionsHistory();
    this.isCtrl = false;
    this.isAlt = false;
    this.isCombined = false;
    this.pattern = EPolygonPattern.Normal;

    this.getCurrentSelectedData = this.getCurrentSelectedData.bind(this);
    this.updateSelectedTextAttribute = this.updateSelectedTextAttribute.bind(this);
    this.selection = new Selection(this);
  }

  get selectedIDs() {
    return this.selection.selectedIDs;
  }

  get selectedID() {
    return this.selection.selectedID;
  }

  get minArea() {
    return this.config.minArea || 0;
  }

  public eventBinding() {
    super.eventBinding();
    // 解绑原本的 onMouseUp，将 onMoueUp 用于 dblClickListener 进行绑定
    this.container.removeEventListener('mouseup', this.onMouseUp);

    this.container.addEventListener('mouseup', this.dragMouseUp);
    this.dblClickListener.addEvent(this.onMouseUp, this.onLeftDblClick, this.onRightDblClick, this.isAllowDouble);
  }

  public eventUnbinding() {
    super.eventUnbinding();
    this.container.removeEventListener('mouseup', this.dragMouseUp);
  }

  public destroy() {
    super.destroy();
    if (this._textAttributeInstance) {
      this._textAttributeInstance.clearTextAttribute();
    }
  }

  public get selectedPolygon() {
    return PolygonUtils.getPolygonByID(this.visiblePolygonList, this.selectedID);
  }

  public get selectedPolygons() {
    return PolygonUtils.getPolygonByIDs(this.polygonList, this.selectedIDs);
  }

  public get hoverPolygon() {
    return this.visiblePolygonList.find((v) => v.id === this.hoverID && v.id !== this.selectedID);
  }

  public get enableDrag() {
    return Boolean(this.selectedID && this.dragInfo);
  }

  public get visiblePolygonList() {
    return this.polygonList;
  }

  public get polygonListUnderZoom() {
    return this.visiblePolygonList.map((polygon) => ({
      ...polygon,
      pointList: AxisUtils.changePointListByZoom(polygon.pointList, this.zoom),
    }));
  }

  public get selectedText() {
    return this.selectedPolygon?.textAttribute;
  }

  public get isThreePointsMode() {
    return this.pattern === EPolygonPattern.Rect && this.drawingPointList.length === 2;
  }

  public get isTwoPointsMode() {
    return (
      this.pattern === EPolygonPattern.Rect &&
      this.rectToolMode === ERectToolModeType.TwoPoints &&
      this.drawingPointList.length === 1
    );
  }

  // 是否直接执行操作
  public isAllowDouble = (e: MouseEvent) => {
    const { selectedID } = this;

    const currentSelectedID = this.getHoverID(e);
    // 仅在选中的时候需要 double click
    if (selectedID && selectedID === currentSelectedID) {
      return true;
    }

    return false;
  };

  public get dataList() {
    return this.polygonList;
  }

  public setPattern(pattern: EPolygonPattern, isForce = false) {
    if (this.drawingPointList?.length > 0 && isForce === true) {
      // 编辑中不允许直接跳出
      return;
    }

    this.pattern = pattern;
  }

  /**
   * 当前页面展示的框体
   */
  public get currentShowList() {
    let polygon: IPolygonData[] = [];
    const [showingPolygon, selectedPolygons] = CommonToolUtils.getRenderResultList<IPolygonData>(
      this.polygonList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );
    polygon = showingPolygon;

    if (this.isHidden) {
      polygon = [];
    }

    if (selectedPolygons) {
      polygon.push(...selectedPolygons);
    }
    return polygon;
  }

  /**
   * 当前依赖状态下本页的所有框
   *
   * @readonly
   * @memberof RectOperation
   */
  public get currentPageResult() {
    const [showingPolygon] = CommonToolUtils.getRenderResultList<IPolygonData>(
      this.polygonList,
      CommonToolUtils.getSourceID(this.basicResult),
      [],
    );
    return showingPolygon;
  }

  /**
   *  Just Update Data. Not Clear Status
   * @param polygonList
   */
  public setResultAndSelectedID(polygonList: IPolygonData[], selectedID: string) {
    this.setPolygonList(polygonList);
    if (selectedID) {
      this.setSelectedID(selectedID);
    }
    this.render();
  }

  public setResult(polygonList: IPolygonData[]) {
    this.clearActiveStatus();
    this.setPolygonList(polygonList);
    this.render();
  }

  /**
   * 外层 sidabr 调用
   * @param v
   * @returns
   */
  public textChange = (v: string) => {
    if (this.config.textConfigurable === false || !this.selectedID) {
      return;
    }
    this.setPolygonList(AttributeUtils.textChange(v, this.selectedID, this.polygonList));
    this.emit('selectedChange'); // 触发外层的更新
    this.render();
  };

  /**
   * 设定指定多边形的信息
   * @param id
   * @param newPolygonData
   * @returns
   */
  public setPolygonDataByID(newPolygonData: Partial<IPolygonData>, id?: string) {
    return this.polygonList.map((polygon) => {
      if (polygon.id === id) {
        return {
          ...polygon,
          ...newPolygonData,
        };
      }
      return polygon;
    });
  }

  public rotatePolygon(angle: number = 1, direction = ERotateDirection.Clockwise, selectedID = this.selectedID) {
    if (!selectedID) {
      return;
    }

    const selectedPolygon = PolygonUtils.getPolygonByID(this.polygonList, selectedID);

    if (!selectedPolygon) {
      return;
    }

    const rotatePointList = PolygonUtils.updatePolygonByRotate(direction, angle, selectedPolygon?.pointList);

    this.setPolygonList(this.setPolygonDataByID({ pointList: rotatePointList }, selectedID));
    this.render();
  }

  public rotatePolygonEdge(pointList: IPolygonPoint[], selectedID = this.selectedID) {
    if (!selectedID) {
      return;
    }

    const selectedPolygon = PolygonUtils.getPolygonByID(this.polygonList, selectedID);

    if (!selectedPolygon) {
      return;
    }

    this.setPolygonList(this.setPolygonDataByID({ pointList }, selectedID));
    this.render();
  }

  public addPointInDrawing(e: MouseEvent) {
    if (!this.imgInfo) {
      return;
    }

    if (this.forbidAddNewPolygonFuc && this.forbidAddNewPolygonFuc(e)) {
      return;
    }

    const { upperLimitPointNum, edgeAdsorption } = this.config;
    if (upperLimitPointNum && this.drawingPointList.length >= upperLimitPointNum) {
      // 小于对应的下限点, 大于上限点无法添加
      this.emit(
        'messageInfo',
        `${locale.getMessagesByLocale(EMessage.UpperLimitErrorNotice, this.lang)}${upperLimitPointNum}`,
      );

      return;
    }

    this.rectToolMode = localStorage.getItem(RECT_TOOL_MODE_NAME) as ERectToolModeType;
    this.deleteSelectedID();
    const coordinateZoom = this.getCoordinateUnderZoom(e);
    const coordinate = AxisUtils.changeDrawOutsideTarget(
      coordinateZoom,
      { x: 0, y: 0 },
      this.imgInfo,
      this.config.drawOutsideTarget,
      this.basicResult,
      this.zoom,
    );

    // 判断是否的初始点，是则进行闭合
    const calculateHoverPointIndex = AxisUtils.returnClosePointIndex(
      coordinate,
      AxisUtils.changePointListByZoom(this.drawingPointList, this.zoom),
    );
    if (calculateHoverPointIndex === 0) {
      this.addDrawingPointToPolygonList();
      return;
    }

    const { dropFoot } = PolygonUtils.getClosestPoint(
      coordinate,
      this.polygonListUnderZoom,
      this.config.lineType,
      edgeAdsorptionScope,
    );

    const coordinateWithOrigin = AxisUtils.changePointByZoom(
      dropFoot && e.altKey === false && edgeAdsorption ? dropFoot : coordinate,
      1 / this.zoom,
    );

    if (this.isThreePointsMode || this.isTwoPointsMode) {
      if (this.isThreePointsMode) {
        const rect = MathUtils.getRectangleByRightAngle(coordinateWithOrigin, this.drawingPointList);
        this.drawingPointList = rect;
      } else if (this.isTwoPointsMode) {
        this.drawingPointList = this.createRectByTwoPointsMode(this.drawingPointList, coordinateWithOrigin);
      }

      // 边缘判断 - 仅限支持图片下范围下
      if (this.config.drawOutsideTarget === false && this.imgInfo) {
        const isOutSide = this.isPolygonOutSide(this.drawingPointList);
        if (isOutSide) {
          // 边缘外直接跳出
          this.emit(
            'messageInfo',
            `${locale.getMessagesByLocale(EMessage.ForbiddenCreationOutsideBoundary, this.lang)}`,
          );
          this.drawingPointList = [];

          return;
        }
      }

      // 创建多边形
      this.addDrawingPointToPolygonList(true);
      return;
    }

    this.drawingPointList.push(coordinateWithOrigin);
    if (this.drawingPointList.length === 1) {
      this.drawingHistory.initRecord(this.drawingPointList);
    } else {
      this.drawingHistory.pushHistory(this.drawingPointList);
    }
  }

  // 全局操作
  public clearResult() {
    this.setPolygonList([]);
    this.deleteSelectedID();
    this.render();
  }

  /**
   *  清除多边形拖拽的中间状态
   */
  public clearPolygonDrag() {
    this.drawingPointList = [];
    this.stopDrag();
    this.hoverEdgeIndex = -1;
    this.hoverPointIndex = -1;
    this.hoverID = '';
  }

  /**
   *  清楚所有的中间状态
   */
  public clearActiveStatus() {
    this.clearPolygonDrag();
    this.deleteSelectedID();
  }

  public clearDrawingStatus() {
    this.drawingPointList = [];
  }

  // SET DATA
  public setPolygonList(polygonList: IPolygonData[]) {
    const oldLen = this.polygonList.length;
    this.polygonList = polygonList;

    if (oldLen !== polygonList.length) {
      // 件数发生改变
      this.emit('updatePageNumber');
    }
  }

  public setSelectedID(newID?: string, isAppend = false) {
    this.selection.setSelectedIDs(newID, isAppend);

    this.render();
    this.emit('selectedChange');
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
      if (this.selectedPolygons.length > 0) {
        this.selectedPolygons.forEach((polygon) => {
          polygon.attribute = defaultAttribute;
        });
        this.history.pushHistory(this.polygonList);
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

  public setStyle(toolStyle: any) {
    super.setStyle(toolStyle);

    // 当存在文本 icon 的时候需要更改当前样式
    if (this._textAttributeInstance && this.config.attributeConfigurable === false) {
      this._textAttributeInstance?.updateIcon(this.getTextIconSvg());
    }
  }

  /**
   * Sets the validity of a polygon with the given ID and renders the updated polygon list.
   * @param {string} id - The ID of the polygon to update.
   * @param {boolean} [valid] - The new validity status of the polygon. If not provided, the validity will be toggled.
   * @returns {void}
   */
  public setPolygonValidAndRender(id: string, valid?: boolean) {
    if (!id) {
      return;
    }

    const newPolygonList = this.polygonList.map((polygon) => {
      if (polygon.id === id) {
        const currentValid = polygon?.valid ?? true; // Valid Default is True.
        return {
          ...polygon,
          valid: valid ?? !currentValid,
        };
      }

      return polygon;
    });

    this.setPolygonList(newPolygonList);
    this.history.pushHistory(this.polygonList);
    this.render();

    // 同步外层
    this.emit('updateResult');
  }

  /**
   * 初始化的添加的数据
   * @returns
   */
  public addDrawingPointToPolygonList(isRect?: boolean) {
    let { lowerLimitPointNum = 3 } = this.config;

    if (lowerLimitPointNum < 3) {
      lowerLimitPointNum = 3;
    }

    let createPolygon: IPolygonData | undefined;

    if (this.drawingPointList.length < lowerLimitPointNum) {
      // 小于下线点无法闭合, 直接清除数据
      this.drawingPointList = [];
      this.editPolygonID = '';

      return;
    }
    if (PolygonUtils.calcPolygonSize(this.drawingPointList || []) < this.minArea) {
      // 小于最小面积无法添加
      this.emit(
        'messageInfo',
        `${locale.getMessagesByLocale(EMessage.MinAreaLimitErrorNotice, this.lang)}${this.minArea}`,
      );
      return;
    }
    const basicSourceID = CommonToolUtils.getSourceID(this.basicResult);

    const polygonList = [...this.polygonList];
    if (this.editPolygonID) {
      const samePolygon = polygonList.find((polygon) => polygon.id === this.editPolygonID);
      if (!samePolygon) {
        return;
      }
      samePolygon.pointList = this.drawingPointList;
      this.editPolygonID = '';
    } else {
      const id = uuid(8, 62);
      let newPolygon: IPolygonData = {
        id,
        sourceID: basicSourceID,
        valid: !this.isCtrl,
        textAttribute: '',
        pointList: this.drawingPointList,
        attribute: this.defaultAttribute,
        order:
          CommonToolUtils.getMaxOrder(
            polygonList.filter((v) => CommonToolUtils.isSameSourceID(v.sourceID, basicSourceID)),
          ) + 1,
      };

      if (this.config.textConfigurable) {
        let textAttribute = '';
        textAttribute = AttributeUtils.getTextAttribute(
          this.polygonList.filter((polygon) => CommonToolUtils.isSameSourceID(polygon.sourceID, basicSourceID)),
          this.config.textCheckType,
        );
        newPolygon = {
          ...newPolygon,
          textAttribute,
        };
      }

      if (this.pattern === EPolygonPattern.Rect && isRect === true) {
        newPolygon = {
          ...newPolygon,
          isRect: true,
        };
      }

      polygonList.push(newPolygon);
      createPolygon = newPolygon;

      this.setSelectedIdAfterAddingDrawing(id);
    }

    this.setPolygonList(polygonList);
    this.isCtrl = false;
    this.drawingPointList = [];
    this.history.pushHistory(polygonList);

    if (createPolygon) {
      this.emit('polygonCreated', createPolygon, this.zoom, this.currentPos);
    }
  }

  public setSelectedIdAfterAddingDrawing(newID: string) {
    if (this.drawingPointList.length === 0) {
      return;
    }

    if (this.config.textConfigurable) {
      this.setSelectedID(newID);
    } else {
      this.deleteSelectedID();
    }
  }

  /**
   * 获取当前 hover 多边形的 ID
   * @param e
   * @returns
   */
  public getHoverID(e: MouseEvent) {
    const coordinate = this.getCoordinateUnderZoom(e);
    const polygonListWithZoom = this.currentShowList.map((polygon) => ({
      ...polygon,
      pointList: AxisUtils.changePointListByZoom(polygon.pointList, this.zoom),
    }));
    return PolygonUtils.getHoverPolygonID(coordinate, polygonListWithZoom, 10, this.config?.lineType);
  }

  public getHoverEdgeIndex(e: MouseEvent) {
    if (!this.selectedID) {
      return -1;
    }

    const selectPolygon = this.selectedPolygon;

    if (!selectPolygon) {
      return -1;
    }
    const currentCoord = this.getCoordinateUnderZoom(e);
    const editPointListUnderZoom = AxisUtils.changePointListByZoom(selectPolygon.pointList, this.zoom);
    return PolygonUtils.getHoverEdgeIndex(currentCoord, editPointListUnderZoom, this.config?.lineType);
  }

  public getHoverPointIndex(e: MouseEvent) {
    if (!this.selectedID) {
      return -1;
    }

    const selectPolygon = this.selectedPolygon;

    if (!selectPolygon) {
      return -1;
    }
    const currentCoord = this.getCoordinateUnderZoom(e);
    const editPointListUnderZoom = AxisUtils.changePointListByZoom(selectPolygon.pointList, this.zoom);
    return AxisUtils.returnClosePointIndex(currentCoord, editPointListUnderZoom);
  }

  public deletePolygons(id?: string[]) {
    if (!id || id.length === 0) {
      return;
    }

    const deletedPolygon = this.polygonList.filter((p) => this.selection.isIdSelected(p.id));
    this.emit('deletedObject', { deletedObject: deletedPolygon[0], id: deletedPolygon[0].id });
    this.setPolygonList(this.polygonList.filter((polygon) => !this.selection.isIdSelected(polygon.id)));

    this.history.pushHistory(this.polygonList);
    this._textAttributeInstance?.clearTextAttribute();
    this.emit('selectedChange');
    this.render();
  }

  public deletePolygonPoint(index: number) {
    if (!this.selectedID) {
      return;
    }

    const { selectedPolygon } = this;

    if (!selectedPolygon) {
      return;
    }

    let { lowerLimitPointNum } = this.config;

    if (lowerLimitPointNum < 3) {
      lowerLimitPointNum = 3;
    }

    if (selectedPolygon.pointList.length <= lowerLimitPointNum) {
      this.emit(
        'messageInfo',
        `${locale.getMessagesByLocale(EMessage.LowerLimitErrorNotice, this.lang)}${lowerLimitPointNum}`,
      );
      return;
    }

    selectedPolygon?.pointList.splice(index, 1);
    this.history.pushHistory(this.polygonList);
    this.render();
  }

  // OPERATION

  public spaceKeydown() {
    // 续标检测
    if (this.selectedID) {
      // 矩形模式无法续标
      if (this.selectedPolygon?.isRect === true) {
        this.emit('messageInfo', `${locale.getMessagesByLocale(EMessage.UnableToReannotation, this.lang)}`);
        return;
      }

      this.editPolygonID = this.selectedID;
      this.drawingPointList = this.selectedPolygon?.pointList ?? [];
      this.drawingHistory.empty();
      this.drawingHistory.initRecord(this.drawingPointList);

      this.hoverID = '';
      this.deleteSelectedID();
      this.render();
    }
  }

  public onTabKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    let sort = ESortDirection.ascend;
    if (e.shiftKey) {
      sort = ESortDirection.descend;
    }

    this.switchToNextPolygon(sort);
  }

  public switchToNextPolygon(sort: ESortDirection) {
    if (this.drawingPointList.length > 0) {
      // 如果正在编辑则不允许使用 Tab 切换
      return;
    }

    const [showingResult, selectedResult] = CommonToolUtils.getRenderResultList<IPolygonData>(
      this.polygonList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );

    let polygonList = [...showingResult];
    if (selectedResult) {
      polygonList = [...polygonList, ...selectedResult];
    }

    const viewPort = CanvasUtils.getViewPort(this.canvas, this.currentPos, this.zoom);

    const sortList = polygonList
      .map((v) => ({
        ...v,
        x: v.pointList[0]?.x ?? 0,
        y: v.pointList[0]?.y ?? 0,
      }))
      .filter((polygon) => CanvasUtils.inViewPort({ x: polygon.x, y: polygon.y }, viewPort));

    const nextSelectedResult = CommonToolUtils.getNextSelectedRectID(sortList, sort, this.selectedID);
    if (nextSelectedResult) {
      this.setSelectedID(nextSelectedResult.id);
      const { selectedPolygon } = this;
      if (selectedPolygon) {
        this.setDefaultAttribute(selectedPolygon.attribute);
      }
    }
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

    if (this.selection.triggerKeyboardEvent(e, this.setPolygonList.bind(this) as unknown as SetDataList)) {
      return;
    }

    const { keyCode } = e;
    switch (keyCode) {
      case EKeyCode.Space:
        this.spaceKeydown();
        break;

      case EKeyCode.Esc:
        this.drawingPointList = [];
        this.editPolygonID = '';

        break;

      case EKeyCode.F:
        if (this.selectedID) {
          this.setPolygonValidAndRender(this.selectedID);
        }

        break;

      case EKeyCode.Z:
        if (e.altKey) {
          this.onCombinedExecute();
          return;
        }

        this.setIsHidden(!this.isHidden);
        this.render();
        break;

      case EKeyCode.Delete:
        this.deletePolygons(this.selectedIDs);
        this.render();
        break;

      case EKeyCode.Ctrl:
        this.isCtrl = true;
        break;

      case EKeyCode.Alt:
        if (this.isAlt === false) {
          e.preventDefault();
          this.isAlt = true;
          this.render();
        }

        break;

      case EKeyCode.Tab: {
        this.onTabKeyDown(e);
        break;
      }

      case EKeyCode.X:
        if (e.altKey) {
          this.segment();
        }
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

  public onKeyUp(e: KeyboardEvent) {
    super.onKeyUp(e);

    switch (e.keyCode) {
      case EKeyCode.Ctrl:
        this.isCtrl = false;
        break;

      case EKeyCode.Alt: {
        const oldAlt = this.isAlt;
        this.isAlt = false;
        if (oldAlt === true) {
          this.render();
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  public rightMouseUp(e: MouseEvent) {
    // 标注中的数据结束
    if (this.drawingPointList.length > 0) {
      //
      this.addDrawingPointToPolygonList();
      return;
    }

    // 右键选中设置
    this.setSelectedID(this.hoverID, e.ctrlKey);
    const { selectedPolygon } = this;
    if (selectedPolygon) {
      this.setDefaultAttribute(selectedPolygon.attribute);
    }
  }

  public onLeftDblClick(e: MouseEvent) {
    if (this.hoverEdgeIndex > -1) {
      const currentCoord = this.getCoordinateUnderZoom(e);
      const { selectedPolygon } = this;
      if (!selectedPolygon) {
        return;
      }

      if (selectedPolygon.isRect === true) {
        this.emit('messageInfo', `${locale.getMessagesByLocale(EMessage.ForbidAddNewPoint, this.lang)}`);
        this.clearPolygonDrag();
        return;
      }

      const { dropFoot } = PolygonUtils.getClosestPoint(
        currentCoord,
        this.polygonListUnderZoom,
        this.config.lineType,
        edgeAdsorptionScope,
      );

      if (!dropFoot) {
        return;
      }

      const { upperLimitPointNum } = this.config;
      if (upperLimitPointNum && selectedPolygon.pointList.length >= upperLimitPointNum) {
        // 小于对应的下限点, 大于上限点无法添加
        this.emit(
          'messageInfo',
          `${locale.getMessagesByLocale(EMessage.UpperLimitErrorNotice, this.lang)}${upperLimitPointNum}`,
        );
        this.clearPolygonDrag();
        return;
      }

      selectedPolygon?.pointList.splice(
        this.hoverEdgeIndex + 1,
        0,
        AxisUtils.changePointByZoom(dropFoot, 1 / this.zoom),
      );
      this.setPolygonDataByID(selectedPolygon, this.selectedID);
      this.history.pushHistory(this.polygonList);
      this.hoverPointIndex = -1;
      this.hoverEdgeIndex = -1;
      this.render();
    }
    this.dragInfo = undefined;
  }

  public onRightDblClick(e: MouseEvent) {
    this.dragInfo = undefined;
    this.clearImgDrag();

    const hoverID = this.getHoverID(e);
    const hoverPointIndex = this.getHoverPointIndex(e);
    if (this.hoverPointIndex > -1 && this.hoverPointIndex === hoverPointIndex) {
      this.deletePolygonPoint(hoverPointIndex);
      this.dragInfo = undefined;
      this.hoverPointIndex = -1;
      this.render();
      return;
    }

    if (this.hoverID === this.selectedID) {
      this.deletePolygons([hoverID]);
    }

    this.render();
  }

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation || e.ctrlKey === true) {
      return;
    }

    this.dragMouseDown(e);
    return true;
  }

  public onMouseLeave(): void {
    /**
     * Clear all status on mouse leave and while in drag state.
     */
    if (this.dragInfo) {
      this.emitUpdatePolygonByDrag();
      this.clearPolygonDrag();
      this.history.pushHistory(this.polygonList);
    }
  }

  /**
   * Judgment of drag information during mousedown
   * @param e
   * @returns
   */
  public dragMouseDown(e: MouseEvent) {
    if (e.button !== 0) {
      return;
    }
    const hoverID = this.getHoverID(e);

    if (!this.selection.isIdSelected(hoverID)) {
      // 无选中则无法进行拖拽，提前退出
      return;
    }

    let changePointIndex = [0];
    let dragTarget = EDragTarget.Plane;
    const initPointList = this.selectedPolygons[0].pointList;
    const dragStartCoord = this.getCoordinateUnderZoom(e);

    /**
     * Single select supporting drag point or line
     */
    if (this.selectedPolygons.length === 1) {
      this.dragStatus = EDragStatus.Start;

      const closePointIndex = this.getHoverPointIndex(e);
      const closeEdgeIndex = this.getHoverEdgeIndex(e);

      if (closePointIndex > -1) {
        dragTarget = EDragTarget.Point;
        changePointIndex = [closePointIndex];
      } else if (closeEdgeIndex > -1 && this.hoverEdgeIndex > -1) {
        dragTarget = EDragTarget.Line;
        changePointIndex = [closeEdgeIndex, (closeEdgeIndex + 1) % initPointList.length];
      }
    }

    this.dragInfo = {
      dragStartCoord,
      dragTarget,
      initPointList,
      changePointIndex,
      originPolygon: this.selectedPolygon,
      selectedPolygons: this.selectedPolygons,
      dragPrevCoord: dragStartCoord,
      originPolygonList: this.polygonList,
    };
  }

  public segment() {
    // 如果没有选中多边形直接进行裁剪操作，直接跳出
    if (!this.selectedID) {
      return;
    }

    if (this.config?.lineType !== ELineTypes.Line) {
      return;
    }
    const selectedPointList = PolygonUtils.getPolygonPointList(this.selectedID, this.currentShowList);
    const backgroundPolygonList = this.currentShowList.filter((v) => v.id !== this.selectedID);

    if (backgroundPolygonList.length === 0 || selectedPointList.length === 0) {
      return;
    }

    // 需判断是否存在包裹
    const wrapIndex = PolygonUtils.getWrapPolygonIndex(selectedPointList, backgroundPolygonList);

    let newPolygonList = [...this.polygonList];

    if (wrapIndex === -1) {
      // 并不存在合并的问题
      const newPointListArray = PolygonUtils.segmentPolygonByPolygon(selectedPointList, backgroundPolygonList);

      if (!newPointListArray) {
        return;
      }
      const newPointList = newPointListArray.shift();

      if (!newPointList) {
        return;
      }

      let defaultAttribute = '';
      let valid = true;
      const sourceID = CommonToolUtils.getSourceID(this.basicResult);
      let textAttribute = '';

      newPolygonList = this.polygonList.map((v) => {
        if (v.id === this.selectedID) {
          defaultAttribute = v.attribute;
          valid = v?.valid ?? true;
          textAttribute = v?.textAttribute ?? '';
          return {
            ...v,
            pointList: newPointList,
          };
        }

        return v;
      });

      // 如果有多余的框则进行添加
      if (newPointListArray.length > 0) {
        newPointListArray.forEach((v, i) => {
          newPolygonList.push({
            sourceID,
            id: uuid(8, 62),
            pointList: v,
            valid,
            order: CommonToolUtils.getMaxOrder(this.currentShowList) + 1 + i,
            attribute: defaultAttribute,
            textAttribute,
          });
        });
      }
    } else {
      // 嵌套合并结果
      newPolygonList[wrapIndex].pointList = PolygonUtils.clipPolygonFromWrapPolygon(
        selectedPointList,
        newPolygonList[wrapIndex].pointList,
      );
      newPolygonList = newPolygonList.filter((v) => v.id !== this.selectedID);
    }
    this.setPolygonList(newPolygonList);
    this.history.pushHistory(newPolygonList);
    this.render();
  }

  public onCombinedExecute() {
    if (!this.selectedID) {
      this.emit('messageInfo', i18n.t('PolygonsToBeCombinedNeedToBeSelected'));
      return;
    }
    this.isCombined = !this.isCombined;
  }

  public combine(e: MouseEvent) {
    // 没有选中和 hover 都退出
    const hoverID = this.getHoverID(e);
    if (!hoverID || !this.selectedID || this.selectedID === hoverID) {
      return;
    }

    if (this.config?.lineType !== ELineTypes.Line) {
      this.emit('messageInfo', i18n.t('CurveModeDoesNotSupportCutting'));
      return;
    }

    const selectedPolygon = this.polygonList.find((v) => v.id === this.selectedID);
    const combinedPolygon = this.currentShowList.find((v) => v.id === hoverID);
    if (!combinedPolygon || !selectedPolygon) {
      return;
    }

    const composeData = PolygonUtils.combinePolygonWithPolygon(selectedPolygon, combinedPolygon);

    if (!composeData) {
      return;
    }

    const { newPolygon, unionList } = composeData;
    if (unionList.length === 1 && newPolygon) {
      const newPolygonList = this.polygonList
        .filter((v) => !unionList.includes(v.id))
        .map((v) => {
          if (v.id === this.selectedID) {
            return newPolygon;
          }

          return v;
        });
      this.setPolygonList(newPolygonList);
      this.history.pushHistory(newPolygonList);
      this.render();

      this.emit('messageInfo', i18n.t('CombineSuccess'));
    } else {
      this.emit('messageInfo', i18n.t('CombiningFailedNotify'));
    }
    this.isCombined = false;
  }

  /**
   * 判断是否在边界外
   * @param selectedPointList
   * @returns
   */
  public isPolygonOutSide(selectedPointList: IPolygonPoint[]) {
    // 边缘判断 - 仅限支持图片下范围下
    if (this.dependToolName && this.basicCanvas && this.basicResult) {
      let isOutSide = false;
      switch (this.dependToolName) {
        case EToolName.Rect: {
          // 依赖拉框
          isOutSide = selectedPointList.filter((v) => !RectUtils.isInRect(v, this.basicResult)).length > 0;

          break;
        }
        case EToolName.Polygon: {
          isOutSide = PolygonUtils.isPointListOutSidePolygon(
            selectedPointList,
            this.basicResult.pointList,
            this.config.lineType,
          );
          break;
        }
        default: {
          //
        }
      }

      return isOutSide;
    }

    if (!this.imgInfo) {
      return false;
    }

    const { left, top, right, bottom } = MathUtils.calcViewportBoundaries(
      AxisUtils.changePointListByZoom(selectedPointList, this.zoom),
    );

    const scope = 0.00001;
    if (left < 0 || top < 0 || right > this.imgInfo.width + scope || bottom > this.imgInfo.height + scope) {
      // 超出范围则不进行编辑
      return true;
    }

    return false;
  }

  /**
   * Update polygon position while enableDrag is true
   * @param e {MouseEvent}
   */
  public onDragMove(e: MouseEvent) {
    const newPolygonList = this.polygonList.map((v) => {
      if (this.selectedIDs.includes(v.id)) {
        const selectedPointList = this.dragPolygon(e, v);

        if (!selectedPointList) {
          return v;
        }

        const newData = {
          ...v,
          pointList: selectedPointList as IPolygonPoint[],
        };

        // 非矩形模式下拖动，矩形模式下生成的框将会转换为非矩形框
        if (v.isRect === true && this.pattern === EPolygonPattern.Normal) {
          Object.assign(newData, { isRect: false });
        }

        return newData;
      }

      return v;
    });

    this.dragInfo!.dragPrevCoord = this.getCoordinateUnderZoom(e);

    this.setPolygonList(newPolygonList);
  }

  /**
   * According to the mode of dragTarget, get the offset when dragging
   * @param e {MouseEvent}
   * @param selectedPolygon {IPolygonData}
   * @returns
   */
  public getDragOffset(e: MouseEvent, selectedPolygon: IPolygonData) {
    const coordinate = this.getCoordinateUnderZoom(e);

    const { dragTarget, dragPrevCoord, changePointIndex, initPointList, dragStartCoord } = this.dragInfo!;

    /**
     * 矩形拖动
     * 1. 模式匹配
     * 2. 当前选中多边形是否为矩形
     * 3. 是否带有拖动
     *  */
    if (
      this.pattern === EPolygonPattern.Rect &&
      selectedPolygon?.isRect === true &&
      changePointIndex &&
      [EDragTarget.Line].includes(dragTarget)
    ) {
      const firstPointIndex = MathUtils.getArrayIndex(changePointIndex[0] - 2, 4);
      const secondPointIndex = MathUtils.getArrayIndex(changePointIndex[0] - 1, 4);
      const basicLine: [ICoordinate, ICoordinate] = [initPointList[firstPointIndex], initPointList[secondPointIndex]];

      const perpendicularOffset = MathUtils.getRectPerpendicularOffset(dragStartCoord, coordinate, basicLine);
      return {
        x: perpendicularOffset.x / this.zoom,
        y: perpendicularOffset.y / this.zoom,
      };
    }

    if (this.dragInfo?.dragTarget === EDragTarget.Plane) {
      return {
        x: (coordinate.x - dragPrevCoord.x) / this.zoom,
        y: (coordinate.y - dragPrevCoord.y) / this.zoom,
      };
    }

    return {
      x: (coordinate.x - dragStartCoord.x) / this.zoom,
      y: (coordinate.y - dragStartCoord.y) / this.zoom,
    };
  }

  public dragPolygon(e: MouseEvent, selectedPolygon: IPolygonData) {
    let selectedPointList: IPolygonPoint[] | undefined = _.cloneDeep(selectedPolygon?.pointList);

    if (!selectedPointList || !this.dragInfo) {
      return;
    }

    const { initPointList, dragTarget, changePointIndex } = this.dragInfo!;

    const offset = this.getDragOffset(e, selectedPolygon);

    this.dragStatus = EDragStatus.Move;

    switch (dragTarget) {
      case EDragTarget.Plane:
        selectedPointList = selectedPointList.map((v) => ({
          ...v,
          x: v.x + offset.x,
          y: v.y + offset.y,
        }));

        break;

      case EDragTarget.Point:
      case EDragTarget.Line:
        selectedPointList = selectedPointList.map((n, i) => {
          if (changePointIndex && changePointIndex.includes(i)) {
            return {
              ...n,
              x: initPointList[i].x + offset.x,
              y: initPointList[i].y + offset.y,
            };
          }
          return n;
        });
        break;

      default: {
        break;
      }
    }

    if (
      this.pattern === EPolygonPattern.Rect &&
      selectedPolygon?.isRect === true &&
      dragTarget === EDragTarget.Point &&
      changePointIndex
    ) {
      const newPointList = MathUtils.getPointListFromPointOffset(
        initPointList as [ICoordinate, ICoordinate, ICoordinate, ICoordinate],
        changePointIndex[0],
        offset,
      );

      selectedPointList = newPointList;
    }

    // 边缘判断 - 仅限支持图片下范围下
    if (this.config.drawOutsideTarget === false && this.imgInfo) {
      const isOutSide = this.isPolygonOutSide(selectedPointList);
      if (isOutSide) {
        // 边缘外直接跳出
        return;
      }
    }

    return selectedPointList;
  }

  private lastMouseMoveTime = 0; // 记录上次鼠标移动的时间

  private mouseMoveThrottle = 16; // 节流时间（毫秒）

  private determineTrigger(e: MouseEvent): string {
    if (this.isDrag) {
      return 'drag';
    }

    if (this.dragInfo) {
      return 'dragSingle';
    }

    let trigger = '';
    const newHoverID = this.getHoverID(e);
    if (this.hoverID !== newHoverID) {
      this.hoverID = newHoverID;
      trigger = '';
    } else {
      trigger = 'move';
    }

    let hoverPointIndex = -1;
    let hoverEdgeIndex = -1;
    // 高亮逻辑判断完毕后需要判断当前选中的状态更新逻辑
    const { selectedID } = this;
    if (selectedID) {
      hoverPointIndex = this.getHoverPointIndex(e);
      // 注意： 点的优先级大于边
      if (hoverPointIndex > -1) {
        if (this.hoverPointIndex !== hoverPointIndex) {
          trigger = '';
        } else {
          // 在同一个点上进行移动的时候不需要更新和渲染
          trigger = 'noRender';
        }
      } else {
        hoverEdgeIndex = this.getHoverEdgeIndex(e);
        if (this.hoverEdgeIndex !== hoverEdgeIndex) {
          trigger = '';
        } else {
          // 在同一条边上进行移动的时候不需要更新和渲染
          trigger = 'noRender';
        }
      }
      this.hoverEdgeIndex = hoverEdgeIndex;
      this.hoverPointIndex = hoverPointIndex;
    }

    return trigger;
  }

  public onMouseMove(e: MouseEvent) {
    requestAnimationFrame(() => {
      const now = Date.now();

      // 节流：如果上次调用时间未超过设定的时间间隔，则跳过
      if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) {
        return;
      }
      this.lastMouseMoveTime = now;
      if (super.onMouseMove(e, false) || this.forbidMouseOperation || !this.imgInfo) {
        return;
      }

      if (this.drawingPointList.length > 0) {
        // 编辑中无需 hover操作
        this.render();
        return;
      }

      const trigger = this.determineTrigger(e);

      if (this.selectedIDs.length > 0 && this.dragInfo) {
        this.onDragMove(e);
      }

      this.render(trigger);
    });
  }

  /**
   * Emit updateList for views update
   * @Emit updateList {UpdatePolygonByDragList}
   */
  public emitUpdatePolygonByDrag = () => {
    if (this.dragInfo) {
      const { originPolygon } = this.dragInfo;
      this.emit('updatePolygonByDrag', [{ newPolygon: this.selectedPolygon, originPolygon }]);
    }
  };

  public leftMouseUpdateValid(e: MouseEvent) {
    const hoverID = this.getHoverID(e);
    if (this.drawingPointList.length === 0 && e.ctrlKey === true && hoverID) {
      // ctrl + 左键 + hover存在，更改框属性
      this.setPolygonValidAndRender(hoverID);
      return true;
    }
    return false;
  }

  public stopDrag() {
    this.dragInfo = undefined;
    this.dragStatus = EDragStatus.Wait;
  }

  public leftMouseUp(e: MouseEvent) {
    const isCtrl = this.leftMouseUpdateValid(e);

    if (isCtrl) {
      return;
    }
    // Create New Polygon
    this.addPointInDrawing(e);
  }

  public onMouseUp(e: MouseEvent) {
    if (this.isCombined) {
      switch (e.button) {
        case 0:
          this.combine(e);
          break;

        case 2:
          this.isCombined = false;
          break;
        default:
          return;
      }

      return;
    }
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    if (this.dragInfo && this.dragStatus === EDragStatus.Move) {
      // 同步 结果
      this.emit('updateResult');

      // Emit polygon.
      this.emitUpdatePolygonByDrag();

      this.stopDrag();
      this.history.pushHistory(this.polygonList);

      return;
    }

    if (this.dragInfo && this.dragStatus === EDragStatus.Start) {
      this.stopDrag();
      return;
    }

    switch (e.button) {
      case 0: {
        this.leftMouseUp(e);
        break;
      }

      case 2: {
        this.rightMouseUp(e);

        break;
      }

      default: {
        break;
      }
    }
    this.render();
  }

  public dragMouseUp() {
    if (this.dragStatus === EDragStatus.Start) {
      this.stopDrag();
    }
  }

  public exportData() {
    const { polygonList } = this;

    return [polygonList, this.basicImgInfo];
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

  public getCurrentSelectedData() {
    const { selectedPolygon } = this;
    if (!selectedPolygon) {
      return;
    }

    const toolColor = this.getColor(selectedPolygon.attribute);
    const color = selectedPolygon.valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    return {
      width: TEXT_MAX_WIDTH,
      textAttribute: selectedPolygon.textAttribute,
      color,
    };
  }

  /** 更新文本输入，并且进行关闭 */
  public updateSelectedTextAttribute(newTextAttribute?: string) {
    if (this._textAttributeInstance && newTextAttribute && this.selectedID) {
      // 切换的时候如果存在

      let textAttribute = newTextAttribute;
      if (AttributeUtils.textAttributeValidate(this.config.textCheckType, '', textAttribute) === false) {
        this.emit('messageError', AttributeUtils.getErrorNotice(this.config.textCheckType, this.lang));
        textAttribute = '';
      }

      this.setPolygonList(AttributeUtils.textChange(textAttribute, this.selectedID, this.polygonList));
      this.emit('updateTextAttribute');
      this.render();
    }
  }

  public renderTextAttribute() {
    const { selectedPolygon } = this;
    if (!this.ctx || this.config.textConfigurable === false || !selectedPolygon) {
      return;
    }

    const { pointList, attribute, valid, textAttribute } = selectedPolygon;

    const { x, y } = pointList[pointList.length - 1];

    const newWidth = TEXT_MAX_WIDTH;
    const coordinate = AxisUtils.getOffsetCoordinate({ x, y }, this.currentPos, this.zoom);
    const toolColor = this.getColor(attribute);
    const color = valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
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

    this._textAttributeInstance.update(`${textAttribute}`, {
      left: coordinate.x,
      top: coordinate.y,
      color,
      width: newWidth,
    });
  }

  public renderStaticPolygon() {
    if (this.isHidden === false) {
      this.visiblePolygonList?.forEach((polygon) => {
        if ([this.selectedID, this.editPolygonID].includes(polygon.id)) {
          return;
        }
        const { textAttribute, attribute } = polygon;
        const toolColor = this.getColor(attribute);
        const toolData = StyleUtils.getStrokeAndFill(toolColor, polygon.valid);
        const transformPointList = AxisUtils.changePointListByZoom(polygon.pointList || [], this.zoom, this.currentPos);

        DrawUtils.drawPolygonWithFillAndLine(this.canvas, transformPointList, {
          fillColor: toolData.fill,
          strokeColor: toolData.stroke,
          pointColor: 'white',
          thickness: this.style?.width ?? 2,
          lineCap: 'round',
          isClose: true,
          lineType: this.config?.lineType,
        });

        let showText = `${AttributeUtils.getAttributeShowText(attribute, this.config.attributeList) ?? ''}`;
        if (this.config?.isShowOrder && polygon?.order > 0) {
          showText = `${polygon.order} ${showText}`;
        }

        DrawUtils.drawText(this.canvas, transformPointList[0], showText, {
          color: toolData.stroke,
          ...DEFAULT_TEXT_OFFSET,
        });

        const endPoint = transformPointList[transformPointList.length - 1];

        DrawUtils.drawText(
          this.canvas,
          { x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y },
          textAttribute,
          {
            color: toolData.stroke,
            ...DEFAULT_TEXT_OFFSET,
          },
        );
      });
    }
  }

  public renderSelectedPolygons() {
    this.selectedPolygons.forEach((polygon) => {
      this.renderSelectedPolygon(polygon);
    });
  }

  public renderSelectedPolygon(polygon: IPolygonData) {
    // 3. 选中多边形的渲染
    if (polygon) {
      const toolColor = this.getColor(polygon.attribute);
      const toolData = StyleUtils.getStrokeAndFill(toolColor, polygon.valid, { isSelected: true });

      DrawUtils.drawSelectedPolygonWithFillAndLine(
        this.canvas,
        AxisUtils.changePointListByZoom(polygon.pointList, this.zoom, this.currentPos),
        {
          fillColor: toolData.fill,
          strokeColor: toolData.stroke,
          pointColor: 'white',
          thickness: 2,
          lineCap: 'round',
          isClose: true,
          lineType: this.config?.lineType,
        },
      );

      let showText = `${AttributeUtils.getAttributeShowText(polygon.attribute, this.config.attributeList) ?? ''}`;
      if (this.config?.isShowOrder && polygon?.order > 0) {
        showText = `${polygon.order} ${showText}`;
      }

      DrawUtils.drawText(
        this.canvas,
        AxisUtils.changePointByZoom(polygon.pointList[0], this.zoom, this.currentPos),
        showText,
        {
          color: toolData.stroke,
          ...DEFAULT_TEXT_OFFSET,
        },
      );

      this.renderTextAttribute();
    }
  }

  public renderHoverPolygon() {
    if (this.hoverID && this.hoverID !== this.editPolygonID) {
      const { hoverPolygon } = this;
      if (hoverPolygon) {
        let color = '';
        const toolColor = this.getColor(hoverPolygon.attribute);
        if (hoverPolygon.valid) {
          color = toolColor.validHover.fill;
        } else {
          color = StyleUtils.getStrokeAndFill(toolColor, false, { isHover: true }).fill;
        }

        DrawUtils.drawPolygonWithFill(
          this.canvas,
          AxisUtils.changePointListByZoom(hoverPolygon.pointList, this.zoom, this.currentPos),
          {
            color,
            lineType: this.config?.lineType,
          },
        );
      }
    }
  }

  public renderPolygon(trigger?: string) {
    // 1. 静态多边形
    if (trigger !== 'move') {
      this.renderStaticPolygon();
    }

    // 2. hover 多边形
    this.renderHoverPolygon();

    // 3. 选中多边形的渲染
    this.renderSelectedPolygons();

    const defaultColor = this.getColor(this.defaultAttribute);
    const toolData = StyleUtils.getStrokeAndFill(defaultColor, !this.isCtrl);

    // 4. 编辑中的多边形
    if (this.drawingPointList?.length > 0) {
      // 渲染绘制中的多边形
      let drawingPointList = [...this.drawingPointList];
      let coordinate = AxisUtils.getOriginCoordinateWithOffsetCoordinate(this.coord, this.zoom, this.currentPos);

      if (this.isThreePointsMode) {
        // 矩形模式特殊绘制
        drawingPointList = MathUtils.getRectangleByRightAngle(coordinate, drawingPointList);
      } else if (this.config?.edgeAdsorption && this.isAlt === false) {
        const { dropFoot } = PolygonUtils.getClosestPoint(
          coordinate,
          this.polygonList,
          this.config?.lineType,
          edgeAdsorptionScope / this.zoom,
        );
        if (dropFoot) {
          coordinate = dropFoot;
        }
        drawingPointList.push(coordinate);
      } else if (this.isTwoPointsMode) {
        drawingPointList = this.createRectByTwoPointsMode(drawingPointList, coordinate);
      } else {
        drawingPointList.push(coordinate);
      }
      const polygon = AxisUtils.changePointListByZoom(drawingPointList, this.zoom, this.currentPos);
      DrawUtils.drawSelectedPolygonWithFillAndLine(this.canvas, polygon, {
        fillColor: toolData.fill,
        strokeColor: toolData.stroke,
        pointColor: 'white',
        thickness: 2,
        lineCap: 'round',
        isClose: false,
        lineType: this.config.lineType,
      });
      if (this.isTwoPointsMode) {
        DrawUtils.drawLine(this.canvas, polygon[0], polygon[1], {
          color: 'white',
          thickness: 3,
          lineDash: [6],
        });
      }
    }

    // 5. 编辑中高亮的点
    if (this.hoverPointIndex > -1 && this.selectedID) {
      const selectdPolygon = this.selectedPolygon;
      if (!selectdPolygon) {
        return;
      }
      const hoverColor = StyleUtils.getStrokeAndFill(defaultColor, selectdPolygon.valid, { isSelected: true });

      const point = selectdPolygon?.pointList[this.hoverPointIndex];
      if (point) {
        const { x, y } = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);
        DrawUtils.drawCircleWithFill(this.canvas, { x, y }, 5, {
          color: hoverColor.fill,
        });
      }
    }

    // 6. 编辑中高亮的边
    if (this.hoverEdgeIndex > -1 && this.selectedID) {
      const selectdPolygon = this.selectedPolygon;
      if (!selectdPolygon) {
        return;
      }
      const selectedColor = StyleUtils.getStrokeAndFill(defaultColor, selectdPolygon.valid, { isSelected: true });

      DrawUtils.drawLineWithPointList(
        this.canvas,
        AxisUtils.changePointListByZoom(selectdPolygon.pointList, this.zoom, this.currentPos),
        {
          color: selectedColor.stroke,
          thickness: 10,
          hoverEdgeIndex: this.hoverEdgeIndex,
          lineType: this.config?.lineType,
        },
      );
    }
  }

  /**
   * used in isTwoPointsMode；
   * Effect：Determine the order of the four points, because the orientation is drawn along the line between the starting point and the first point；
   * Orientation Logic: to the first point, adjacent to the two sides take one for orientation, such as side 1, Side 2, if side 1 clockwise rotation 90 degrees can get side 2, then take side 1 for orientation；
   */
  private createRectByTwoPointsMode(drawingPointList: IPolygonPoint[], coordinate: IPolygonPoint) {
    const startPoint = drawingPointList[0];
    const result = [...drawingPointList];
    const fromLeftTopToRightBottom = coordinate.x > startPoint.x && coordinate.y > startPoint.y;
    const fromRightBottomToLeftTop = coordinate.x < startPoint.x && coordinate.y < startPoint.y;
    if (fromLeftTopToRightBottom || fromRightBottomToLeftTop) {
      result.push({ x: startPoint.x, y: coordinate.y }, coordinate, {
        x: coordinate.x,
        y: startPoint.y,
      });
    } else {
      result.push({ x: coordinate.x, y: startPoint.y }, coordinate, {
        x: startPoint.x,
        y: coordinate.y,
      });
    }
    return result;
  }

  public render(trigger?: string) {
    if (!this.ctx) {
      return;
    }
    if (trigger !== 'move') {
      super.render();
    }
    if (trigger !== 'drag' && trigger !== 'dragSingle') {
      this.renderPolygon(trigger);
    }
    if (trigger === 'dragSingle') {
      this.renderSelectedPolygons();
    }
    this.renderCursorLine(this.getLineColor(this.defaultAttribute));
  }

  public renderCursorLine(lineColor: string) {
    requestAnimationFrame(() => {
      this.clearOffscreenCanvas();
      const { x, y } = this.coord;

      DrawUtils.drawLine(this.offscreenCanvas, { x: 0, y }, { x: 10000, y }, { color: lineColor });
      DrawUtils.drawLine(this.offscreenCanvas, { x, y: 0 }, { x, y: 10000 }, { color: lineColor });
      DrawUtils.drawCircleWithFill(this.offscreenCanvas, { x, y }, 1, { color: 'white' });

      if (this.isCombined) {
        const padding = 10; // 框的边界
        const rectWidth = 186; // 框的宽度
        const rectHeight = 32; // 框的高度
        DrawUtils.drawRectWithFill(
          this.canvas,
          {
            x: x + padding,
            y: y - padding * 4 - 1,
            width: rectWidth,
            height: rectHeight,
          } as IRect,
          { color: 'black' },
        );

        DrawUtils.drawText(this.canvas, { x, y }, i18n.t('ClickAnotherPolygon'), {
          textAlign: 'center',
          color: 'white',
          offsetX: rectWidth / 2 + padding,
          offsetY: -(rectHeight / 2 + padding / 2),
        });

        DrawUtils.drawRect(
          this.canvas,
          {
            x: x - padding,
            y: y - padding,
            width: padding * 2,
            height: padding * 2,
          } as IRect,
          { lineDash: [6], color: 'white' },
        );
      }
    });
  }

  /** 撤销 */
  public undo() {
    if (this.drawingPointList.length > 0) {
      // 绘制中进行
      const drawingPointList = this.drawingHistory.undo();
      if (!drawingPointList) {
        return;
      }
      this.drawingPointList = drawingPointList;
      this.render();

      return;
    }

    const polygonList = this.history.undo();
    if (polygonList) {
      if (polygonList.length !== this.polygonList.length) {
        this.deleteSelectedID();
      }

      this.setPolygonList(polygonList);
      this.render();
    }
  }

  /** 重做 */
  public redo() {
    if (this.drawingPointList.length > 0) {
      // 绘制中进行
      const drawingPointList = this.drawingHistory.redo();
      if (!drawingPointList) {
        return;
      }
      this.drawingPointList = drawingPointList;
      this.render();

      return;
    }

    const polygonList = this.history.redo();
    if (polygonList) {
      if (polygonList.length !== this.polygonList.length) {
        this.deleteSelectedID();
      }

      this.setPolygonList(polygonList);
      this.render();
    }
  }

  public deleteSelectedID() {
    this.setSelectedID('');
  }
}

export default PolygonOperation;
