/**
 * @file Rectangles displayed on a 2D point cloud view
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年7月27日
 */

import { RectOperation } from './rectOperation';

class PointCloud2DRectOperation extends RectOperation {
  // Whether it is in check mode
  public checkMode?: Boolean;

  constructor(props: any) {
    super(props);
    this.checkMode = props.checkMode;
  }

  // Disable creating new rectangles
  public createNewDrawingRect(e: MouseEvent, basicSourceID: string) {
    if (this.checkMode) {
      return;
    }
    super.createNewDrawingRect(e, basicSourceID);
  }

  // Disable delete rect
  public deleteSelectedRect() {
    if (this.checkMode) {
      return;
    }
    this.selectedRects.forEach((rect) => {
      this.emit('deleteSelectedRect', rect);
    });
  }

  public setSelectedIdAfterAddingDrawingRect() {
    if (!this.drawingRect) {
      return;
    }

    this.setSelectedRectID(this.drawingRect.id);
    this.emit('afterAddingDrawingRect', { ...this.selectedRect });
  }

  // Disable mouse actions in check mode
  public onMouseMove(e: MouseEvent): undefined {
    if (this.checkMode) {
      return;
    }
    super.onMouseMove(e);
  }
}

export default PointCloud2DRectOperation;
