/**
 * @file Rectangles displayed on a 2D point cloud view
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年7月27日
 */

import { RectOperation } from './rectOperation';
import { IPointCloud2DRectOperationViewRect } from '@/components/pointCloud2DRectOperationView';

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
    this.emit('deleteSelectedRect', this.selectedRects);
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

  public renderDrawingRect(rect: IPointCloud2DRectOperationViewRect, zoom = this.zoom, isZoom = false) {
    if (!rect?.boxID) {
      Object.assign(rect, { lineDash: [3] });
    }

    super.renderDrawingRect(rect, zoom, isZoom);
  }
}

export default PointCloud2DRectOperation;
