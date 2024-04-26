/**
 * @file Rectangles displayed on a 2D point cloud view
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年7月27日
 */

import { IPointCloud2DRectOperationViewRect } from '@labelbee/lb-utils';
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
  public deleteSelectedRect() {
    if (this.checkMode) {
      return;
    }
    this.emit('deleteSelectedRects', this.selectedRects);
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

  public renderDrawingRect(rect: IPointCloud2DRectOperationViewRect & IRect, zoom = this.zoom, isZoom = false) {
    if (!rect?.boxID) {
      Object.assign(rect, { lineDash: [3] });
    }

    super.renderDrawingRect(rect, zoom, isZoom);
  }
}

export default PointCloud2DRectOperation;
