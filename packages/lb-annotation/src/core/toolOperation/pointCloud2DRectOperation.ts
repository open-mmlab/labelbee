/**
 * @file Rectangles displayed on a 2D point cloud view
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年7月27日
 */

import { IPointCloud2DRectOperationViewRect } from '@labelbee/lb-utils';
import EKeyCode from '@/constant/keyCode';
import { RectOperation } from './rectOperation';

class PointCloud2DRectOperation extends RectOperation {
  // Whether it is in check mode
  public checkMode?: Boolean;

  constructor(props: any) {
    super(props);
    this.checkMode = props.checkMode;
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
    if (this.checkMode || ![EKeyCode.Delete, EKeyCode.P].includes(e.keyCode)) {
      return;
    }

    super.onKeyDown(e);
    return true;
  }

  private getComputedDrawingRect(rect: IPointCloud2DRectOperationViewRect & IRect) {
    const keyOfExtId = 'extId';
    // Is it 3d's projected or disconnected 3d's projected rect
    // @ts-ignore
    const shouldNotDashedLine = rect?.boxID || rect?.[keyOfExtId];

    return shouldNotDashedLine ? rect : { ...rect, lineDash: [3] };
  }

  public renderDrawingRect(rect: IPointCloud2DRectOperationViewRect & IRect, zoom = this.zoom, isZoom = false) {
    const targetRect = this.getComputedDrawingRect(rect);
    // window.console.log('[@DrawingRect] Rect: ', targetRect, ', Origin Rect: ', rect);

    super.renderDrawingRect(targetRect, zoom, isZoom);
  }
}

export default PointCloud2DRectOperation;
