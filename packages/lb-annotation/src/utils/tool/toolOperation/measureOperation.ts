import { RectOperation, IRectOperationProps } from './rectOperation';

interface IMeasureOpeartion extends IRectOperationProps {}

const config = {
  textConfigurable: false,
  attributeConfigurable: true,
  attributeList: [],
};

class MeasureOperation extends RectOperation {
  constructor(props: IMeasureOpeartion) {
    super({ ...props, config: JSON.stringify(config) });
  }

  public createNewDrawingRect(e: MouseEvent, basicSourceID: string) {
    if (this.rectList.length > 0) {
      this.setRectList([]);
    }

    super.createNewDrawingRect(e, basicSourceID);
  }

  public setSelectedIdAfterAddingDrawingRect() {
    if (!this.drawingRect) {
      return;
    }

    this.setSelectedRectID(this.drawingRect.id);
  }

  public getDrawingRectWithRectList() {
    if (!this.drawingRect) {
      return [];
    }

    let { x, y, width, height } = this.drawingRect;
    x /= this.zoom;
    y /= this.zoom;
    width /= this.zoom;
    height /= this.zoom;

    return [
      {
        ...this.drawingRect,
        x,
        y,
        width,
        height,
      },
    ];
  }
}

export default MeasureOperation;
