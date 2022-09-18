import { ImgConversionUtils } from '@labelbee/lb-utils';
import AxisUtils from '@/utils/tool/AxisUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import { EScribblePattern, EToolName } from '@/constant/tool';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import AttributeUtils from '@/utils/tool/AttributeUtils';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';

interface IProps extends IBasicToolOperationProps {}

const DEFAULT_PEN_SIZE = 20;
const DEFAULT_COLOR = 'white';

class ScribbleTool extends BasicToolOperation {
  public toolName = EToolName.ScribbleTool;

  public defaultAttributeInfo?: IInputList;

  public config!: IScribbleConfig;

  private action = EScribblePattern.Scribble;

  private cacheCanvas?: HTMLCanvasElement;

  private cacheContext?: CanvasRenderingContext2D;

  private penSize;

  private startPoint?: ICoordinate; // Origin Coordinate

  constructor(props: IProps) {
    super(props);

    this.penSize = DEFAULT_PEN_SIZE;
  }

  public get color() {
    return this?.defaultAttributeInfo?.color ?? DEFAULT_COLOR;
  }

  public get penSizeWithZoom() {
    return this.penSize / this.zoom;
  }

  public getOriginCoordinate = (e: MouseEvent) => {
    return AxisUtils.changePointByZoom(this.getCoordinateUnderZoom(e), 1 / this.zoom);
  };

  public setPenSize(size: number) {
    this.penSize = size;
  }

  public createCacheCanvas(imgNode?: HTMLImageElement) {
    if (this.cacheCanvas || !imgNode) {
      return;
    }

    const { canvas, ctx } = ImgConversionUtils.createCanvas(imgNode);
    this.cacheCanvas = canvas;
    this.cacheContext = ctx;
  }

  public setResult(data: IScribbleData[]) {
    // Only has one layer
    const { url } = data?.[0] ?? {};

    this.clearResult();
    if (!url) {
      this.render();
      return;
    }

    ImgConversionUtils.createImgDom(url).then((img) => {
      if (!this.cacheContext) {
        this.createCacheCanvas(img);
      }
      if (this.cacheContext) {
        this.cacheContext.save();
        this.cacheContext.drawImage(img, 0, 0, img.width, img.height);
        this.cacheContext.restore();
        this.render();
      }
    });
  }

  public onKeyDown(e: KeyboardEvent): boolean | void {
    if (!CommonToolUtils.hotkeyFilter(e) || super.onKeyDown(e) === false) {
      // 如果为输入框则进行过滤
      return;
    }

    const { keyCode } = e;
    const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(keyCode, this.config.attributeList);

    if (keyCode2Attribute !== undefined) {
      this.setDefaultAttribute(keyCode2Attribute);
    }
  }

  public eventBinding() {
    super.eventBinding();
  }

  public onMouseDown = (e: MouseEvent) => {
    if (super.onMouseDown(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    // Init Image
    this.createCacheCanvas(this.imgNode);
    this.mouseEvents('onMouseDown').call(this, e);
  };

  public onMouseMove = (e: MouseEvent) => {
    if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }
    this.mouseEvents('onMouseMove').call(this, e);
  };

  public onMouseUp = (e: MouseEvent) => {
    if (super.onMouseUp(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    this.mouseEvents('onMouseUp').call(this, e);
  };

  public mouseEvents = (eventType: 'onMouseMove' | 'onMouseUp' | 'onMouseDown') => {
    const events = {
      [EScribblePattern.Scribble]: {
        onMouseMove: this.onScribbleMove,
        onMouseUp: this.onScribbleEnd,
        onMouseDown: this.onScribbleStart,
      },
      [EScribblePattern.Erase]: {
        onMouseMove: this.onEraseMove,
        onMouseUp: this.onEraseEnd,
        onMouseDown: this.onEraseStart,
      },
    };

    return events[this.action][eventType];
  };

  public setPattern = (pattern: EScribblePattern) => {
    this.action = pattern;
  };

  public setDefaultAttribute(attributeValue: string) {
    const attributeInfo = this.config.attributeList.find((v) => v.value === attributeValue);

    if (attributeInfo) {
      this.defaultAttribute = attributeInfo.value;
      this.defaultAttributeInfo = attributeInfo;
      //  触发侧边栏同步
      this.emit('changeAttributeSidebar');
      this.render();
    }
  }

  public clearStatusAfterLeave() {
    this.onScribbleEnd();
    this.startPoint = undefined;
  }

  public onMouseLeave(): void {
    super.onMouseLeave();
    this.clearStatusAfterLeave();
  }

  public onScribbleStart(e: MouseEvent) {
    if (!this.cacheContext) {
      return;
    }

    this.cacheContext.save();
    this.cacheContext.beginPath();
    this.cacheContext.strokeStyle = this.color;
    this.cacheContext.lineWidth = this.penSizeWithZoom;
    this.cacheContext.lineCap = 'round';
    this.cacheContext.lineJoin = 'round';
    const originCoordinate = AxisUtils.changePointByZoom(this.getCoordinateUnderZoom(e), 1 / this.zoom);
    this.cacheContext.moveTo(originCoordinate.x, originCoordinate.y);
    this.startPoint = originCoordinate;
  }

  public onScribbleMove(e: MouseEvent) {
    if (e.buttons === 1 && this.cacheContext && this.startPoint) {
      // this.cacheContext.lineTo(e.offsetX, e.offsetY);
      const originCoordinate = this.getOriginCoordinate(e);
      this.cacheContext.lineTo(originCoordinate.x, originCoordinate.y);
      this.cacheContext.stroke();
      // this.prevAxis = { x: e.offsetX, y: e.offsetY };
    }
  }

  public onScribbleEnd() {
    if (this.startPoint) {
      this.cacheContext?.closePath();
      this.cacheContext?.restore();
      this.startPoint = undefined;
    }
  }

  public eraseArc(e: MouseEvent) {
    if (this.cacheContext) {
      const originCoordinate = this.getOriginCoordinate(e);
      this.cacheContext.save();
      this.cacheContext.beginPath();
      this.cacheContext.arc(originCoordinate.x, originCoordinate.y, this.penSizeWithZoom / 2, 0, Math.PI * 2, false);
      this.cacheContext.clip();
      // TODO
      this.cacheContext.clearRect(0, 0, this.cacheContext.canvas.width, this.cacheContext.canvas.height);
      this.cacheContext?.restore();
    }
  }

  public onEraseStart(e: MouseEvent) {
    if (!this.cacheContext || e.buttons !== 1) {
      return;
    }
    this.eraseArc(e);
  }

  public onEraseMove(e: MouseEvent) {
    if (!this.cacheContext || e.buttons !== 1) {
      return;
    }

    this.eraseArc(e);
  }

  public onEraseEnd() {}

  public exportData() {
    const imgBase64 = this.cacheCanvas?.toDataURL('image/png', 0);

    return [[], this.basicImgInfo, { imgBase64 }];
  }

  public clearResult() {
    this.cacheContext?.clearRect(0, 0, this.cacheContext.canvas.width, this.cacheContext.canvas.height);
    this.render();
  }

  public renderPoint(radius: number) {
    DrawUtils.drawCircleWithFill(this.canvas, this.coord, radius, { color: this.color });
  }

  public render() {
    super.render();

    if (!this.ctx || !this.cacheCanvas) {
      return;
    }

    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    DrawUtils.drawImg(this.canvas, this.cacheCanvas, {
      zoom: this.zoom,
      currentPos: this.currentPos,
      rotate: this.rotate,
    });
    this.ctx.restore();

    // Forbid Status stop render Point.
    if (this.forbidOperation || this.forbidCursorLine) {
      return;
    }
    this.renderPoint(this.penSize / 2);
  }
}

export default ScribbleTool;
