import { ImgConversionUtils, ToolStyleUtils } from '@labelbee/lb-utils';
import AxisUtils from '@/utils/tool/AxisUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import { EScribblePattern, EToolName } from '@/constant/tool';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import AttributeUtils from '@/utils/tool/AttributeUtils';
import EKeyCode from '@/constant/keyCode';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';

interface IProps extends IBasicToolOperationProps {}

const DEFAULT_PEN_SIZE = 20;
const DEFAULT_COLOR = 'white';

class ScribbleTool extends BasicToolOperation {
  public toolName = EToolName.ScribbleTool;

  public defaultAttributeInfo?: IInputList;

  public config!: IScribbleConfig;

  public isHidden: boolean;

  private action = EScribblePattern.Scribble;

  private cacheCanvas?: HTMLCanvasElement;

  private cacheContext?: CanvasRenderingContext2D;

  private preCacheCanvas?: HTMLCanvasElement; // view

  private preCacheContext?: CanvasRenderingContext2D; // view

  private renderCacheContext?: CanvasRenderingContext2D; // Temporary canvas for handling jagged fills

  private penSize;

  private startPoint?: ICoordinate; // Origin Coordinate

  private prePoint?: ICoordinate; // preview Coordinate

  private pointList: ICoordinate[]; // line Coordinate

  private curIndexOnLine: number; // Location for connection state undo and redo record pointList

  private lineActive?: boolean; // line active

  constructor(props: IProps) {
    super(props);

    this.penSize = DEFAULT_PEN_SIZE;

    this.isHidden = false;
    this.pointList = [];
    this.curIndexOnLine = 0;

    // Init defaultAttributeInfo
    if (this.config.attributeList?.length > 0) {
      const firstAttributeInfo = this.config.attributeList[0];
      this.setDefaultAttribute(firstAttributeInfo.value);
    }
  }

  public get cursorErase() {
    const svgIcon = `<?xml version="1.0" encoding="UTF-8"?><svg width="24" heighst="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#icon-65e7e1747c11bad3)"><path d="M44.7818 24.1702L31.918 7.09935L14.1348 20.5L27.5 37L30.8556 34.6643L44.7818 24.1702Z" fill="#141414" stroke="#000000" stroke-width="4" stroke-linejoin="miter"/><path d="M27.4998 37L23.6613 40.0748L13.0978 40.074L10.4973 36.6231L4.06543 28.0876L14.4998 20.2248" stroke="#000000" stroke-width="4" stroke-linejoin="miter"/><path d="M13.2056 40.072L44.5653 40.072" stroke="#000000" stroke-width="4" stroke-linecap="round"/></g><defs><clipPath id="icon-65e7e1747c11bad3"><rect width="48" height="48" fill="#df4c4c"/></clipPath></defs></svg>`;
    const iconUrl = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgIcon)))}`;
    return `url(${iconUrl}) 0 0, auto`;
  }

  public get defaultCursor() {
    if (this.action === EScribblePattern.Erase) {
      return this.cursorErase;
    }

    return this.isShowDefaultCursor ? 'default' : 'none';
  }

  public get color() {
    return this?.defaultAttributeInfo?.color ?? DEFAULT_COLOR;
  }

  public get penSizeWithZoom() {
    return this.penSize / this.zoom;
  }

  public get cacheCanvasToDataUrl() {
    return this.cacheCanvas?.toDataURL('image/png', 0);
  }

  public getOriginCoordinate = (e: MouseEvent) => {
    return AxisUtils.changePointByZoom(this.getCoordinateUnderZoomByRotate(e), 1 / this.zoom);
  };

  public setPenSize(size: number) {
    this.penSize = size;
    this.render();
  }

  public initCacheCanvas(imgNode?: HTMLImageElement) {
    if (this.cacheCanvas || !imgNode) {
      return;
    }

    const { canvas, ctx } = ImgConversionUtils.createCanvas(imgNode);
    this.cacheCanvas = canvas;
    this.cacheContext = ctx;
    const { canvas: preCanvas, ctx: preCtx } = ImgConversionUtils.createCanvas(imgNode);
    this.preCacheCanvas = preCanvas;
    this.preCacheContext = preCtx;

    const { ctx: renderCtx } = ImgConversionUtils.createCanvas(imgNode);
    this.renderCacheContext = renderCtx;
  }

  public updateCacheCanvasSize(imgNode: HTMLImageElement) {
    if (this.cacheCanvas) {
      this.cacheCanvas.width = imgNode.width;
      this.cacheCanvas.height = imgNode.height;
    }
  }

  public updateUrl2CacheContext(url: string) {
    ImgConversionUtils.createImgDom(url).then((img) => {
      if (!this.cacheContext) {
        this.initCacheCanvas(img);
      }
      if (this.cacheContext) {
        this.cacheContext.save();
        this.clearCacheCanvas();
        this.cacheContext.drawImage(img, 0, 0, img.width, img.height);
        this.cacheContext.restore();
      }
      this.filterCacheContext();
      this.render();
    });
  }

  public setImgNode(imgNode: HTMLImageElement, basicImgInfo?: Partial<{ valid: boolean; rotate: number }>): void {
    super.setImgNode(imgNode, basicImgInfo);
    if (this.cacheCanvas) {
      this.updateCacheCanvasSize(imgNode);
    } else {
      this.initCacheCanvas(imgNode);
    }
  }

  public setResult(data: IScribbleData[]) {
    // Only has one layer
    let { url } = data?.[0] ?? {};

    this.clearCacheCanvas();

    // Create an Empty Page when the result is empty.
    if (!url) {
      url = this.cacheCanvasToDataUrl ?? '';
    }

    this.history.initRecord([url], true);
    if (!url) {
      this.render();
      return;
    }
    this.updateUrl2CacheContext(url);
  }

  public onKeyDown(e: KeyboardEvent): boolean | void {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      // If it is an input box, filter it
      return;
    }

    const { keyCode } = e;
    const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(keyCode, this.config.attributeList);

    if (keyCode2Attribute !== undefined) {
      this.setDefaultAttribute(keyCode2Attribute);
    }

    if (keyCode === EKeyCode.Z && !e.ctrlKey) {
      this.toggleIsHide();
    }

    if (e.ctrlKey) {
      if (this.action === EScribblePattern.Scribble) {
        this.lineActive = true;
      }
      if (keyCode === EKeyCode.Z) {
        this.lineActive = false;
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
      this.render();
    }
  }

  public onKeyUp(e: KeyboardEvent) {
    super.onKeyUp(e);

    if (e.keyCode === EKeyCode.Ctrl) {
      this.lineActive = false;
      this.pointList = [];
      this.curIndexOnLine = 0;
      this.render();
    }
  }

  public toggleIsHide() {
    this.setIsHidden(!this.isHidden);
    this.render();
  }

  public eventBinding() {
    super.eventBinding();
  }

  public onMouseDown = (e: MouseEvent) => {
    if (super.onMouseDown(e) || this.forbidMouseOperation || !this.imgInfo) {
      return undefined;
    }

    // Init Image
    this.initCacheCanvas(this.imgNode);
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

    switch (pattern) {
      case EScribblePattern.Erase: {
        this.setCustomCursor(this.cursorErase);
        break;
      }

      default: {
        this.setCustomCursor('none');
        break;
      }
    }
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
    [this.cacheContext, this.preCacheContext, this.renderCacheContext].forEach((ctx) => {
      if (ctx) {
        this.drawStartPoint(ctx, e);
      }
    });
  }

  public syncDrawCanvas({ list, operation, params }: any) {
    list.forEach((ctx: CanvasRenderingContext2D) => {
      if (ctx) {
        operation({ ctx, ...params });
      }
    });
  }

  public drawStartPoint(ctx: CanvasRenderingContext2D, e: MouseEvent) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.penSizeWithZoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const copyOriginCoordinate = this.getOriginCoordinate(e);
    ctx.moveTo(copyOriginCoordinate.x, copyOriginCoordinate.y);
    this.startPoint = copyOriginCoordinate;
  }

  public drawLine({ ctx, prePoint, point }: any) {
    ctx.beginPath();
    ctx.save();
    ctx.moveTo(prePoint.x, prePoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.restore();
  }

  public drawLineTo({ ctx, point }: any) {
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  // Draw lines on the image
  public scribbleOnImgByLine(endPoint: ICoordinate) {
    const ctx = this.cacheContext;
    const preCtx = this.preCacheContext;
    const renderCtx = this.renderCacheContext;

    if (!ctx || !renderCtx || !preCtx) {
      return;
    }
    this.pointList = this.pointList.slice(0, this.curIndexOnLine + 1);
    this.pointList.push(endPoint);

    if (this.pointList.length > 1) {
      this.curIndexOnLine = this.pointList.length - 1;
      this.pointList.forEach((point, index) => {
        if (index > 0) {
          const prePoint = this.pointList[index - 1];
          this.syncDrawCanvas({
            list: [ctx, preCtx, renderCtx],
            operation: this.drawLine,
            params: { prePoint, point },
          });
        }
      });
    }
  }

  public onScribbleMove(e: MouseEvent) {
    const originCoordinate = this.getOriginCoordinate(e);
    if (this.lineActive) {
      this.prePoint = originCoordinate;
      return;
    }

    if (e.buttons === 1 && this.cacheContext && this.startPoint) {
      // this.cacheContext.lineTo(e.offsetX, e.offsetY);
      this.syncDrawCanvas({
        list: [this.cacheContext, this.preCacheContext, this.renderCacheContext],
        operation: this.drawLineTo,
        params: { point: originCoordinate },
      });
      // this.prevAxis = { x: e.offsetX, y: e.offsetY };
    }
  }

  public onScribbleEnd(e?: MouseEvent) {
    if (!e || e?.button === 2) {
      return;
    }
    const originCoordinate = this.getOriginCoordinate(e);
    if (this.lineActive) {
      this.scribbleOnImgByLine(originCoordinate);
    } else if (this.cacheContext && this.renderCacheContext) {
      this.syncDrawCanvas({
        list: [this.cacheContext, this.renderCacheContext],
        operation: this.drawLineTo,
        params: { point: originCoordinate },
      });
    }
    this.saveUrlIntoHistory();
  }

  // Save the url of the canvas image into History
  public saveUrlIntoHistory() {
    this.cacheContext?.closePath();
    this.cacheContext?.restore();
    this.startPoint = undefined;
    this.fillPixelSawtooth();
    this.history.pushHistory(this.cacheCanvasToDataUrl);
    this.filterCacheContext();
  }

  public fillPixelSawtooth(isErase?: boolean) {
    if (this.cacheContext && this.renderCacheContext) {
      const canvasW = this.cacheContext.canvas.width;
      const canvasH = this.cacheContext.canvas.height;
      const imgData = this.renderCacheContext?.getImageData(0, 0, canvasW, canvasH);
      const colorArr = ToolStyleUtils.toRGBAArr(this.color || '') || [];
      const colorR = ~~colorArr[0];
      const colorG = ~~colorArr[1];
      const colorB = ~~colorArr[2];
      for (let y = 0; y < imgData.height; y++) {
        for (let x = 0; x < imgData.width; x++) {
          const index = (y * imgData.width + x) * 4;
          const r = imgData.data[index];
          const g = imgData.data[index + 1];
          const b = imgData.data[index + 2];
          if (r !== 0 || g !== 0 || b !== 0) {
            if (isErase) {
              this.cacheContext.clearRect(x, y, 1, 1);
            } else {
              // Use the fillRect method to inject pixels into the target canvas
              this.cacheContext.fillStyle = `rgba(${colorR},${colorG},${colorB},${255})`;
              this.cacheContext.fillRect(x, y, 1, 1);
            }
          }
        }
      }
      this.renderCacheContext.clearRect(0, 0, this.cacheContext.canvas.width, this.cacheContext.canvas.height);
    }
  }

  public filterCacheContext() {
    if (this.attributeLockList?.length > 0 && this.cacheContext && this.preCacheContext) {
      const canvasW = this.cacheContext.canvas.width;
      const canvasH = this.cacheContext.canvas.height;
      const imgData = this.cacheContext?.getImageData(0, 0, canvasW, canvasH);

      const attribute = this.config.attributeList.filter((t) => !this.attributeLockList.includes(t.value));
      const attributes = attribute.map((t) => ToolStyleUtils.toRGBAArr(t?.color || '') || []);

      if (imgData) {
        for (let j = 0; j < attributes.length; j++) {
          for (let i = 0; i < imgData.data.length / 4; i++) {
            const index = i * 4;
            const r = imgData.data[index];
            const g = imgData.data[index + 1];
            const b = imgData.data[index + 2];
            // If it is originBackgroundRGBA. It needs to update to backgroundRGBA
            const colorArr = attributes[j] || [];
            const isSame = ~~colorArr[0] === r && ~~colorArr[1] === g && ~~colorArr[2] === b;
            if (isSame) {
              imgData.data[index] = 0;
              imgData.data[index + 1] = 0;
              imgData.data[index + 2] = 0;
              imgData.data[index + 3] = 0;
            }
          }
        }

        this.preCacheContext?.putImageData(imgData, 0, 0);
      }
    }
  }

  public eraseArc(e: MouseEvent) {
    if (this.cacheContext) {
      const originCoordinate = this.getOriginCoordinate(e);
      this.cacheContext.save();
      this.cacheContext.beginPath();
      this.cacheContext.arc(originCoordinate.x, originCoordinate.y, this.penSizeWithZoom / 2, 0, Math.PI * 2, false);
      this.cacheContext.clip();
      this.cacheContext.clearRect(0, 0, this.cacheContext.canvas.width, this.cacheContext.canvas.height);
      this.cacheContext?.restore();

      if (this.preCacheContext) {
        this.preCacheContext.save();
        this.preCacheContext.beginPath();
        this.preCacheContext.arc(
          originCoordinate.x,
          originCoordinate.y,
          this.penSizeWithZoom / 2,
          0,
          Math.PI * 2,
          false,
        );
        this.preCacheContext.clip();
        this.preCacheContext.clearRect(0, 0, this.preCacheContext.canvas.width, this.preCacheContext.canvas.height);
        this.preCacheContext?.restore();
      }
    }
  }

  public onEraseStart(e: MouseEvent) {
    if (!this.cacheContext || e.buttons !== 1 || this.isHidden) {
      return;
    }
    if (this.renderCacheContext) {
      this.drawStartPoint(this.renderCacheContext, e);
    }
    this.eraseArc(e);
  }

  public onEraseMove(e: MouseEvent) {
    if (!this.cacheContext || e.buttons !== 1 || this.isHidden) {
      return;
    }
    if (this.renderCacheContext) {
      const point = this.getOriginCoordinate(e);

      this.drawLineTo({ ctx: this.renderCacheContext, point });
    }
    this.eraseArc(e);
  }

  public onEraseEnd(e: MouseEvent) {
    if (this.renderCacheContext) {
      const point = this.getOriginCoordinate(e);
      this.drawLineTo({ ctx: this.renderCacheContext, point });
    }

    this.renderCacheContext?.closePath();
    this.renderCacheContext?.restore();
    this.startPoint = undefined;

    this.fillPixelSawtooth(true);
    this.filterCacheContext();
  }

  public exportData() {
    const imgBase64 = this.cacheCanvasToDataUrl;

    return [[], this.basicImgInfo, { imgBase64 }];
  }

  public clearCacheCanvas() {
    this.cacheContext?.clearRect(0, 0, this.cacheContext.canvas.width, this.cacheContext.canvas.height);
    this.preCacheContext?.clearRect(0, 0, this.preCacheContext.canvas.width, this.preCacheContext.canvas.height);
    this.renderCacheContext?.clearRect(
      0,
      0,
      this.renderCacheContext.canvas.width,
      this.renderCacheContext.canvas.height,
    );
    this.render();
  }

  public clearResult() {
    this.curIndexOnLine = 0;
    this.pointList = [];
    this.clearCacheCanvas();

    // Need to add a record.
    this.history.pushHistory(this.cacheCanvasToDataUrl);
  }

  public renderPoint(radius: number) {
    DrawUtils.drawCircleWithFill(this.canvas, this.coord, radius, { color: this.color });
  }

  public renderBorderPoint(radius: number) {
    DrawUtils.drawCircle(this.canvas, this.coord, radius, { color: 'black' });
  }

  // Draw line before scribbling on the image
  public drawLineSegment() {
    if (this.prePoint && this.pointList.length > 0) {
      const endPoint = this.pointList[this.curIndexOnLine];
      const points = [endPoint].concat(this.prePoint);
      const drawPoints = points.map((p: ICoordinate) => this.getCoordinateUnderZoomByRotateFromImgPoint(p));
      this.drawStraightLine(drawPoints, {
        color: this.color,
        lineWidth: this.penSize,
        globalAlpha: 0.5,
      });
    }
  }

  public render() {
    super.render();
    if (!this.ctx || !this.cacheCanvas) {
      return;
    }
    if (this.lineActive) {
      this.renderCursorLine(this.color);
      this.drawLineSegment();
    }
    const radius = this.penSize / 2;
    // Hide the drawn track
    if (this.isHidden) {
      // When in scribble mode, points need to be displayed
      if (this.action === EScribblePattern.Scribble) {
        this.renderPoint(radius);
      }
      return;
    }
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    let viewNode = this.cacheCanvas;
    if (this.attributeLockList?.length > 0 && this.preCacheCanvas) {
      viewNode = this.preCacheCanvas;
    }
    DrawUtils.drawImg(this.canvas, viewNode, {
      zoom: this.zoom,
      currentPos: this.currentPos,
      rotate: this.rotate,
    });
    this.ctx.restore();
    // Forbid Status stop render Point.
    if (this.forbidOperation || this.forbidCursorLine) {
      return;
    }

    if (this.action === EScribblePattern.Erase) {
      this.renderBorderPoint(radius);
    } else {
      this.renderPoint(radius);
    }
  }

  /** 撤销 */
  public undo() {
    if (this.lineActive && (this.curIndexOnLine < 1 || this.pointList?.length < 1)) {
      return;
    }

    if (this.curIndexOnLine > 0 && this.pointList?.length > 0) {
      this.curIndexOnLine -= 1;
    }
    const url = this.history.undo();
    if (url && this.cacheCanvas) {
      this.updateUrl2CacheContext(url);
    }
  }

  public redo() {
    if (this.curIndexOnLine < this.pointList?.length - 1 && this.pointList?.length > 0) {
      this.curIndexOnLine += 1;
    }
    const url = this.history.redo();

    if (url && this.cacheCanvas) {
      this.updateUrl2CacheContext(url);
    }
  }
}

export default ScribbleTool;
