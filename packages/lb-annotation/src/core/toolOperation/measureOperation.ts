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

  public setSelectedIdAfterAddingDrawingRect() {
    if (!this.drawingRect) {
      return;
    }

    this.setSelectedRectID(this.drawingRect.id);
  }
}

export default MeasureOperation;
