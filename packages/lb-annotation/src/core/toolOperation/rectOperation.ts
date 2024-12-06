import _ from 'lodash';
import { Coord, distance } from '@turf/turf';
import MathUtils from '@/utils/MathUtils';
import AxisUtils from '@/utils/tool/AxisUtils';
import RectUtils from '@/utils/tool/RectUtils';
import TagUtils from '@/utils/tool/TagUtils';
import { DEFAULT_TEXT_SHADOW, EDragStatus, ESortDirection } from '../../constant/annotation';
import { EDragTarget, EOperationMode } from '../../constant/tool';
import EKeyCode from '../../constant/keyCode';
import locale from '../../locales';
import { EMessage } from '../../locales/constants';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import CanvasUtils from '../../utils/tool/CanvasUtils';
import CommonToolUtils from '../../utils/tool/CommonToolUtils';
import DrawUtils from '../../utils/tool/DrawUtils';
import MarkerUtils from '../../utils/tool/MarkerUtils';
import { getPolygonPointUnderZoom } from '../../utils/tool/polygonTool';
import uuid from '../../utils/uuid';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import TextAttributeClass from './textAttributeClass';
import Selection, { SetDataList } from './Selection';

interface IRectOperationProps extends IBasicToolOperationProps {
  drawOutSideTarget?: boolean; // 是否可以在边界外进行标注
  style?: string;
}

const scope = 6;

class RectOperation extends BasicToolOperation {
  public drawingRect?: IRect;

  public firstClickCoord?: ICoordinate; // 第一次点击的位置

  public firstCurrentPos?: ICoordinate; // 第一次点击的 currentPos

  public rectList: IRect[];

  // 具体操作
  public hoverRectID?: string; // 当前是否hover rect

  public selectedRectTextAttribute: string; // 当前选中的文本

  public hoverRectPointIndex: number; //  当前 hoverIndex, 依次为左上角、右上角、右下角、左下角

  public hoverRectEdgeIndex: number; //  当前 hover 的边

  public isFlow: boolean; // 是否进行流动

  public config: IRectConfig;

  public markerIndex: number; // 用于列表标签定位

  public _textAttributeInstance?: TextAttributeClass;

  private _drawOutSideTarget: boolean; // 是否能在边界外进行标注

  private selection: Selection;

  private dragInfo?: {
    dragStartCoord: ICoordinate;
    dragTarget: EDragTarget;
    changePointIndex?: number[]; // 用于存储拖拽点 / 边的下标
    firstRect?: IRect; // 最初的框
    originRectList?: IRect[];
    startTime: number;
  };

  private highlightVisible = false;

  /** Whether or not add rect */
  private enableAddRect = true;

  public renderPointCloud2DHighlight(): void {}

  constructor(props: IRectOperationProps) {
    super(props);
    this._drawOutSideTarget = props.drawOutSideTarget || false;
    this.rectList = [];
    this.isFlow = true;
    this.config = CommonToolUtils.jsonParser(props.config);
    this.hoverRectEdgeIndex = -1;
    this.hoverRectPointIndex = -1;
    this.selectedRectTextAttribute = '';
    this.markerIndex = 0;
    this.createNewDrawingRect = this.createNewDrawingRect.bind(this);
    this.getDrawingRectWithRectList = this.getDrawingRectWithRectList.bind(this);
    this.setSelectedIdAfterAddingDrawingRect = this.setSelectedIdAfterAddingDrawingRect.bind(this);
    this.getCurrentSelectedData = this.getCurrentSelectedData.bind(this);
    this.updateSelectedRectTextAttribute = this.updateSelectedRectTextAttribute.bind(this);
    this.setSelectedID = this.setSelectedID.bind(this);
    this.updateSelectedRectSubAttribute = this.updateSelectedRectSubAttribute.bind(this);
    this.selection = new Selection(this);
  }

  public setResult(rectList: IRect[]) {
    this.clearActiveStatus();
    this.setRectList(rectList);

    if (this.hasMarkerConfig) {
      const nextMarkerInfo = CommonToolUtils.getNextMarker(this.getCurrentPageResult(rectList), this.config.markerList);
      if (nextMarkerInfo) {
        this.setMarkerIndex(nextMarkerInfo.index);
      }
    }

    this.render();
  }

  public destroy() {
    super.destroy();
    if (this._textAttributeInstance) {
      this._textAttributeInstance.clearTextAttribute();
    }
  }

  public setConfig(config: string, isClear = false) {
    this.config = CommonToolUtils.jsonParser(config);
    if (isClear === true) {
      this.clearResult(false);
    }
  }

  /**
   * 设置当前的结果集
   * @param rectList
   * @param isUpload
   */
  public setRectList(rectList: IRect[], isUpload = false) {
    const oldLen = this.rectList.length;
    this.rectList = rectList;

    if (oldLen !== rectList.length) {
      // 件数发生改变
      this.emit('updatePageNumber');
    }

    if (isUpload) {
      // 为了兼容外层实时同步数据 - （估计后面会干掉）
      this.emit('updateResult');
    }
  }

  get selectedRectID() {
    return this.selectedIDs.length === 1 ? this.selectedIDs[0] : undefined;
  }

  get selectedID() {
    return this.selectedRectID;
  }

  get drawOutSideTarget() {
    return this._drawOutSideTarget || this.config.drawOutsideTarget;
  }

  public get selectedRect() {
    return this.selectedRects.length === 1 ? this.selectedRects[0] : undefined;
  }

  public get selectedIDs() {
    return this.selection.selectedIDs;
  }

  public get selectedRects() {
    return this.rectList.filter((i) => this.selectedIDs.includes(i.id));
  }

  public get selectedText() {
    return this.selectedRect?.textAttribute;
  }

  get dataList() {
    return this.rectList;
  }

  /**
   * 当前页面展示的框体
   */
  public get currentShowList() {
    let rect: IRect[] = [];
    const [showingRect, selectedRect] = CommonToolUtils.getRenderResultList<IRect>(
      this.rectList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
    );
    rect = showingRect;

    if (this.isHidden) {
      rect = [];
    }

    if (selectedRect) {
      rect.push(...selectedRect);
    }
    return rect;
  }

  /**
   * 当前依赖状态下本页的所有框
   *
   * @readonly
   * @memberof RectOperation
   */
  public get currentPageResult() {
    const [showingRect] = CommonToolUtils.getRenderResultList<IRect>(
      this.rectList,
      CommonToolUtils.getSourceID(this.basicResult),
      [],
    );
    return showingRect;
  }

  /**
   * 当前依赖状态下本页的所有框
   *
   * @readonly
   * @memberof RectOperation
   */
  public getCurrentPageResult(rectList: IRect[]) {
    const [showingRect] = CommonToolUtils.getRenderResultList<IRect>(
      rectList,
      CommonToolUtils.getSourceID(this.basicResult),
      [],
    );
    return showingRect;
  }

  public setSelectedID(newID?: string) {
    this.setSelectedRectID(newID);
  }

  public setSelectedRectID(newID?: string, isAppend = false) {
    this.selection.setSelectedIDs(newID, isAppend);

    this.render();
    this.emit('selectedChange');
  }

  public setStyle(toolStyle: any) {
    super.setStyle(toolStyle);

    // 当存在文本 icon 的时候需要更改当前样式
    if (this._textAttributeInstance && this.config.attributeConfigurable === false) {
      this._textAttributeInstance?.updateIcon(this.getTextIconSvg());
    }
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

    const currentRect = this.currentPageResult.find((rect) => rect.label === markerValue);

    if (currentRect) {
      this.setSelectedRectID(currentRect.id);
      if (this.config.attributeConfigurable === true) {
        this.setDefaultAttribute(currentRect.attribute);
      }
    }
    this.emit('markIndexChange');
  };

  /** 更新文本输入，并且进行关闭 */
  public updateSelectedRectTextAttribute(newTextAttribute?: string) {
    if (this._textAttributeInstance && newTextAttribute && this.selectedRectID) {
      // 切换的时候如果存在

      let textAttribute = newTextAttribute;
      if (AttributeUtils.textAttributeValidate(this.config.textCheckType, '', textAttribute) === false) {
        this.emit('messageError', AttributeUtils.getErrorNotice(this.config.textCheckType, this.lang));
        textAttribute = '';
      }

      this.setRectList(
        this.rectList.map((v) => {
          if (v.id === this.selectedRectID) {
            return {
              ...v,
              textAttribute,
            };
          }
          return v;
        }),
        true,
      );

      this.emit('updateTextAttribute');
      this.render();
    }
  }

  public updateSelectedRectSubAttribute(key: string, value: string) {
    if (value && this.config.secondaryAttributeConfigurable === true && this.selectedRectID) {
      this.setRectList(
        this.rectList.map((v) => {
          if (v.id === this.selectedRectID) {
            const currentSubAttribute = v?.subAttribute ?? {};
            return { ...v, subAttribute: { ...currentSubAttribute, [key]: value } };
          }
          return v;
        }),
        true,
      );
      this.render();
    }
  }

  public getHoverRectID = (e: MouseEvent) => {
    const coordinate = this.getCoordinateUnderZoom(e);
    const newScope = scope;

    const { currentShowList } = this;
    if (currentShowList.length > 0) {
      if (this.selectedRectID) {
        const { selectedRect } = this;
        if (selectedRect) {
          if (RectUtils.isInRect(coordinate, selectedRect, newScope, this.zoom)) {
            return selectedRect.id;
          }
        }
      }

      const hoverList = currentShowList.filter((rect) => RectUtils.isInRect(coordinate, rect, newScope, this.zoom));

      if (hoverList.length === 0) {
        return '';
      }

      if (hoverList.length === 1) {
        return hoverList[0].id;
      }

      if (hoverList.length > 1) {
        // 判断矩形的大小, 矩形面积小的优先
        const rectSizeList = hoverList
          .map((rect) => ({ size: rect.width * rect.height, id: rect.id }))
          .sort((a, b) => a.size - b.size);

        return rectSizeList[0].id;
      }
    }

    return '';
  };

  /**
   * 获取当前选中rect的文本
   */
  public getSelectedRectTextAttribute = (hoverRectID: string) => {
    if (hoverRectID) {
      const hoverRect = this.rectList.find((v) => v.id === hoverRectID);
      return hoverRect?.textAttribute || '';
    }
    return '';
  };

  /**
   * 获取当前的选中部分的hoverIndex
   * ../../../param e
   */
  public getHoverRectPointIndex(e: MouseEvent) {
    if (!this.selectedRect) {
      return -1;
    }

    return AxisUtils.returnClosePointIndex(
      this.getCoordinateUnderZoom(e),
      RectUtils.getRectPointList(this.selectedRect, this.zoom),
      scope + 2,
    );
  }

  public getHoverRectEdgeIndex(e: MouseEvent) {
    if (!this.selectedRect) {
      return -1;
    }

    let edgeIndex = -1;
    const { selectedRect } = this;
    const edgeList = RectUtils.getRectEdgeList(selectedRect, this.zoom);
    const coordinate = this.getCoordinateUnderZoom(e);

    for (let i = 0; i < edgeList.length; i++) {
      const edge = edgeList[i];
      const { length } = MathUtils.getFootOfPerpendicular(coordinate, edge.begin, edge.end);

      if (length < scope + 10) {
        edgeIndex = i;
      }
    }

    return edgeIndex;
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

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation || e.ctrlKey === true) {
      return;
    }

    // e.stopPropagation();
    // 仅有在选中模式才能进行拖动
    const dragStartCoord = this.getCoordinateUnderZoom(e);
    const hoverRectID = this.getHoverRectID(e);

    /**
     * 拖拽基础判断，如果包含以下行为则直接禁止操作
     * 1. 拖拽行为下禁止操作 - 右键
     * 2. 拖拽行为下禁止操作 - 左键 + space
     */
    if (e.button === 2 || (e.button === 0 && this.isSpaceKey === true)) {
      return;
    }

    if (this.selectedRectID) {
      const firstRect = this.currentShowList.find((v) => v.id === this.selectedRectID);
      if (!firstRect) {
        return;
      }

      if (this.getHoverRectPointIndex(e) > -1) {
        // 点的拖拽
        const dragTarget = EDragTarget.Point;
        this.dragInfo = {
          dragStartCoord,
          dragTarget,
          startTime: +new Date(),
          firstRect,
        };
        this.dragStatus = EDragStatus.Start;

        return;
      }

      if (this.getHoverRectEdgeIndex(e) > -1) {
        // 点的拖拽
        const dragTarget = EDragTarget.Line;
        this.dragInfo = {
          dragStartCoord,
          dragTarget,
          startTime: +new Date(),
          firstRect,
        };
        this.dragStatus = EDragStatus.Start;

        return;
      }
    }

    if (this.selection.isIdSelected(hoverRectID) && !this.drawingRect) {
      const dragTarget = EDragTarget.Plane;

      this.dragInfo = {
        dragStartCoord,
        dragTarget,
        firstRect: this.selectedRect,
        startTime: +new Date(),
        originRectList: this.selectedRects,
      };
      this.dragStatus = EDragStatus.Start;
    }

    return undefined;
  }

  public appendOffsetRect(rect: IRect, offset: ICoordinate) {
    return {
      ...rect,
      x: rect.x + offset.x / this.zoom,
      y: rect.y + offset.y / this.zoom,
    };
  }

  public getRectsBoundaries(rects: IRect[], offset: ICoordinate) {
    const rectsPoint: ICoordinate[] = rects.reduce((pre: ICoordinate[], next) => {
      return pre.concat(...RectUtils.getRectPointList(this.appendOffsetRect(next, offset)));
    }, []);

    return MathUtils.calcViewportBoundaries(rectsPoint);
  }

  /**
   * 判断框是否超过依赖范围
   * @param rects
   * @param offset
   * @returns
   */
  public isRectsOutOfTarget(rects: IRect[], offset: ICoordinate) {
    if (this.drawOutSideTarget !== false) {
      return false;
    }

    const rectsBoundaries = this.getRectsBoundaries(rects, offset);

    const selectedRectRange = {
      y: rectsBoundaries.top,
      x: rectsBoundaries.left,
      height: rectsBoundaries.bottom - rectsBoundaries.top,
      width: rectsBoundaries.right - rectsBoundaries.left,
    };

    // 多边形判断
    if (this.basicResult?.pointList?.length > 0) {
      return RectUtils.isRectNotInPolygon(
        selectedRectRange as IRect,
        getPolygonPointUnderZoom(this.basicResult.pointList, this.zoom),
      );
    }

    // 原图、拉框范围判断
    if (this.basicResult || this.imgInfo) {
      const basicRect = this.basicResult
        ? this.basicResult
        : { x: 0, y: 0, height: this.imgNode?.height, width: this.imgNode?.width };

      if (basicRect) {
        return [
          { x: rectsBoundaries.left, y: rectsBoundaries.top },
          { x: rectsBoundaries.right, y: rectsBoundaries.bottom },
        ].some((i) => {
          return !RectUtils.isInRect(i, basicRect);
        });
      }
    }

    return false;
  }

  /**
   * Update rect position while dragTarget is equal EDragTarget.Plane
   * @param offset
   */
  public moveRects(offset: ICoordinate) {
    if (this.dragInfo?.originRectList) {
      let selectedRects = _.cloneDeep(this.dragInfo.originRectList);

      if (this.isRectsOutOfTarget(selectedRects, offset)) {
        return;
      }

      selectedRects = this.dragInfo.originRectList!.map((i) => ({
        ...i,
        x: i.x + offset.x / this.zoom,
        y: i.y + offset.y / this.zoom,
      }));

      this.setRectList(
        this.rectList.map((v) => {
          const updatedRect = selectedRects.find((i) => i.id === v.id);
          if (updatedRect) {
            return updatedRect;
          }

          return v;
        }),
      );
    }
  }

  /**
   * Offset is under zooming.
   * @param offset
   */
  public onDragMoveAll(offset: ICoordinate) {
    if (!this.dragInfo?.originRectList?.length) {
      return;
    }
    this.setRectList(
      this.dragInfo.originRectList.map((rect) => {
        const newRect = {
          ...rect,
          x: rect.x + offset.x / this.zoom,
          y: rect.y + offset.y / this.zoom,
        };

        return newRect;
      }),
    );

    this.render();
  }

  // 选中了一个盒子对盒子进行拖动或者更改大小
  public onDragMove(coordinate: ICoordinate) {
    if (!this.dragInfo) {
      return;
    }

    const offset = {
      x: coordinate.x - this.dragInfo.dragStartCoord.x,
      y: coordinate.y - this.dragInfo.dragStartCoord.y,
    }; // 缩放后的偏移

    this.dragStatus = EDragStatus.Move;

    if (this.dragInfo.dragTarget === EDragTarget.Plane) {
      this.moveRects(offset);
      return;
    }

    if (!this.dragInfo.firstRect) {
      return;
    }

    // 选中后的操作
    const dragRect = RectUtils.getRectUnderZoom(this.dragInfo.firstRect, this.zoom);
    const { x, y, width, height } = dragRect;

    let selectedRect = this.rectList.filter((v) => v.id === this.selectedRectID)[0];

    switch (this.dragInfo.dragTarget) {
      // 仅处理翻转的偏移

      case EDragTarget.Point:
        {
          let newX = x;
          let newY = y;
          let newWidth = width;
          let newHeight = height;

          switch (this.hoverRectPointIndex) {
            case 0: {
              newX = width - offset.x < 0 ? x + width : x + offset.x;
              newY = height - offset.y < 0 ? y + height : y + offset.y;
              newWidth = Math.abs(offset.x - width);
              newHeight = Math.abs(offset.y - height);
              break;
            }

            case 1: {
              newX = width + offset.x > 0 ? x : x + width + offset.x;
              newY = height - offset.y < 0 ? y + height : y + offset.y;
              newWidth = Math.abs(width + offset.x);
              newHeight = Math.abs(height - offset.y);
              break;
            }

            case 2: {
              newX = width + offset.x > 0 ? x : x + width + offset.x;
              newY = height + offset.y > 0 ? y : y + height + offset.y;
              newWidth = Math.abs(width + offset.x);
              newHeight = height + offset.y > 0 ? height + offset.y : Math.abs(height + offset.y);
              break;
            }

            case 3: {
              newX = width - offset.x < 0 ? x + width : x + offset.x;
              newY = height + offset.y > 0 ? y : y + height + offset.y;
              newWidth = Math.abs(offset.x - width);
              newHeight = height + offset.y > 0 ? height + offset.y : Math.abs(height + offset.y);
              break;
            }

            default: {
              return;
            }
          }

          selectedRect = {
            ...selectedRect,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        }
        break;

      case EDragTarget.Line: {
        let newX = x;
        let newY = y;
        let newWidth = width;
        let newHeight = height;

        switch (this.hoverRectEdgeIndex) {
          case 0: {
            newY = height - offset.y < 0 ? y + height : y + offset.y;
            newHeight = Math.abs(offset.y - height);
            break;
          }

          case 1: {
            newX = width + offset.x > 0 ? x : x + width + offset.x;
            newWidth = Math.abs(width + offset.x);
            break;
          }

          case 2: {
            newY = height + offset.y > 0 ? y : y + height + offset.y;
            newHeight = height + offset.y > 0 ? height + offset.y : Math.abs(height + offset.y);
            break;
          }

          case 3: {
            newX = width - offset.x < 0 ? x + width : x + offset.x;
            newWidth = Math.abs(offset.x - width);
            break;
          }

          default: {
            return;
          }
        }

        selectedRect = {
          ...selectedRect,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };

        break;
      }

      default: {
        // 都无命中，则无法进行拖拽

        return;
      }
    }

    // 边缘判断
    if (this.drawOutSideTarget === false) {
      if (this.basicResult) {
        if (this.basicResult?.pointList?.length > 0) {
          // 多边形判断
          if (
            RectUtils.isRectNotInPolygon(selectedRect, getPolygonPointUnderZoom(this.basicResult.pointList, this.zoom))
          ) {
            return;
          }
        }

        const basicX = this.basicResult.x * this.zoom;
        const basicY = this.basicResult.y * this.zoom;
        const basicWidth = this.basicResult.width * this.zoom;
        const basicHeight = this.basicResult.height * this.zoom;

        if (
          selectedRect.x < basicX - 0.01 ||
          selectedRect.y < basicY - 0.01 ||
          selectedRect.width > basicX + basicWidth - selectedRect.x + 0.01 ||
          selectedRect.height > basicY + basicHeight - selectedRect.y + 0.01
        ) {
          return;
        }
        if (selectedRect.x < basicX) {
          selectedRect.x = basicX;
        }
        if (selectedRect.y < basicY) {
          selectedRect.y = basicY;
        }

        if (selectedRect.width > basicX + basicWidth - selectedRect.x) {
          switch (this.dragInfo.dragTarget) {
            // case EDragTarget.Plane:
            //   selectedRect.x = basicX + basicWidth - width;
            //   break;

            case EDragTarget.Point:
            case EDragTarget.Line:
              if (offset.x > 0 && offset.y > 0) {
                selectedRect.width = basicX + basicWidth - selectedRect.x;
              }
              break;

            default: {
              return;
            }
          }
        }

        if (selectedRect.height > basicY + basicHeight - selectedRect.y) {
          switch (this.dragInfo.dragTarget) {
            // case EDragTarget.Plane:
            //   selectedRect.y = basicY + basicHeight - height;
            //   break;

            default: {
              break;
            }
          }
        }
      } else {
        // 原图的限制
        if (selectedRect.x < 0) {
          selectedRect.x = 0;
        }

        if (selectedRect.y < 0) {
          selectedRect.y = 0;
        }

        if (this.imgInfo) {
          switch (this.dragInfo.dragTarget) {
            // 仅处理翻转的偏移

            // case EDragTarget.Plane:
            //   if (selectedRect.x + selectedRect.width > this.imgInfo?.width) {
            //     selectedRect.x = this.imgInfo.width - width;
            //   }

            //   if (selectedRect.y + selectedRect.height > this.imgInfo?.height) {
            //     selectedRect.y = this.imgInfo.height - height;
            //   }
            //   break;

            default: {
              if (
                selectedRect.x + selectedRect.width > this.imgInfo?.width + 0.01 ||
                selectedRect.y + selectedRect.height > this.imgInfo?.height + 0.01
              ) {
                // 对线条和点先不做延伸的判断
                return;
              }
            }
          }
        }
      }
    }

    this.setRectList(
      this.rectList.map((v) => {
        if (v.id === selectedRect.id) {
          return RectUtils.getRectUnderZoom(selectedRect, 1 / this.zoom);
        }
        return v;
      }),
    );

    this.render();
  }

  private lastMouseMoveTime = 0; // 记录上次鼠标移动的时间

  private mouseMoveThrottle = 16; // 节流时间（毫秒）

  public onMouseMove(e: MouseEvent) {
    requestAnimationFrame(() => {
      const now = Date.now();

      // 节流：如果上次调用时间未超过设定的时间间隔，则跳过
      if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) {
        return;
      }
      this.lastMouseMoveTime = now;

      if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
        return;
      }

      const coordinateZoom = this.getCoordinateUnderZoom(e);

      const coordinate = AxisUtils.changeDrawOutsideTarget(
        coordinateZoom,
        { x: 0, y: 0 },
        this.imgInfo,
        this.drawOutSideTarget,
        this.basicResult,
        this.zoom,
      );

      if (this.selectedIDs.length > 0 && this.dragInfo) {
        this.onDragMove(coordinate);
        return;
      }

      if (this.selectedRectID) {
        const hoverRectPointIndex = this.getHoverRectPointIndex(e);

        if (hoverRectPointIndex !== this.hoverRectPointIndex) {
          this.hoverRectPointIndex = hoverRectPointIndex;
          this.hoverRectEdgeIndex = -1;
          this.render();
          return;
        }

        if (this.hoverRectPointIndex === -1) {
          // 边的检测
          const hoverRectEdgeIndex = this.getHoverRectEdgeIndex(e);

          if (hoverRectEdgeIndex !== this.hoverRectEdgeIndex) {
            this.hoverRectEdgeIndex = hoverRectEdgeIndex;
            this.render();
            return;
          }
        }
      }

      const hoverRectID = this.getHoverRectID(e);
      const oldHoverRectID = this.hoverRectID;
      this.hoverRectID = hoverRectID;
      if (hoverRectID !== oldHoverRectID) {
        this.render();
      }

      if (this.enableAddRect && this.drawingRect && this.firstClickCoord) {
        let { x, y } = this.firstClickCoord;
        let { width, height } = this.drawingRect;

        width = Math.abs(x - coordinate.x); // zoom 下的 width
        height = Math.abs(y - coordinate.y);
        if (coordinate.x < x) {
          x = coordinate.x;
        }
        if (coordinate.y < y) {
          y = coordinate.y;
        }

        if (this.drawOutSideTarget === false) {
          if (this.basicResult?.pointList?.length > 0) {
            // changeDrawOutsideTarget 最好还是在这里下功夫这里暂时进行多边形的判断
            if (
              RectUtils.isRectNotInPolygon(
                {
                  ...this.drawingRect,
                  x,
                  y,
                  width,
                  height,
                },
                getPolygonPointUnderZoom(this.basicResult.pointList, this.zoom),
              )
            ) {
              return;
            }
          }

          if (coordinate.x < 0) {
            width = Math.abs(this.firstClickCoord.x);
            x = 0;
          }
          if (coordinate.y < 0) {
            height = Math.abs(this.firstClickCoord.y);
            y = 0;
          }
          if (this.imgInfo) {
            if (x + width > this.imgInfo.width) {
              width = Math.abs(this.imgInfo.width - x);
            }
            if (y + height > this.imgInfo.height) {
              height = Math.abs(this.imgInfo.height - y);
            }
          }
        }

        this.drawingRect = {
          ...this.drawingRect,
          x,
          y,
          width,
          height,
        };
        this.render();
      }

      return undefined;
    });
  }

  public setHighlightVisible(highlightVisible: boolean) {
    this.highlightVisible = highlightVisible;
    this.setAttributeLockList([]);
  }

  public setAttributeLockList(attributeLockList: string[]) {
    this.setSelectedRectID(undefined);

    if (attributeLockList?.length) {
      this.highlightVisible = false;
    }
    super.setAttributeLockList(attributeLockList);
  }

  public setBasicResult(basicResult: any) {
    super.setBasicResult(basicResult);

    this.clearActiveStatus();
  }

  public setRectValidAndRender(id?: string) {
    const hasValid = this.rectList.some((rect) => rect?.valid);
    this.setRectList(
      this.rectList.map((rect) => {
        if (rect.id === id) {
          return {
            ...rect,
            valid: !rect.valid,
          };
        }
        if (this.selection.isIdSelected(rect.id)) {
          rect.valid = !hasValid;
        }
        return rect;
      }),
      true,
    );

    this.render();

    // 同步 rectList
    this.emit('updateResult');
  }

  public setDefaultSubAttribute = () => {
    if (this.config?.secondaryAttributeConfigurable && this.config?.subAttributeList) {
      const subAttribute = TagUtils.getDefaultResultByConfig(this.config?.subAttributeList ?? []);
      this.setRectList(
        this.rectList.map((v) => {
          if (v.id === this.selectedRectID) {
            const currentSubAttribute = v?.subAttribute ?? subAttribute;
            return { ...v, subAttribute: currentSubAttribute };
          }
          return v;
        }),
        true,
      );
    }
  };

  public createNewDrawingRect(e: MouseEvent, basicSourceID: string) {
    if (!this.imgInfo) {
      return;
    }

    const coordinateZoom = this.getCoordinateUnderZoom(e);
    const coordinate = AxisUtils.changeDrawOutsideTarget(
      coordinateZoom,
      { x: 0, y: 0 },
      this.imgInfo,
      this.drawOutSideTarget,
      this.basicResult,
      this.zoom,
    );

    this.setSelectedRectID('');
    this.hoverRectID = '';
    if (this.drawOutSideTarget) {
      if (coordinate.x < 0) {
        coordinate.x = 0;
      }

      if (coordinate.y < 0) {
        coordinate.y = 0;
      }
    }

    this.drawingRect = {
      ...coordinate,
      width: 0,
      height: 0,
      attribute: this.defaultAttribute,
      valid: !e.ctrlKey,
      id: uuid(8, 62),
      sourceID: basicSourceID,
      textAttribute: '',
    };

    if (this.hasMarkerConfig) {
      const nextMarkInfo = CommonToolUtils.getNextMarker(
        this.currentPageResult,
        this.config.markerList,
        this.markerIndex,
      );

      if (nextMarkInfo) {
        if (this.drawingRect) {
          this.drawingRect = {
            ...this.drawingRect,
            label: nextMarkInfo.label,
          };
        }
        this.markerIndex = nextMarkInfo.index;
        this.emit('markIndexChange');
      } else {
        // 不存在则不允许创建新的
        this.emit('messageInfo', locale.getMessagesByLocale(EMessage.MarkerFinish, this.lang));
        this.drawingRect = undefined;
        return;
      }
    }

    if (this.config.textConfigurable) {
      let textAttribute = '';
      textAttribute = AttributeUtils.getTextAttribute(
        this.rectList.filter((rect) => CommonToolUtils.isSameSourceID(rect.sourceID, basicSourceID)),
        this.config.textCheckType,
      );
      if (this.drawingRect) {
        this.drawingRect = {
          ...this.drawingRect,
          textAttribute,
        };
      }
    }

    if (this.config?.secondaryAttributeConfigurable && this.config?.subAttributeList) {
      const subAttribute = TagUtils.getDefaultResultByConfig(this.config?.subAttributeList ?? []);
      this.drawingRect = {
        ...this.drawingRect,
        subAttribute,
      };
    }

    // 标注序号添加
    Object.assign(this.drawingRect, {
      order:
        CommonToolUtils.getMaxOrder(
          this.rectList.filter((v) => CommonToolUtils.isSameSourceID(v.sourceID, basicSourceID)),
        ) + 1,
    });

    this.firstClickCoord = {
      ...coordinate,
    };

    this.firstCurrentPos = {
      ...this.currentPos,
    };

    /**
     * 数据注入
     */
    if (this.dataInjectionAtCreation) {
      const data = this.dataInjectionAtCreation(this.drawingRect);
      if (data) {
        Object.assign(this.drawingRect, data);
      }
    }
  }

  /**
   * 将绘制中的框体添加进 rectList 中
   * @returns
   */
  public addDrawingRectToRectList() {
    if (!this.drawingRect) {
      return;
    }

    // 结束框的绘制
    // drawingRect 为相对于原图的坐标

    let { width, height } = this.drawingRect;
    width /= this.zoom;
    height /= this.zoom;

    // 小于最小尺寸设置为无效框
    if (Math.round(width) < this.config.minWidth || Math.round(height) < this.config.minHeight) {
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.RectErrorSizeNotice, this.lang));

      this.clearDrawingStatus();
      this.render();
      return;
    }

    const newRectList = this.getDrawingRectWithRectList();

    this.setRectList(newRectList, true);
    this.history.pushHistory(this.rectList);
    this.setSelectedIdAfterAddingDrawingRect();

    this.clearDrawingStatus();
  }

  public setSelectedIdAfterAddingDrawingRect() {
    if (!this.drawingRect) {
      return;
    }

    if (this.config.textConfigurable || this.config?.secondaryAttributeConfigurable) {
      this.setSelectedRectID(this.drawingRect.id);
    } else {
      this.setSelectedRectID();
    }
  }

  public getDrawingRectWithRectList() {
    if (!this.drawingRect) {
      return this.rectList;
    }

    let { x, y, width, height } = this.drawingRect;
    x /= this.zoom;
    y /= this.zoom;
    width /= this.zoom;
    height /= this.zoom;

    return [
      ...this.rectList,
      {
        ...this.drawingRect,
        x,
        y,
        width,
        height,
      },
    ];
  }

  /**
   * mouseup 下的鼠标右键
   * @param e
   */
  public rightMouseUp(e: MouseEvent) {
    const hoverRectID = this.getHoverRectID(e);

    const hoverRect = this.rectList.find((v) => v.id === hoverRectID);
    this.selectedRectTextAttribute = '';
    if (this.drawingRect) {
      // 取消绘制
      this.drawingRect = undefined;
      this.firstClickCoord = undefined;
    } else {
      // 选中操作

      if (
        this.dragInfo?.dragStartCoord &&
        distance(
          this.dragInfo?.dragStartCoord as unknown as Coord,
          this.getCoordinateUnderZoom(e) as unknown as Coord,
        ) > 3
      ) {
        this.dblClickListener.clearRightDblClick();
      }

      this.setSelectedRectID(hoverRectID, e.ctrlKey);

      // Only executed when one is selected
      if (hoverRect && this.selectedIDs?.length === 1) {
        // 缓存选中 rect 的文本值
        this.selectedRectTextAttribute = this.getSelectedRectTextAttribute(hoverRectID);
        this.setDefaultAttribute(hoverRect.attribute);
      }

      this.hoverRectID = '';

      if (hoverRect?.label && this.hasMarkerConfig) {
        const markerIndex = CommonToolUtils.getCurrentMarkerIndex(hoverRect.label, this.config.markerList);
        if (markerIndex >= 0) {
          this.setMarkerIndex(markerIndex);
          this.emit('markIndexChange');
        }
      }
      if (this.config?.secondaryAttributeConfigurable && this.config?.subAttributeList) {
        this.setDefaultSubAttribute();
      }
    }

    this.render();
    return hoverRect;
  }

  public shiftRightMouseUp(e: MouseEvent) {
    const hoverRectID = this.getHoverRectID(e);

    this.emit('shiftRightMouseUp', hoverRectID);
  }

  public updateDragResult() {
    this.emit('updateDragResult', { ...this.selectedRect });
  }

  /** Allow/Disallow to add rect to rectList */
  public setEnableAddRect(isEnableAddRect: boolean) {
    this.enableAddRect = isEnableAddRect;
  }

  public onMouseUp(e: MouseEvent) {
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return true;
    }

    if (this.dragInfo && this.dragStatus === EDragStatus.Move) {
      // 拖拽停止
      this.dragInfo = undefined;
      this.dragStatus = EDragStatus.Wait;
      this.history.pushHistory(this.rectList);

      // 同步 rectList
      this.emit('updateResult');
      this.updateDragResult();
      return;
    }

    // shift + 右键操作
    if (e.button === 2 && e.shiftKey === true) {
      this.shiftRightMouseUp(e);
      return;
    }

    // 右键关闭
    if (e.button === 2) {
      this.rightMouseUp(e);
      return;
    }

    const basicSourceID = CommonToolUtils.getSourceID(this.basicResult);
    if (this.drawingRect) {
      if (this.enableAddRect) {
        // 结束框的绘制
        this.addDrawingRectToRectList();
      } else {
        // Clear the drawing
        this.clearDrawingStatus();
        this.render();
      }

      return;
    }

    if (e.ctrlKey === true && e.button === 0 && this.hoverRectID) {
      // ctrl + 左键 + hover存在，更改框属性
      this.setRectValidAndRender(this.hoverRectID);
      return;
    }

    if (this.enableAddRect) {
      // 创建框
      this.createNewDrawingRect(e, basicSourceID);
      this.render();
    }

    return undefined;
  }

  public onRightDblClick(e: MouseEvent) {
    super.onRightDblClick(e);
    const hoverRectID = this.getHoverRectID(e);

    // 删除选中
    if (this.selection.isIdSelected(hoverRectID)) {
      this.deleteSelectedRect(e);
    }
  }

  // eslint-disable-next-line no-unused-vars
  public deleteSelectedRect(e: UIEvent) {
    this.selectedRects.forEach((rect) => {
      this.deleteRect(rect.id);
    });
  }

  public onKeyDown(e: KeyboardEvent) {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      // 如果为输入框则进行过滤
      return;
    }

    if (super.onKeyDown(e) === false) {
      return;
    }

    if (this.selection.triggerKeyboardEvent(e, this.setRectList.bind(this) as unknown as SetDataList)) {
      return;
    }

    const { keyCode } = e;
    switch (keyCode) {
      case EKeyCode.Ctrl:
        if (this.drawingRect) {
          this.drawingRect = {
            ...this.drawingRect,
            valid: !e.ctrlKey,
          };
          this.render();
        }
        break;

      case EKeyCode.F:
        if (this.selectedIDs.length > 0) {
          this.setRectValidAndRender(this.selectedRectID);
        }

        break;

      case EKeyCode.Z:
        this.setIsHidden(!this.isHidden);
        this.render();
        break;

      case EKeyCode.Delete:
        this.deleteSelectedRect(e);
        break;

      case EKeyCode.Tab: {
        e.preventDefault();

        if (this.drawingRect) {
          // 如果正在编辑则不允许使用 Tab 切换
          return;
        }

        let sort = ESortDirection.ascend;
        if (e.shiftKey) {
          sort = ESortDirection.descend;
        }

        const [showingRect, selectedRect] = CommonToolUtils.getRenderResultList<IRect>(
          this.rectList,
          CommonToolUtils.getSourceID(this.basicResult),
          this.attributeLockList,
          this.selectedIDs,
        );

        let rectList = [...showingRect];
        if (selectedRect) {
          rectList = [...rectList, ...selectedRect];
        }

        const viewPort = CanvasUtils.getViewPort(this.canvas, this.currentPos, this.zoom);
        rectList = rectList.filter((rect) => CanvasUtils.inViewPort({ x: rect.x, y: rect.y }, viewPort));

        const nextSelectedRect = CommonToolUtils.getNextSelectedRectID(rectList, sort, this.selectedRectID) as IRect;
        if (nextSelectedRect) {
          this.setSelectedRectID(nextSelectedRect.id);
          if (this.config.attributeConfigurable === true) {
            this.setDefaultAttribute(nextSelectedRect.attribute);
          }
        }

        break;
      }

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

    return true;
  }

  public onKeyUp(e: KeyboardEvent) {
    super.onKeyUp(e);
    switch (e.keyCode) {
      case EKeyCode.Ctrl:
        if (this.drawingRect) {
          this.drawingRect = {
            ...this.drawingRect,
            valid: true,
          };
          this.render();
        }
        break;

      default: {
        break;
      }
    }
  }

  public onWheel(e: MouseEvent) {
    const oldZoom = this.zoom;
    let newDrawingRect;
    let newFirsClickCoord;

    if (this.drawingRect && this.firstClickCoord) {
      newDrawingRect = RectUtils.getRectUnderZoom(this.drawingRect, 1 / oldZoom);
      newFirsClickCoord = AxisUtils.changePointByZoom(this.firstClickCoord, 1 / oldZoom);
    }

    super.onWheel(e, false);
    if (newDrawingRect && newFirsClickCoord) {
      this.drawingRect = RectUtils.getRectUnderZoom(newDrawingRect, this.zoom);
      this.firstClickCoord = AxisUtils.changePointByZoom(newFirsClickCoord, this.zoom);
    }
    this.render();
  }

  public textChange = (v: string) => {
    if (this.config.textConfigurable !== true || !this.selectedRectID) {
      return;
    }

    this.setRectList(AttributeUtils.textChange(v, this.selectedRectID, this.rectList), true);

    this.emit('selectedChange');
    this.render();
  };

  public getCurrentSelectedData() {
    const { selectedRect } = this;
    if (!selectedRect) {
      return;
    }

    const toolColor = this.getColor(selectedRect.attribute);
    const color = selectedRect.valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    return {
      width: selectedRect.width * this.zoom * 0.6,
      textAttribute: selectedRect.textAttribute,
      color,
    };
  }

  /**
   * 获取当前渲染的样式
   * @param rect
   * @returns
   */
  public getRenderStyle(rect: IRect) {
    const customStyle = this.customRenderStyle && this.customRenderStyle(rect);
    if (customStyle) {
      return customStyle;
    }
    const toolColor = this.getColor(rect.attribute);
    let strokeColor;
    let fillColor;

    // 是否为有效框;
    if (rect.valid === false) {
      strokeColor = toolColor?.invalid.stroke;
      fillColor = toolColor?.invalid.fill;
    } else {
      strokeColor = toolColor?.valid.stroke;
      fillColor = toolColor?.valid.fill;
    }
    return {
      strokeColor,
      fillColor,
      textColor: strokeColor,
      toolColor,
    };
  }

  public renderTextAttribute() {
    const { selectedRect } = this;
    if (!this.ctx || this.config.textConfigurable !== true || !selectedRect) {
      return;
    }

    const { x, y, width, height, attribute, valid } = selectedRect;

    const newWidth = width * this.zoom * 0.6;
    const coordinate = AxisUtils.getOffsetCoordinate({ x, y: y + height }, this.currentPos, this.zoom);
    const toolColor = this.getColor(attribute);
    const color = valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    const offset = 4;
    if (!this._textAttributeInstance) {
      // 属性文本示例

      this._textAttributeInstance = new TextAttributeClass({
        width: newWidth,
        container: this.container,
        icon: this.getTextIconSvg(attribute),
        color,
        getCurrentSelectedData: this.getCurrentSelectedData,
        updateSelectedTextAttribute: this.updateSelectedRectTextAttribute,
      });
    }

    if (this._textAttributeInstance && !this._textAttributeInstance?.isExit) {
      this._textAttributeInstance.appendToContainer();
    }

    this._textAttributeInstance.update(`${selectedRect.textAttribute}`, {
      left: coordinate.x,
      top: coordinate.y + offset,
      color,
      width: newWidth,
    });
  }

  public renderSelectedRect(rect?: IRect) {
    if (!this.ctx || !rect) {
      return;
    }

    const { ctx } = this;
    let radius = 10;
    const pointList = RectUtils.getRectPointList(rect);
    const len = pointList.length;
    const toolColor = this.getColor(rect.attribute);

    pointList.forEach((v: ICoordinate, i: number) => {
      ctx.save();
      ctx.moveTo(v.x, v.y);
      ctx.beginPath();

      if (this.hoverRectPointIndex === i) {
        radius = scope + 6;
      } else {
        radius = scope;
      }

      // 是否为有效框;
      if (rect.valid === false) {
        ctx.strokeStyle = toolColor?.invalid.stroke;
        ctx.fillStyle = toolColor?.invalid.stroke;
      } else {
        ctx.strokeStyle = toolColor?.valid.stroke;
        ctx.fillStyle = toolColor?.valid.stroke;
      }

      ctx.arc(v.x * this.zoom + this.currentPos.x, v.y * this.zoom + this.currentPos.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // 边的加深
      if (this.hoverRectEdgeIndex === i) {
        ctx.beginPath();
        ctx.lineWidth = 10;
        const lineColor = this.getColor(rect.attribute);
        const strokeStyle = rect.valid === false ? lineColor?.invalid?.stroke : lineColor?.valid?.stroke;

        ctx.strokeStyle = strokeStyle;

        ctx.moveTo(pointList[i].x * this.zoom + this.currentPos.x, pointList[i].y * this.zoom + this.currentPos.y);
        ctx.lineTo(
          pointList[(i + 1) % len].x * this.zoom + this.currentPos.x,
          pointList[(i + 1) % len].y * this.zoom + this.currentPos.y,
        );
        ctx.stroke();
      }
      ctx.restore();
    });

    this.renderTextAttribute();
  }

  /**
   *  绘制当前框的
   * @param rect 当前矩形框
   * @param zoom  缩放比例
   * @param isZoom 是否进行缩放
   */
  public renderDrawingRect(rect: IRect, zoom = this.zoom, isZoom = false, isPointCloud2DHighlight = false) {
    if (this.ctx && rect) {
      const { ctx, style } = this;
      // 不看图形信息
      const { hiddenText = false } = style;

      ctx.save();

      const { strokeColor, fillColor, textColor } = this.getRenderStyle(rect);

      ctx.font = 'lighter 14px Arial';
      let showText = '';
      if (this.config?.isShowOrder && rect.order && rect?.order > 0) {
        showText = `${rect.order}`;
      }

      if (rect.label && this.hasMarkerConfig) {
        const order = CommonToolUtils.getCurrentMarkerIndex(rect.label, this.config.markerList) + 1;

        showText = `${order}_${MarkerUtils.getMarkerShowText(rect.label, this.config.markerList)}`;
      }

      if (rect.attribute) {
        showText = `${showText}  ${AttributeUtils.getAttributeShowText(rect.attribute, this.config?.attributeList)}`;
        // Secondary Attributes
        if (rect?.subAttribute && this.config?.secondaryAttributeConfigurable && this.config?.subAttributeList) {
          const list = TagUtils.getTagNameList(rect.subAttribute, this.config.subAttributeList);
          list.forEach((i) => {
            showText += `\n${i.keyName}: ${i.value.join(`、`)}`;
          });
        }
      }

      const transformRect = AxisUtils.changeRectByZoom(rect, isZoom ? zoom : this.zoom, this.currentPos);

      if (!hiddenText) {
        // 框体上方展示
        DrawUtils.drawText(this.canvas, { x: transformRect.x, y: transformRect.y - 6 }, showText, {
          color: strokeColor,
          font: 'normal normal 900 14px SourceHanSansCN-Regular',
          ...DEFAULT_TEXT_SHADOW,
          textMaxWidth: 300,
        });
      }

      if (this.highlightVisible && rect?.isHighlight) {
        DrawUtils.drawHighlightFlag({
          canvas: this.canvas,
          color: strokeColor,
          position: {
            x: transformRect.x - 5,
            y: transformRect.y - 16,
          },
        });
      }

      const lineWidth = this.style?.width ?? 2;

      const isSameTextAttribute =
        this.config.textConfigurable &&
        this.config.isHighlightSameTextAttribute &&
        this.selectedRectTextAttribute !== '' &&
        rect.textAttribute === this.selectedRectTextAttribute;

      if (
        rect.id === this.hoverRectID ||
        // 高亮同textAttribute 的其他框
        isSameTextAttribute ||
        rect.id === this.selectedRectID ||
        this.isMultiMoveMode ||
        isPointCloud2DHighlight
      ) {
        DrawUtils.drawRectWithFill(this.canvas, transformRect, { color: fillColor });
      }

      DrawUtils.drawRect(this.canvas, transformRect, {
        color: strokeColor,
        thickness: lineWidth,
        hiddenText: true,
        lineDash: rect.lineDash,
      });
      ctx.restore();

      // 框大小数值显示
      let rectSize = `${Math.round(rect.width)} * ${Math.round(rect.height)}`;

      if (isZoom === true) {
        // 说明绘制的是缩放后的比例
        rectSize = `${Math.round(rect.width / this.zoom)} * ${Math.round(transformRect.height / this.zoom)}`;
      }

      const textSizeWidth = rectSize.length * 7;
      if (!hiddenText) {
        DrawUtils.drawText(
          this.canvas,
          { x: transformRect.x + transformRect.width - textSizeWidth, y: transformRect.y + transformRect.height + 15 },
          rectSize,
          {
            color: textColor,
            font: 'normal normal 600 14px Arial',
            ...DEFAULT_TEXT_SHADOW,
          },
        );
      }

      // 文本的输入
      if (!hiddenText && rect.textAttribute && rect.id !== this.selectedRectID) {
        const marginTop = 0;
        const textWidth = Math.max(20, transformRect.width - textSizeWidth);
        DrawUtils.drawText(
          this.canvas,
          { x: transformRect.x, y: transformRect.y + transformRect.height + 20 + marginTop },
          rect.textAttribute,
          {
            color: textColor,
            font: 'italic normal 900 14px Arial',
            textMaxWidth: textWidth,
            ...DEFAULT_TEXT_SHADOW,
          },
        );
      }
    }
  }

  /**
   * 渲染静态框体
   */
  public renderStaticRect() {
    if (!(this.rectList?.length > 0 && JSON.stringify(this.rectList))) {
      return;
    }

    const { renderEnhance = {} } = this;

    const [showingRect, selectedRects] = CommonToolUtils.getRenderResultList<IRect>(
      this.rectList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedIDs,
      this.highlightVisible,
    );
    // 静态矩形
    if (!this.isHidden) {
      showingRect?.forEach((rect) => {
        this.renderDrawingRect(rect);

        // 静态渲染挣增强渲染
        if (renderEnhance.staticRender) {
          renderEnhance.staticRender(
            this.canvas,
            AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos),
            this.getRenderStyle(rect),
          );
        }
      });
    }

    // 选中矩形熏染
    if (selectedRects) {
      selectedRects.forEach((rect) => {
        this.renderDrawingRect(rect);
        this.renderSelectedRect(rect);

        if (renderEnhance.selectedRender) {
          renderEnhance.selectedRender(
            this.canvas,
            AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos),
            this.getRenderStyle(rect),
          );
        }
      });
    }

    // After selecting the top view, it is necessary to highlight the 2D box of the corresponding 2D view
    this.renderPointCloud2DHighlight();
  }

  /**
   * 创建创建中的框体
   * @returns
   */
  public renderCreatingRect() {
    if (!this.drawingRect) {
      return;
    }

    const { renderEnhance = {} } = this;
    this.renderDrawingRect(this.drawingRect, 1, true); // 正常框体的创建

    // 创建时进行渲染
    if (renderEnhance.creatingRender) {
      renderEnhance.creatingRender(
        this.canvas,
        AxisUtils.changeRectByZoom(this.drawingRect, 1, this.currentPos),
        this.getRenderStyle(this.drawingRect),
      );
    }
  }

  /**
   * 渲染矩形框体
   */
  public renderRect() {
    this.renderStaticRect();
    this.renderCreatingRect();
  }

  public render() {
    if (!this.ctx) {
      return;
    }

    super.render();
    this.renderRect();
    this.renderCursorLine(this.getLineColor(this.defaultAttribute));
  }

  public setDefaultAttribute(defaultAttribute?: string) {
    const oldDefault = this.defaultAttribute;
    this.defaultAttribute = defaultAttribute ?? '';

    if (oldDefault !== defaultAttribute) {
      // 如果更改 attribute 需要同步更改 style 的样式
      this.changeStyle(defaultAttribute);

      //  触发侧边栏同步
      this.emit('changeAttributeSidebar');

      // 如有选中目标，则需更改当前选中的属性
      if (this.selectedRects) {
        this.setRectList(
          this.rectList.map((v) => {
            if (this.selection.isIdSelected(v.id)) {
              return {
                ...v,
                attribute: this.defaultAttribute,
              };
            }

            return v;
          }),
          true,
        );

        this.history.pushHistory(this.rectList);
        this.render();
      }

      if (this.drawingRect) {
        this.drawingRect = {
          ...this.drawingRect,
          attribute: this.defaultAttribute,
        };
        this.render();
      }

      if (this._textAttributeInstance) {
        if (this.attributeLockList.length > 0 && !this.attributeLockList.includes(this.defaultAttribute)) {
          // 属性隐藏
          this._textAttributeInstance.clearTextAttribute();
          return;
        }

        this._textAttributeInstance.updateIcon(this.getTextIconSvg(defaultAttribute));
      }
    }
  }

  public setValid(valid: boolean) {
    super.setValid(valid);

    this.emit('updateResult');
  }

  private clearDrawingStatus() {
    this.drawingRect = undefined;
    this.firstClickCoord = undefined;
    this.dragInfo = undefined;
    this.dragStatus = EDragStatus.Wait;
  }

  /**
   *  清楚所有的中间状态
   */
  public clearActiveStatus() {
    this.clearDrawingStatus();
    this.setSelectedRectID(undefined);
    this.setOperationMode(EOperationMode.General);
  }

  public clearResult(sendMessage = true) {
    const newRectList: IRect[] = this.rectList.filter((rect) => rect.disableDelete === true);
    if (newRectList.length > 0 && sendMessage) {
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.ClearPartialData, this.lang));
    }

    this.setRectList(newRectList, true);
    this.setSelectedRectID(undefined);
  }

  public deleteRect(rectID?: string) {
    if (!rectID) {
      return;
    }
    const selectedRect = this.rectList.find((v) => v.id === rectID);

    if (selectedRect?.disableDelete === true) {
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.DisableDelete, this.lang));
      return;
    }

    this.setRectList(
      this.rectList.filter((v) => v.id !== rectID),
      true,
    );
    this.history.pushHistory(this.rectList);
    this.setSelectedRectID(undefined);
    this._textAttributeInstance?.clearTextAttribute();
    this.render();
  }

  /**
   * 导出结果
   */
  public exportData(): any[] {
    const { rectList } = this;

    return [rectList, this.basicImgInfo];
  }

  /** 撤销 */
  public undo() {
    const rectList = this.history.undo();
    if (rectList) {
      if (rectList.length !== this.rectList.length) {
        this.setSelectedRectID('');
      }

      this.setRectList(rectList, true);
      this.render();
    }
  }

  /** 重做 */
  public redo() {
    const rectList = this.history.redo();
    if (rectList) {
      if (rectList.length !== this.rectList.length) {
        this.setSelectedRectID('');
      }

      this.setRectList(rectList, true);
      this.render();
    }
  }

  public setHoverRectID(id: string) {
    this.hoverRectID = id;
  }
}

export { RectOperation, IRectOperationProps };

export default RectOperation;
