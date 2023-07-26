import RectOperation from './rectOperation';

class Rect2DOperation extends RectOperation {
  public checkMode?: Boolean;

  constructor(props: any) {
    super(props);
    this.checkMode = props.checkMode;
  }

  public createNewDrawingRect() {}
  public onRightDblClick() {}

  public onMouseMove(e: MouseEvent): undefined {
    if (this.checkMode) {
      return;
    }
    super.onMouseMove(e);
  }
}

export default Rect2DOperation;
