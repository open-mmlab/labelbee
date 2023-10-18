import { IPolygonData, i18n } from '@labelbee/lb-utils';
import AxisUtils from '@/utils/tool/AxisUtils';
import { RectOperation } from './rectOperation';
import type { IRectOperationProps } from './rectOperation';
import EKeyCode from '../../constant/keyCode';
import CursorTextClass from './cursorTextClass';
import { ISAMCoordinate } from './segmentBySAM';

type TRunPrediction = (params: {
  point?: ICoordinate;
  addPoints?: ISAMCoordinate[];
  removePoints?: ISAMCoordinate[];
  rect: { x: number; y: number; w: number; h: number };
}) => Promise<IPolygonData[]>;

export interface ISegmentByRectProps extends IRectOperationProps {
  runPrediction: TRunPrediction;
}

class SegmentByRect extends RectOperation {
  private cursorTextInstance?: CursorTextClass;

  public isRunSegment: boolean; // 是否进行算法预算

  public runPrediction: TRunPrediction; // 分割方法

  constructor(props: ISegmentByRectProps) {
    super(props);
    this.isRunSegment = false;
    this.runPrediction = props.runPrediction;
  }

  public setRunPrediction(runPrediction: TRunPrediction) {
    this.runPrediction = runPrediction;
  }

  public eventBinding() {
    document.addEventListener('keydown', (e) => this.onKeydown(e));
    super.eventBinding();
  }

  public onKeydown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case EKeyCode.Esc:
        e.preventDefault();
        e.stopPropagation();
        this.clearPredictionInfo();
        break;

      case EKeyCode.Z:
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          this.rectList = [];
          this.render();
        }
        break;
      default:
        break;
    }
  }

  public clearPredictionInfo() {
    this.rectList = [];
    this.isShowCursor = false; // 开启光标
    this.coord = { x: -1, y: -1 };
    this.drawingRect = undefined;
    this.isRunSegment = false;
    this.cursorTextInstance?.clearTextDOM();
    this.cursorTextInstance = undefined;
    this.clearCanvas();
    this.render();
  }

  public onMouseUp(e: MouseEvent) {
    if (this.isRunSegment) {
      return;
    }

    // 进行分割操作
    if (e.button === 0 && this.rectList.length === 1 && !this.isRunSegment) {
      e.stopPropagation();
      this.segmentPrediction(e);
      this.clearActiveStatus();
      return;
    }

    super.onMouseUp(e);

    return undefined;
  }

  public onMouseDown(e: MouseEvent) {
    if (this.isRunSegment) {
      return;
    }
    super.onMouseDown(e);
    return undefined;
  }

  public renderCursorLine() {
    if (!this.ctx) {
      return;
    }

    const { ctx } = this;
    const padding = 10; // 框的边界
    const lineWidth = 1;
    const { x, y } = this.coord;
    const currentColor = this.getLineColor(this.defaultAttribute);
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.setLineDash([6]);
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x - padding, y - padding, padding * 2, padding * 2);
    ctx.restore();
    this.renderCursorText();
    super.renderCursorLine(currentColor);
  }

  public renderDrawingRect(rect: IRect, zoom: number, isZoom = false) {
    if (this.ctx && rect) {
      const transformRect = AxisUtils.changeRectByZoom(rect, isZoom ? zoom : this.zoom, this.currentPos);
      const { x, y, width, height } = transformRect;
      const currentZoom = zoom ?? this.zoom ?? 1;
      this.ctx.save();
      this.ctx.lineCap = 'butt';

      const borderWidth = this.style.strokeWidth;
      const dashWidth = 10;

      this.ctx.lineWidth = borderWidth;

      this.ctx.strokeStyle = 'white';
      this.ctx.setLineDash([]);
      this.ctx.strokeRect(x, y, width, height); // 白底

      this.ctx.strokeStyle = this.getLineColor(this.defaultAttribute);
      this.ctx.setLineDash([dashWidth * currentZoom]);
      this.ctx.strokeRect(x, y, width, height); // 线段

      this.ctx.restore();
    }
  }

  public cursorText() {
    // 提示编写
    let text = `① ${i18n.t('FramingOfObjectToBeDivided')}`;
    if (this.rectList?.length === 1) {
      text = `② ${i18n.t('ClickOnTarget')}`;
    }
    if (this.isRunSegment) {
      text = i18n.t('SplittingAlgorithmPrediction');
    }
    return text;
  }

  public renderTextAttribute() {}

  public renderSelectedRect() {}

  public segmentPrediction = async (e: MouseEvent) => {
    const coord = this.getCoordinateInOrigin(e); // Use the origin coordinate.
    this.isRunSegment = true;
    this.render();

    if (!this.runPrediction) {
      this.emit('messageError', 'You needs to set runPrediction function');
      this.clearPredictionInfo();
      return;
    }

    await this.runPrediction({
      point: coord,
      rect: {
        x: this.rectList[0].x,
        y: this.rectList[0].y,
        w: this.rectList[0].width,
        h: this.rectList[0].height,
      },
    });
    this.clearPredictionInfo();
  };

  public renderCursorText() {
    if (this.coord.x < 0 || this.coord.y < 0) {
      this.cursorTextInstance?.clearTextDOM();
      this.cursorTextInstance = undefined;
      return;
    }

    if (!this.cursorTextInstance) {
      this.cursorTextInstance = new CursorTextClass({
        container: this.container,
      });
    }

    const offset = {
      left: this.coord.x,
      top: this.coord.y,
    };

    this.cursorTextInstance.update(offset, this.getLineColor(this.defaultAttribute), this.cursorText());
  }
}
export default SegmentByRect;
