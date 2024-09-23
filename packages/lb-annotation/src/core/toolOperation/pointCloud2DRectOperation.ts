/**
 * @file Rectangles displayed on a 2D point cloud view
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年7月27日
 */

import { IPointCloud2DRectOperationViewRect } from '@labelbee/lb-utils';
import EKeyCode from '@/constant/keyCode';
import { RectOperation } from './rectOperation';
import reCalcRect from './utils/reCalcRect';
import AxisUtils from '@/utils/tool/AxisUtils';

class PointCloud2DRectOperation extends RectOperation {
  // Whether it is in check mode
  public checkMode?: Boolean;

  public highLightRectList: IRect[] = [];

  constructor(props: any) {
    super(props);
    this.checkMode = props.checkMode;
    this.highLightRectList = [];
  }

  // Set highlighted point cloud 2D rectangular box list
  public setHighLightRectList(rectList: IRect[]) {
    this.highLightRectList = rectList;
  }

  // Disable creating new rect in checkMode
  public createNewDrawingRect(e: MouseEvent, basicSourceID: string) {
    if (this.checkMode) {
      return;
    }
    super.createNewDrawingRect(e, basicSourceID);
  }

  // Disable delete rect in checkMode
  public deleteSelectedRect(e: UIEvent) {
    if (this.checkMode) {
      return;
    }

    const { selectedRects } = this;

    // Stop keydown bubble when be regarded as the keydown fired only in 2d area
    if (selectedRects.length) {
      e.stopPropagation();
    }

    this.emit('deleteSelectedRects', selectedRects);
  }

  public setSelectedIdAfterAddingDrawingRect() {
    if (!this.drawingRect) {
      return;
    }

    this.setSelectedRectID(this.drawingRect.id);
    this.emit('afterAddingDrawingRect', { ...this.selectedRect });
  }

  public setSelectedRectID(newID?: string) {
    if (this.checkMode) {
      return;
    }
    super.setSelectedRectID(newID);
  }

  public onKeyDown(e: KeyboardEvent) {
    if (this.checkMode || ![EKeyCode.Delete, EKeyCode.R].includes(e.keyCode)) {
      return;
    }

    super.onKeyDown(e);

    const { keyCode, ctrlKey, altKey, shiftKey, metaKey } = e;

    switch (keyCode) {
      case EKeyCode.R: {
        // Isolation combination key
        if (ctrlKey || altKey || shiftKey || metaKey) {
          return;
        }

        this.resizeRect();
        break;
      }
      default:
    }

    return true;
  }

  public renderDrawingRect(
    rect: IPointCloud2DRectOperationViewRect & IRect,
    zoom = this.zoom,
    isZoom = false,
    isPointCloud2DHighlight = false,
  ) {
    // 是否使用强制默认值，如： lineDash: [3]
    const shouldNotUseForceValue = rect?.boxID || rect?.lineDash;

    super.renderDrawingRect(
      shouldNotUseForceValue ? rect : { ...rect, lineDash: [3] },
      zoom,
      isZoom,
      isPointCloud2DHighlight,
    );
  }

  // The rendering function actually triggers the rendering of the parent class in the end
  public renderPointCloud2DHighlight(): void {
    const { renderEnhance = {} } = this;

    if (this.highLightRectList) {
      this.highLightRectList.forEach((rect: IRect) => {
        this.renderDrawingRect(rect as IPointCloud2DRectOperationViewRect & IRect, this.zoom, false, true);

        if (renderEnhance.selectedRender) {
          renderEnhance.selectedRender(
            this.canvas,
            AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos),
            this.getRenderStyle(rect),
          );
        }
      });
    }
  }

  /*
    Resize the rectangular box 'rect' to specified dimensions, defaulting to 100x100 when the 'R' shortcut is used.
   */
  public resizeRect(resizeWidth: number = 100, resizeHeight: number = 100) {
    // Do not execute if the image has not finished loading
    if (!this.imgNode) return;
    // Return if no rectangles are selected
    if (!this.selectedRects?.length) return;
    // Verify if resizeWidth and resizeHeight are valid
    if (resizeWidth <= 0 || resizeHeight <= 0) return;
    // Origin Size less than resizeWidth and resizeHeight , remains unchanged
    if (this.selectedRects[0].width <= resizeWidth && this.selectedRects[0].height <= resizeHeight) return;

    const { width, height } = this.basicImgInfo;
    const targetRect = {
      width,
      height,
      x: 0,
      y: 0,
    };

    // Recalc the current rectangle size and position
    const curRect = reCalcRect(this.selectedRects[0], targetRect, resizeWidth, resizeHeight);
    // if no changes return, Optimize rendering times
    if (curRect.noChange) return;

    this.setRectList(
      this.rectList.map((v) => {
        if (this.selectedIDs.includes(v.id)) {
          return {
            ...v,
            ...curRect,
          };
        }
        return v;
      }),
      true,
    );
    this.render();
    this.updateDragResult();
  }

  public rightMouseUp(e: MouseEvent) {
    const hoverRect: (IRect & { boxID?: string }) | undefined = super.rightMouseUp(e);
    this.emit('onRightClick', { event: e, targetId: hoverRect?.boxID, id: hoverRect?.id });
    return hoverRect;
  }
}

export default PointCloud2DRectOperation;
