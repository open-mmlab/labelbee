import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import AxisUtils from '@/utils/tool/AxisUtils';
import uuid from '@/utils/uuid';
import {
  getPointsByBottomRightPoint,
  getCuboidDragMove,
  getCuboidHoverRange,
  getHighlightPoints,
  getToggleDirectionButtonOffset,
  getCuboidTextAttributeOffset,
  isCuboidWithInLimits,
  getPlainPointsByDiagonalPoints,
} from '@/utils/tool/CuboidUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import { ECuboidDirection, EDragStatus, EDragTarget } from '@/constant/annotation';
import type { ICuboid, ICuboidConfig, ICuboidPosition, IDrawingCuboid } from '@/types/tool/cuboid';
import AttributeUtils from '@/utils/tool/AttributeUtils';
import { DEFAULT_TEXT_MAX_WIDTH } from '@/constant/tool';
import EKeyCode from '@/constant/keyCode';

import { BasicToolOperation } from './basicToolOperation';
import type { IBasicToolOperationProps } from './basicToolOperation';
import DrawUtils from '../../utils/tool/DrawUtils';
import CuboidToggleButtonClass from './cuboidToggleButtonClass';
import TextAttributeClass, { ITextAttributeFuc } from './textAttributeClass';
import locale from '../../locales';
import { EMessage } from '../../locales/constants';

type ICuboidOperationProps = IBasicToolOperationProps;

/**
 * Just use for the drawing.
 */
enum EDrawingStatus {
  Ready = 1,
  FirstPoint = 2,
  Cuboid = 3,
}
const TEXT_MAX_WIDTH = 164;

class CuboidOperation extends BasicToolOperation implements ITextAttributeFuc {
  private toggleButtonInstance?: CuboidToggleButtonClass;

  public drawingCuboid?: IDrawingCuboid;

  /**
   * The coordinates of the first click, used for creating a cuboid.
   */
  public firstClickCoord?: ICoordinate;

  public drawingStatus = EDrawingStatus.Ready;

  public cuboidList: ICuboid[] = [];

  public selectedID?: string;

  public config: ICuboidConfig;

  public hoverID = '';

  // Drag Data
  private dragInfo?: {
    dragStartCoord: ICoordinate; // Need to set under zoom in order to avoid inaccurate data due to precision conversion
    initCuboid: ICuboid;
    dragTarget: EDragTarget;
    positions?: ICuboidPosition[]; // Confirm the update Position.
  };

  // For effects when hover is highlighted.
  private highlightInfo?: {
    type: string;
    points: ICoordinate[];
    originCuboid: ICuboid;
    positions: ICuboidPosition[];
  }[];

  private _textAttributeInstance?: TextAttributeClass;

  public get selectedText() {
    return this.selectedCuboid?.textAttribute ?? '';
  }

  public constructor(props: ICuboidOperationProps) {
    super(props);
    this.config = CommonToolUtils.jsonParser(props.config);

    this.getCurrentSelectedData = this.getCurrentSelectedData.bind(this);
    this.updateSelectedTextAttribute = this.updateSelectedTextAttribute.bind(this);
  }

  public destroy(): void {
    super.destroy();
    if (this._textAttributeInstance) {
      this._textAttributeInstance.clearTextAttribute();
    }
  }

  /**
   * Get the showing cuboidList which is needed to be shown.
   *
   * Filter Condition: (It is not enabled currently)
   * 1. basicResult
   * 2. attributeLockList
   */
  public get currentShowList() {
    let cuboidList: ICuboid[] = [];
    const [showingCuboid, selectedCuboid] = CommonToolUtils.getRenderResultList<ICuboid>(
      this.cuboidList,
      CommonToolUtils.getSourceID(this.basicResult),
      this.attributeLockList,
      this.selectedID,
    );
    cuboidList = showingCuboid;

    if (this.isHidden) {
      cuboidList = [];
    }

    if (selectedCuboid) {
      cuboidList.push(selectedCuboid);
    }
    return cuboidList;
  }

  public get selectedCuboid() {
    return this.cuboidList.find((v) => v.id === this.selectedID);
  }

  public get dataList() {
    return this.cuboidList;
  }

  public get isNeedCheckCuboidSize() {
    return this.config?.minWidth >= 0 && this.config?.minHeight >= 0;
  }

  /**
   * Whether the mouse is in the hover range.
   * @param e
   * @returns
   */
  public getIsHoverSelectedCuboid(e: MouseEvent) {
    const currentCoord = this.getCoordinateUnderZoom(e);
    const { selectedCuboid } = this;
    return (
      selectedCuboid &&
      AxisUtils.isCloseCuboid(currentCoord, AxisUtils.changeCuboidByZoom(selectedCuboid, this.zoom) as ICuboid)
    );
  }

  /**
   * Forbidden to draw a cuboid if the backPlane is front than the frontPlane.
   * @param e
   * @param cuboid
   * @returns
   */
  public isForbiddenMove(e: MouseEvent, cuboid: ICuboid | IDrawingCuboid) {
    const coord = this.getCoordinateInOrigin(e);

    if (coord.y > cuboid.frontPoints.br.y) {
      return true;
    }
    return false;
  }

  public getHoverData = (e: MouseEvent) => {
    const coordinate = this.getCoordinateUnderZoom(e);

    const { currentShowList } = this;

    if (currentShowList?.length > 0) {
      // 1. Get the cuboid max range(PointList)
      const polygonList = currentShowList.map((cuboid) => {
        return { id: cuboid.id, pointList: AxisUtils.changePointListByZoom(getCuboidHoverRange(cuboid), this.zoom) };
      });
      const hoverID = PolygonUtils.getHoverPolygonID(coordinate, polygonList);

      if (hoverID) {
        return {
          hoverID,
          hoverCuboid: currentShowList.find((cuboid) => cuboid.id === hoverID),
        };
      }
    }

    return {};
  };

  public updateSelectedCuboid(newCuboid: ICuboid) {
    this.cuboidList = this.cuboidList.map((cuboid) => {
      if (cuboid.id === this.selectedID) {
        return newCuboid;
      }
      return cuboid;
    });
  }

  public getColorToRender(attribute: string, valid: boolean) {
    const toolColor = this.getColor(attribute);
    const strokeColor = valid ? toolColor?.valid.stroke : toolColor?.invalid.stroke;
    const fillColor = valid ? toolColor?.valid.fill : toolColor?.invalid.fill;

    return { strokeColor, toolColor, fillColor };
  }

  /**
   * Get Selected Data.
   *
   * Exclusive: TextAttributeInstance.
   * @param attribute
   * @param valid
   * @returns
   */
  public getCurrentSelectedData() {
    const { selectedCuboid } = this;
    if (!selectedCuboid) {
      return;
    }

    const { strokeColor: color } = this.getColorToRender(selectedCuboid.attribute, selectedCuboid.valid);
    return {
      width: TEXT_MAX_WIDTH,
      textAttribute: selectedCuboid.textAttribute,
      color,
    };
  }

  /**
   * Update text Input.
   *
   * Exclusive: TextAttributeInstance.
   * @param attribute
   * @param valid
   * @returns
   */
  public updateSelectedTextAttribute(newTextAttribute?: string) {
    if (this._textAttributeInstance && newTextAttribute && this.selectedID) {
      // 切换的时候如果存在

      let textAttribute = newTextAttribute;
      if (AttributeUtils.textAttributeValidate(this.config.textCheckType, '', textAttribute) === false) {
        this.emit('messageError', AttributeUtils.getErrorNotice(this.config.textCheckType, this.lang));
        textAttribute = '';
      }

      this.setCuboidList(AttributeUtils.textChange(textAttribute, this.selectedID, this.cuboidList));
      this.history.pushHistory(this.cuboidList);
      this.emit('updateTextAttribute');
      this.render();
    }
  }

  public setResult(cuboidList: ICuboid[]) {
    this.clearActiveStatus();
    this.setCuboidList(cuboidList);
    this.render();
  }

  /**
   * 获取当前页面标注结果
   */
  public get currentPageResult() {
    return this.cuboidList;
  }

  public clearResult() {
    this.setCuboidList([], true);
    this.deleteSelectedID();
    this.render();
  }

  public exportData() {
    const { cuboidList } = this;

    return [cuboidList, this.basicImgInfo];
  }

  public setSelectedID(newID?: string) {
    const oldID = this.selectedID;
    if (newID !== oldID && oldID) {
      // 触发文本切换的操作

      this._textAttributeInstance?.changeSelected();
    }

    if (!newID) {
      this._textAttributeInstance?.clearTextAttribute();
    }

    this.selectedID = newID;
    this.emit('selectedChange');
  }

  public setSelectedIDAndRender(newID?: string) {
    this.setSelectedID(newID);
    this.render();
  }

  public setCuboidValidAndRender(id: string) {
    if (!id) {
      return;
    }

    const newPolygonList = this.cuboidList.map((cuboid) => {
      if (cuboid.id === id) {
        return {
          ...cuboid,
          valid: !cuboid.valid,
        };
      }

      return cuboid;
    });

    this.setCuboidList(newPolygonList, true);
    this.history.pushHistory(this.cuboidList);
    this.render();
  }

  public onRightDblClick(e: MouseEvent) {
    super.onRightDblClick(e);

    const { hoverID } = this.getHoverData(e);
    if (this.selectedID && this.selectedID === hoverID) {
      this.deleteCuboid(hoverID);
    }
  }

  public setCuboidList(cuboidList: ICuboid[], isUpload = false) {
    const oldLen = this.cuboidList.length;
    this.cuboidList = cuboidList;

    if (oldLen !== cuboidList.length) {
      this.emit('updatePageNumber');
    }

    // Sync with external data.
    if (isUpload) {
      this.emit('updateResult');
    }
  }

  public deleteCuboid(id: string) {
    if (!id) {
      return;
    }
    this.setCuboidList(this.cuboidList.filter((v) => v.id !== id));

    this.history.pushHistory(this.cuboidList);

    this.setSelectedID('');

    // Clear TextAttribute.
    this._textAttributeInstance?.clearTextAttribute();

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

    const { keyCode } = e;
    switch (keyCode) {
      case EKeyCode.Ctrl:
        /**
         * Set Invalid.
         */
        if (this.drawingCuboid) {
          this.drawingCuboid = {
            ...this.drawingCuboid,
            valid: false,
          };
          this.render();
        }
        break;

      case EKeyCode.F:
        if (this.selectedID) {
          this.setCuboidValidAndRender(this.selectedID);
        }

        break;

      default: {
        if (this.config.attributeConfigurable) {
          const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(keyCode, this.config.attributeList);

          if (keyCode2Attribute !== undefined) {
            this.setDefaultAttribute(keyCode2Attribute);
          }
        }
      }
    }
  }

  public onKeyUp(e: KeyboardEvent) {
    super.onKeyUp(e);

    switch (e.keyCode) {
      case EKeyCode.Ctrl:
        /**
         * Restore the valid.
         */
        if (this.drawingCuboid) {
          this.drawingCuboid = {
            ...this.drawingCuboid,
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

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation || e.ctrlKey === true) {
      return;
    }

    const { selectedCuboid } = this;

    if (!selectedCuboid || e.button === 2 || (e.button === 0 && this.isSpaceKey === true)) {
      return;
    }

    /**
     * Dragging must be within the selectedCuboid range of the hover.
     */
    if (!this.getIsHoverSelectedCuboid(e)) {
      return;
    }

    this.dragStatus = EDragStatus.Start;
    const dragStartCoord = this.getCoordinateUnderZoom(e);
    const DEFAULT_DRAG_INFO = {
      initCuboid: selectedCuboid,
      dragStartCoord,
    };

    const highlightInfo = AxisUtils.returnClosePointOrLineInCuboid(
      dragStartCoord,
      AxisUtils.changeCuboidByZoom(selectedCuboid, this.zoom) as ICuboid,
    );

    // Just use the first one.
    const firstHighlightInfo = highlightInfo?.[0];

    switch (firstHighlightInfo?.type) {
      case 'point':
        this.dragInfo = {
          ...DEFAULT_DRAG_INFO,
          dragTarget: EDragTarget.Point,
          positions: firstHighlightInfo.positions,
        };
        break;

      case 'line':
        this.dragInfo = {
          ...DEFAULT_DRAG_INFO,
          dragTarget: EDragTarget.Line,
          positions: firstHighlightInfo.positions,
        };
        break;

      default: {
        this.dragInfo = {
          ...DEFAULT_DRAG_INFO,
          dragTarget: EDragTarget.Cuboid,
        };
      }
    }
  }

  public onMouseUp(e: MouseEvent): boolean | void {
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    /**
     * Drag Status Clear.
     */
    if (this.dragInfo && this.dragStatus === EDragStatus.Move) {
      this.dragInfo = undefined;
      this.dragStatus = EDragStatus.Wait;

      this.history.pushHistory(this.cuboidList);

      // Sync with external data.
      this.emit('updateResult');
      return;
    }

    const basicSourceID = CommonToolUtils.getSourceID(this.basicResult);

    if (e.button === 0) {
      /**
       * Ctrl + left Mouse update the valid of cuboid.
       */
      if (this.hoverID && e.ctrlKey && !this.drawingCuboid) {
        this.setCuboidValidAndRender(this.hoverID);

        return;
      }
      /**
       * Office Annotation.
       */

      // 1. Create First Point & Basic Cuboid.
      if (!this.drawingCuboid) {
        this.createNewDrawingCuboid(e, basicSourceID);
        return;
      }

      // 2. Finish Rect
      if (this.drawingCuboid) {
        switch (this.drawingStatus) {
          case EDrawingStatus.FirstPoint:
            this.closeNewDrawingFrontPlane();
            break;
          case EDrawingStatus.Cuboid:
            this.closeAndCreateNewCuboid();
            break;

          default: {
            //
          }
        }
      }
    }

    // Right Mouse Up
    if (e.button === 2) {
      this.rightMouseUp(e);
    }
  }

  public onMouseMove(e: MouseEvent): boolean | void {
    if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
      return;
    }

    /**
     * Drag Move.
     */
    if (this.selectedID && this.dragInfo) {
      this.onDragMove(e);
      return;
    }

    /**
     * Drawing Cuboid.
     */
    if (this.drawingCuboid) {
      // 1. Drawing Front Plane.
      if (this.drawingFrontPlanesMove(e)) {
        return;
      }

      // 2. Drawing Back Plane.
      this.drawingBackPlaneMove(e);

      return;
    }

    /**
     * Highlight hover cuboid.
     */
    this.hoverID = this.getHoverData(e).hoverID ?? '';

    this.onHoverMove(e);
  }

  public drawingFrontPlanesMove(e: MouseEvent) {
    if (this.drawingCuboid && this.firstClickCoord && this.drawingStatus === EDrawingStatus.FirstPoint) {
      const coord = this.getCoordinateInOrigin(e);
      this.drawingCuboid = {
        ...this.drawingCuboid,
        frontPoints: getPlainPointsByDiagonalPoints(this.firstClickCoord, coord),
      };
      this.render();
      return true;
    }
  }

  public drawingBackPlaneMove(e: MouseEvent) {
    if (this.drawingCuboid && this.firstClickCoord && this.drawingStatus === EDrawingStatus.Cuboid) {
      const coord = this.getCoordinateInOrigin(e);

      if (this.isForbiddenMove(e, this.drawingCuboid)) {
        return;
      }
      this.drawingCuboid = {
        ...this.drawingCuboid,
        backPoints: getPointsByBottomRightPoint({ coord, points: this.drawingCuboid.frontPoints }),
      };
      this.render();
    }
  }

  public onDragMove(e: MouseEvent) {
    if (!this.dragInfo || !this.selectedID) {
      return;
    }

    const { dragTarget, initCuboid, dragStartCoord, positions } = this.dragInfo;

    const coordinate = this.getCoordinateUnderZoom(e);

    const offset = {
      x: (coordinate.x - dragStartCoord.x) / this.zoom,
      y: (coordinate.y - dragStartCoord.y) / this.zoom,
    };

    this.dragStatus = EDragStatus.Move;

    const newCuboid = getCuboidDragMove({ offset, cuboid: initCuboid, dragTarget, positions });

    /**
     * DEFAULT：
     * The backPoints is not allowed to be in front of the frontPoints.
     */
    if (newCuboid?.backPoints && newCuboid?.backPoints.br.y > newCuboid?.frontPoints.br.y) {
      return;
    }

    if (newCuboid) {
      this.updateSelectedCuboid(newCuboid);
    }
    this.render();
  }

  /**
   * onMouseMove in hover.
   *
   * Highlight the position of hover.
   * @param e
   */
  public onHoverMove(e: MouseEvent) {
    const { selectedCuboid } = this;
    if (selectedCuboid) {
      const currentCoord = this.getCoordinateUnderZoom(e);

      const highlightInfo = AxisUtils.returnClosePointOrLineInCuboid(
        currentCoord,
        AxisUtils.changeCuboidByZoom(selectedCuboid, this.zoom) as ICuboid, // The highlighted range needs to be under zoom to work properly
        {
          zoom: 1 / this.zoom,
          scope: 5,
        },
      );

      this.highlightInfo = highlightInfo;
      this.render();
    }
  }

  public createNewDrawingCuboid(e: MouseEvent, basicSourceID: string) {
    if (!this.imgInfo) {
      return;
    }
    const coordinate = this.getCoordinateInOrigin(e);

    // 1. Create New Cuboid.
    this.drawingCuboid = {
      attribute: this.defaultAttribute,
      direction: ECuboidDirection.Front,
      valid: !e.ctrlKey,
      id: uuid(8, 62),
      sourceID: basicSourceID,
      textAttribute: '',
      order:
        CommonToolUtils.getMaxOrder(
          this.cuboidList.filter((v) => CommonToolUtils.isSameSourceID(v.sourceID, basicSourceID)),
        ) + 1,
      frontPoints: {
        tl: coordinate,
        bl: coordinate,
        tr: coordinate,
        br: coordinate,
      },
    };

    // 2. Save The First Click Coordinate.
    this.firstClickCoord = {
      ...coordinate,
    };

    // 3. Update Status.
    this.drawingStatus = EDrawingStatus.FirstPoint;

    // 4. Update TextAttribute
    if (this.config.textConfigurable) {
      let textAttribute = '';
      textAttribute = AttributeUtils.getTextAttribute(
        this.cuboidList.filter((cuboid) => CommonToolUtils.isSameSourceID(cuboid.sourceID, basicSourceID)),
        this.config.textCheckType,
      );
      this.drawingCuboid = {
        ...this.drawingCuboid,
        textAttribute,
      };
    }
  }

  /**
   * Change Status
   * From drawing frontPlane to backPlane
   */
  public closeNewDrawingFrontPlane() {
    this.drawingStatus = EDrawingStatus.Cuboid;
  }

  public closeAndCreateNewCuboid() {
    if (!this.drawingCuboid?.frontPoints || !this.drawingCuboid.backPoints) {
      return;
    }

    /**
     * The creation limits.
     *
     * 1. Open the cuboidSize Check.
     * 2. beyond the limits.
     */
    if (
      this.isNeedCheckCuboidSize &&
      isCuboidWithInLimits({ cuboid: this.drawingCuboid, config: this.config }) === false
    ) {
      // Tips for limits. Same with rect.
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.RectErrorSizeNotice, this.lang));
    } else {
      // Add New Cuboid.
      this.setCuboidList([...this.cuboidList, this.drawingCuboid as ICuboid]);
      this.setSelectedID(this.drawingCuboid?.id);

      this.history.pushHistory(this.cuboidList);
    }

    this.clearDrawingStatus();
    this.render();
  }

  public deleteSelectedID() {
    this.setSelectedID('');
  }

  public clearDrawingStatus() {
    if (this.drawingCuboid) {
      this.drawingCuboid = undefined;
      this.drawingStatus = EDrawingStatus.Ready;
    }
  }

  public clearActiveStatus() {
    this.clearDrawingStatus();
    this.deleteSelectedID();
  }

  public rightMouseUp(e: MouseEvent) {
    // 1. Selected
    const { hoverID, hoverCuboid } = this.getHoverData(e);
    this.setSelectedID(hoverID);

    // Sync the attribute of hoverCuboid.
    if (hoverCuboid) {
      this.setDefaultAttribute(hoverCuboid.attribute);
    }

    // 2. If it is in drawing, the drawing status needs to be clear.
    if (this.drawingCuboid) {
      this.clearDrawingStatus();
    }

    this.render();
  }

  /**
   * TODO - Need to optimize.
   * @param cuboid
   */
  public renderSingleCuboid(cuboid: ICuboid | IDrawingCuboid) {
    const transformCuboid = AxisUtils.changeCuboidByZoom(cuboid, this.zoom, this.currentPos);
    const isHover = transformCuboid.id === this.hoverID;
    const isSelected = transformCuboid.id === this.selectedID;
    const { strokeColor, fillColor } = this.getColorToRender(transformCuboid.attribute, transformCuboid.valid);
    const textColor = strokeColor;

    const lineWidth = this.style?.width ?? 2;
    const { hiddenText = false } = this.style;
    const defaultStyle = {
      color: strokeColor,
      thickness: lineWidth,
    };
    const { backPoints, frontPoints, textAttribute } = transformCuboid;

    const frontPointsSizeWidth = frontPoints.br.x - frontPoints.bl.x;

    DrawUtils.drawCuboid(this.canvas, transformCuboid, { strokeColor, fillColor, thickness: lineWidth });

    // Hover Highlight
    if (isHover || isSelected) {
      const hoverPointList = getHighlightPoints(transformCuboid as ICuboid);
      hoverPointList.forEach((data) => {
        DrawUtils.drawCircleWithFill(this.canvas, data.point, 5, { ...defaultStyle });
      });
      if (isSelected) {
        hoverPointList.forEach((data) => {
          DrawUtils.drawCircleWithFill(this.canvas, data.point, 3, { color: 'white' });
        });
      }
    }

    let showText = '';
    if (this.config?.isShowOrder && transformCuboid.order && transformCuboid?.order > 0) {
      showText = `${transformCuboid.order}`;
    }

    if (transformCuboid.attribute) {
      showText = `${showText}  ${AttributeUtils.getAttributeShowText(
        transformCuboid.attribute,
        this.config?.attributeList,
      )}`;
    }

    if (!hiddenText && backPoints) {
      DrawUtils.drawText(this.canvas, { x: backPoints.tl.x, y: backPoints.tl.y - 5 }, showText, {
        color: strokeColor,
        textMaxWidth: 300,
      });
    }

    const textPosition = getCuboidTextAttributeOffset({
      cuboid,
      currentPos: this.currentPos,
      zoom: this.zoom,
      topOffset: 16,
      leftOffset: 0,
    });

    // 文本的输入
    if (!hiddenText && textAttribute && cuboid.id !== this.selectedID) {
      const textWidth = Math.max(20, frontPointsSizeWidth * 0.8);
      DrawUtils.drawText(this.canvas, { x: textPosition.left, y: textPosition.top }, textAttribute, {
        color: textColor,
        textMaxWidth: textWidth,
      });
    }

    this.renderTextAttribute();
  }

  public setDefaultAttribute(defaultAttribute?: string) {
    const oldDefault = this.defaultAttribute;
    this.defaultAttribute = defaultAttribute ?? '';

    if (oldDefault !== defaultAttribute) {
      // If change attribute, need to change the styles in parallel
      this.changeStyle(defaultAttribute);

      //  Trigger sidebar synchronization
      this.emit('changeAttributeSidebar');

      // If this target is selected, the currently selected property needs to be changed
      const { selectedCuboid } = this;

      if (selectedCuboid) {
        this.setCuboidList(
          this.cuboidList.map((v) => {
            if (v.id === this.selectedID) {
              return {
                ...v,
                attribute: this.defaultAttribute,
              };
            }

            return v;
          }),
        );

        this.history.pushHistory(this.cuboidList);
        this.render();
      }

      if (this.drawingCuboid) {
        this.drawingCuboid = {
          ...this.drawingCuboid,
          attribute: this.defaultAttribute,
        };
        this.render();
      }

      // Update TextAttribute Icon Color
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

  public renderToggleButton() {
    const { selectedCuboid } = this;
    if (!this.ctx || !selectedCuboid) {
      return;
    }
    const { attribute, valid } = selectedCuboid;

    const { strokeColor: color } = this.getColorToRender(attribute, valid);

    if (!this.toggleButtonInstance) {
      this.toggleButtonInstance = new CuboidToggleButtonClass({
        container: this.container,
        cuboidButtonMove: (type: 'in' | 'out') => this.updateMouseOperation(type),
        toggleDirection: (direction: ECuboidDirection) => this.toggleDirection(direction),
      });
    }

    const toggleOffset = getToggleDirectionButtonOffset({
      cuboid: selectedCuboid,
      zoom: this.zoom,
      currentPos: this.currentPos,
    });

    this.toggleButtonInstance.update({
      left: toggleOffset.left,
      top: toggleOffset.top,
      color,
    });
  }

  public renderTextAttribute() {
    const { selectedCuboid } = this;
    if (!this.ctx || this.config.textConfigurable === false || !selectedCuboid) {
      return;
    }

    const { strokeColor: color } = this.getColorToRender(selectedCuboid.attribute, selectedCuboid.valid);
    const { attribute, textAttribute, frontPoints } = selectedCuboid;
    const offset = getCuboidTextAttributeOffset({
      cuboid: selectedCuboid,
      currentPos: this.currentPos,
      zoom: this.zoom,
    });
    const newWidth = (frontPoints.br.x - frontPoints.bl.x) * this.zoom * 0.8;

    // Init
    if (!this._textAttributeInstance) {
      this._textAttributeInstance = new TextAttributeClass({
        width: DEFAULT_TEXT_MAX_WIDTH,
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
      left: offset.left,
      top: offset.top,
      color,
      width: newWidth,
    });
  }

  public renderDrawing() {
    if (this.drawingCuboid) {
      this.renderSingleCuboid(this.drawingCuboid);
    }
  }

  public renderStatic() {
    this.cuboidList.forEach((cuboid) => this.renderSingleCuboid(cuboid));
  }

  public renderSelected() {
    const { selectedCuboid } = this;
    if (selectedCuboid) {
      this.renderSingleCuboid(selectedCuboid);
      this.renderToggleButton();
    } else {
      this.toggleButtonInstance?.clearCuboidButtonDOM();
      this.toggleButtonInstance = undefined;
    }
  }

  // Executed when the mouse is moved in and out to toggle the glossy button
  public updateMouseOperation(type: 'in' | 'out') {
    if (type === 'in') {
      // Show crosshairs
      this.setForbidCursorLine(true);
      // Restricted mouse action
      this.setForbidOperation(true);
      this.setShowDefaultCursor(true);
    } else {
      this.setForbidCursorLine(false);
      this.setShowDefaultCursor(false);
      this.setForbidOperation(false);
    }
  }

  public toggleDirection(direction: ECuboidDirection) {
    if (this.cuboidList && this.selectedCuboid) {
      this.setCuboidList(this.cuboidList.map((i) => (i.id === this.selectedCuboid?.id ? { ...i, direction } : i)));
      this.history.pushHistory(this.cuboidList);
      this.render();
    }
  }

  /**
   * Notice: Hover is under selectedCuboid.
   */
  public renderHover() {
    if (this.dragInfo) {
      return;
    }
    this.highlightInfo?.forEach((data) => {
      const { strokeColor } = this.getColorToRender(data.originCuboid.attribute, data.originCuboid.valid);
      const thickness = 8;

      switch (data.type) {
        case 'point':
          data.points?.forEach((point) => {
            DrawUtils.drawCircleWithFill(
              this.canvas,
              AxisUtils.changePointByZoom(point, this.zoom, this.currentPos),
              thickness,
              {
                color: strokeColor,
              },
            );
          });

          // TODO - Update cursor
          break;
        case 'line': {
          const pointList = data.points?.map((point) => AxisUtils.changePointByZoom(point, this.zoom, this.currentPos));
          if (pointList) {
            DrawUtils.drawLineWithPointList(this.canvas, pointList, { color: strokeColor, thickness });
          }
          // TODO - Update cursor
          break;
        }
        default: {
          //
        }
      }
    });
  }

  public renderCuboid() {
    this.renderStatic();
    this.renderDrawing();
    this.renderSelected();
    this.renderHover();
  }

  public render() {
    if (!this.ctx) {
      return;
    }
    super.render();
    this.renderCuboid();
    this.renderCursorLine(this.getLineColor(this.defaultAttribute));
  }

  public undo() {
    const cuboidList = this.history.undo();
    if (cuboidList) {
      if (cuboidList.length !== this.cuboidList.length) {
        this.setSelectedID('');
      }
      this.setCuboidList(cuboidList, true);
      this.render();
    }
  }

  public redo() {
    const cuboidList = this.history.redo();
    if (cuboidList) {
      if (cuboidList.length !== this.cuboidList.length) {
        this.setSelectedID('');
      }
      this.setCuboidList(cuboidList, true);
      this.render();
    }
  }

  /**
   * Sidebar Callback Function
   * @param v
   * @returns
   */
  public textChange = (v: string) => {
    if (this.config.textConfigurable === false || !this.selectedID) {
      return;
    }
    this.setCuboidList(AttributeUtils.textChange(v, this.selectedID, this.cuboidList));
    this.emit('selectedChange'); // 触发外层的更新
    this.render();
  };
}

export default CuboidOperation;
