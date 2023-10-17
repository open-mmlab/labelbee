import { ELineTypes, IPolygonData, i18n } from '@labelbee/lb-utils';
import EKeyCode from '@/constant/keyCode';
import RectUtils from '@/utils/tool/RectUtils';
import uuid from '@/utils/uuid';
import DrawUtils from '@/utils/tool/DrawUtils';
import AxisUtils from '@/utils/tool/AxisUtils';
import StyleUtils from '@/utils/tool/StyleUtils';
import ActionsHistory from '@/utils/ActionsHistory';
import SAMToolbarClass, { getSAMToolbarOffset } from './SAMToolbarClass';
import SegmentByRect, { ISegmentByRectProps } from './segmentByRect';

export interface ISegmentBySAMProps extends ISegmentByRectProps {
  onOutSide: () => void;
  // 点击完成将结果传出去由外部处理
  onFinish: (result: IPolygonData[]) => void;
}

export type ISAMCoordinate = [x: number, y: number];

class SegmentBySAM extends SegmentByRect {
  private clickType: 'add' | 'remove';

  private addPoints: ISAMCoordinate[];

  private removePoints: ISAMCoordinate[];

  private toolbarInstance?: SAMToolbarClass;

  private predictionResult: IPolygonData[];

  private SAMHistory: ActionsHistory;

  public onOutSide: () => void;

  public onFinish: (result: IPolygonData[]) => void;

  constructor(props: any) {
    super(props);
    this.clickType = 'add';
    this.addPoints = [];
    this.removePoints = [];
    this.predictionResult = [];
    this.onOutSide = props.onOutSide;
    this.onFinish = props.onFinish;
    this.SAMHistory = new ActionsHistory();
    this.clearPredictionInfo = this.clearPredictionInfo.bind(this);
    i18n.on('languageChanged', () => {
      this.toolbarInstance?.clearToolbarDOM();
      this.toolbarInstance = undefined;
      this.renderToolbar();
    });
  }

  public onKeydown(e: KeyboardEvent) {
    super.onKeydown(e);
    switch (e.keyCode) {
      case EKeyCode.Minus:
        this.toggleClickType('remove');
        break;
      case EKeyCode.Equal:
        this.toggleClickType('add');
        break;
      default:
        break;
    }
  }

  public onMouseUp(e: MouseEvent) {
    if (e.button === 0 && this.rectList?.length) {
      this.segmentPrediction(e);
      return;
    }
    super.onMouseUp(e);

    return undefined;
  }

  public setOnOutSide(onOutSide: () => void) {
    this.onOutSide = onOutSide;
  }

  public segmentPrediction = async (e: MouseEvent) => {
    if (this.isRunSegment) {
      return;
    }

    const coord = this.getCoordinateInOrigin(e);

    const isOutSide = !RectUtils.isInRect(coord, this.rectList[0], 0, 1);

    if (isOutSide) {
      this.onOutSide?.();
      return;
    }

    if (this.clickType === 'add') {
      this.addPoints.push([coord.x, coord.y]);
    }

    if (this.clickType === 'remove') {
      this.removePoints.push([coord.x, coord.y]);
    }

    this.isRunSegment = true;
    this.render();

    if (!this.runPrediction) {
      this.emit('messageError', 'You needs to set runPrediction function');
      this.clearPredictionInfo();
      return;
    }

    this.toolbarInstance?.setDisabled(true);

    try {
      const result = await this.runPrediction({
        addPoints: this.addPoints,
        removePoints: this.removePoints,
        rect: {
          x: this.rectList[0].x,
          y: this.rectList[0].y,
          w: this.rectList[0].width,
          h: this.rectList[0].height,
        },
      });

      const data = result
        ?.filter((v) => v?.pointList?.length > 2)
        .map((v: any) => ({ ...v, id: uuid(), attribute: this.defaultAttribute }));

      this.predictionResult = data;
      this.SAMHistory?.pushHistory(this.predictionResult);
    } finally {
      this.toolbarInstance?.setDisabled(false);
      this.isRunSegment = false;
    }
  };

  public onMouseDown(e: MouseEvent) {
    if (e.button === 0 && this.rectList?.length) {
      return;
    }
    super.onMouseDown(e);

    return undefined;
  }

  public drawPredictionResult() {
    const currentColor = this.getColor(this.defaultAttribute);
    this.predictionResult?.forEach((polygon) => {
      this.drawPolygon(polygon, currentColor);
    });
  }

  public drawPolygon(data: IPolygonData, currentColor: IToolColorStyle) {
    const polygon = AxisUtils.changePointListByZoom(data.pointList, this.zoom, this.currentPos);
    const style = StyleUtils.getStrokeAndFill(currentColor, true, { isHover: true });
    DrawUtils.drawPolygonWithFillAndLine(this.canvas, polygon, {
      fillColor: style.fill,
      strokeColor: style.stroke,
      thickness: this.style?.width ?? 2,
      lineType: ELineTypes.Line,
    });
  }

  public clearPredictionInfo() {
    this.addPoints = [];
    this.removePoints = [];
    this.predictionResult = [];
    this.toolbarInstance?.clearToolbarDOM();
    this.toolbarInstance = undefined;
    super.clearPredictionInfo();
    this.render();
  }

  public renderToolbar() {
    const rect = this.rectList[0];

    if (!rect) {
      return;
    }

    if (!this.toolbarInstance) {
      this.toolbarInstance = new SAMToolbarClass({
        container: this.container,
        toggleClickType: (type: 'add' | 'remove') => this.toggleClickType(type),
        finish: () => {
          this.onFinish?.(this.predictionResult ?? []);
          this.clearPredictionInfo();
        },
        reset: () => this.reset(),
        i18n,
      });
    }
    const toggleOffset = getSAMToolbarOffset({
      rect,
      zoom: this.zoom,
      currentPos: this.currentPos,
    });

    this.toolbarInstance.update(toggleOffset);
  }

  public toggleClickType(type: 'add' | 'remove') {
    this.clickType = type;
    this.toolbarInstance?.onToggle(type);
    this.render();
  }

  public reset() {
    this.addPoints = [];
    this.removePoints = [];
    this.predictionResult = [];
    this.SAMHistory?.empty();
    this.render();
  }

  public cursorText() {
    let text = `① ${i18n.t('PleaseFrameTheObjectToBeDividedFirst')}`;

    if (this.rectList?.length === 1) {
      if (this.clickType === 'add') {
        text =
          this.addPoints.length === 0
            ? `② ${i18n.t('ClickOnTheTargetObjectToSplitIt')}`
            : `② ${i18n.t('ClickTheTargetObjectAgainToIncreaseTheSegmentation')}`;
      }
      if (this.clickType === 'remove') {
        text =
          this.removePoints.length === 0
            ? `② ${i18n.t('ClickOnTheTargetObjectToDeleteTheSegmentation')}`
            : `② ${i18n.t('ClickAgainOnTheTargetObjectToDeleteTheSegmentation')}`;
      }
    }

    if (this.isRunSegment) {
      text = i18n.t('SplittingAlgorithmPrediction');
    }

    return text;
  }

  /** 撤销 */
  public undo() {
    const data = this.SAMHistory?.undo();
    this.predictionResult = data;
    this.render();
  }

  /** 重做 */
  public redo() {
    const data = this.SAMHistory?.redo();
    this.predictionResult = data;
    this.render();
  }

  public render() {
    super.render();
    if (this.rectList?.length) {
      this.renderToolbar();
      this.drawPredictionResult();
      return;
    }
    this.toolbarInstance?.clearToolbarDOM();
    this.toolbarInstance = undefined;
  }
}

export default SegmentBySAM;
