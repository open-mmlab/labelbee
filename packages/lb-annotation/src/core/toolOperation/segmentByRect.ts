import { i18n } from '@labelbee/lb-utils';
import AxisUtils from '@/utils/tool/AxisUtils';
import { RectOperation } from './rectOperation';
import type { IRectOperationProps } from './rectOperation';
import EKeyCode from '../../constant/keyCode';

type TRunPrediction = (params: {
  point: ICoordinate;
  rect: { x: number; y: number; w: number; h: number };
}) => Promise<unknown>;

interface ISegmentByRectProps extends IRectOperationProps {
  runPrediction: TRunPrediction;
}

class SegmentByRect extends RectOperation {
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

  public onKeydown = (e: KeyboardEvent) => {
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
  };

  public clearPredictionInfo() {
    this.rectList = [];
    this.isShowCursor = false; // 开启光标
    this.coord = { x: -1, y: -1 };
    this.drawingRect = undefined;
    this.isRunSegment = false;
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
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.setLineDash([6]);
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x - padding, y - padding, padding * 2, padding * 2);
    ctx.restore();

    // 提示编写
    let text = `① ${i18n.t('FramingOfObjectToBeDivided')}`;
    const isEn = i18n.language === 'en';
    let rectWidth = isEn ? 326 : 186;

    if (this.rectList?.length === 1) {
      text = `② ${i18n.t('ClickOnTarget')}`;
      rectWidth = isEn ? 232 : 142;
      const radius = 2;
      ctx.save();
      ctx.strokeStyle = 'white';
      const margin = lineWidth + padding;

      ctx.beginPath();
      ctx.moveTo(x + margin + radius * 2, y + margin + radius);
      ctx.arc(x + margin + radius, y + margin + radius, radius, 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.restore();
    }

    if (this.isRunSegment) {
      // 进行算法中
      rectWidth = isEn ? 316 : 136;
      text = i18n.t('SplittingAlgorithmPrediction');
    }

    ctx.save();
    ctx.fillStyle = this.style.strokeColor;
    ctx.fillRect(x + padding, y - padding * 4 - 1, rectWidth, 32);
    ctx.restore();
    ctx.save();
    ctx.font = '14px Source Han Sans CN';
    ctx.fillStyle = 'white';
    ctx.fillText(text, x + padding + 14, y - padding * 2);
    ctx.restore();
    super.renderCursorLine();
  }

  public renderDrawingRect(rect: IRect, zoom: number, isZoom = false) {
    if (this.ctx && rect) {
      const transformRect = AxisUtils.changeRectByZoom(rect, isZoom ? zoom : this.zoom, this.currentPos);
      const { x, y, width, height } = transformRect;

      this.ctx.save();
      this.ctx.lineCap = 'butt';
      this.ctx.lineWidth = this.style.strokeWidth;

      this.ctx.strokeStyle = 'white';
      this.ctx.strokeRect(x, y, width, height); // 白底

      this.ctx.strokeStyle = this.style.strokeColor;
      this.ctx.setLineDash([6]);
      this.ctx.strokeRect(x, y, width, height); // 线段

      this.ctx.restore();
    }
  }

  public renderTextAttribute() {}

  public renderSelectedRect() {}

  public segmentPrediction = async (e: MouseEvent) => {
    const coord = this.getCoordinateUnderZoom(e);
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
}
export default SegmentByRect;
