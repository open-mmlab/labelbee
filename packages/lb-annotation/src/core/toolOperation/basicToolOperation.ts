import { IBasicText, ImgPosUtils, i18n, toolStyleConverter } from '@labelbee/lb-utils';
import { isNumber } from 'lodash';
import { EOperationMode, EToolName } from '@/constant/tool';
import { IPolygonConfig, IPolygonData } from '@/types/tool/polygon';
import MathUtils from '@/utils/MathUtils';
import AxisUtils, { CoordinateUtils } from '@/utils/tool/AxisUtils';
import CanvasUtils from '@/utils/tool/CanvasUtils';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import LineToolUtils from '@/utils/tool/LineToolUtils';
import { EDragStatus, EGrowthMode, ELang } from '../../constant/annotation';
import EKeyCode from '../../constant/keyCode';
import { BASE_ICON, styleString } from '../../constant/style';
import locale from '../../locales';
import { EMessage } from '../../locales/constants';
import ActionsHistory from '../../utils/ActionsHistory';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import DblClickEventListener from '../../utils/tool/DblClickEventListener';
import DrawUtils from '../../utils/tool/DrawUtils';
import RenderDomUtils from '../../utils/tool/RenderDomUtils';
import ZoomUtils from '../../utils/tool/ZoomUtils';
import EventListener from './eventListener';

const LANGUAGE_MAP = {
  [ELang.Zh]: 'cn',
  [ELang.US]: 'en',
};

interface IBasicToolOperationProps {
  container: HTMLElement;
  size: ISize;
  imgNode?: HTMLImageElement; // 展示图片的内容
  staticMode?: boolean; // 是否为静态模式
  style?: any; // 后期一定要补上!!

  rotate?: number;
  imgAttribute?: any; // 占个坑，用于全局的一些配置，是否展示原图比例
  forbidOperation?: boolean;

  config?: string; // 任务配置

  defaultAttribute?: string;
  forbidCursorLine?: boolean;
  showDefaultCursor?: boolean; // 默认会展示为 none

  forbidBasicResultRender?: boolean;

  isAppend?: boolean; // 用于 canvas 层次的关闭
  hiddenImg?: boolean; // 隐藏图片渲染

  zoomInfo?: {
    min: number;
    max: number;
    ratio: number;
  };
  language?: ELang;
}

/**
 * 参考显示数据
 */
interface IReferenceData {
  toolName: EToolName.Polygon | EToolName.Line | EToolName.LineMarker;
  result: IPolygonData[] | ILinePoint[];
  config: any;
}

// zoom 的限制
const DEFAULT_ZOOM_INFO = {
  min: 0.2,
  max: 1000,
  ratio: 0.4,
};

class BasicToolOperation extends EventListener {
  public container: HTMLElement; // 当前结构绑定 container

  public canvas!: HTMLCanvasElement;

  public basicCanvas!: HTMLCanvasElement;

  public imgNode?: HTMLImageElement;

  public staticImgNode?: HTMLImageElement;

  public basicImgInfo: any; // 用于存储当前图片的信息

  public isImgError: boolean; // 图片是否错误

  // 数据依赖
  public basicResult?: any; // 可能存在含有 dependToolName 但是不含有 basicResult 的情况

  public referenceData?: IReferenceData;

  public dependToolName?: EToolName;

  // 工具记录
  public history: ActionsHistory; // 存储当前任务下的所有记录

  public size: ISize;

  public isShowCursor: boolean; // 是否展示十字光标

  public forbidOperation: boolean; // 禁止操作

  public forbidBasicResultRender: boolean; // 禁止渲染基础依赖图形

  // public style: {
  //   strokeColor: string;
  //   fillColor: string;
  //   strokeWidth: number;
  //   opacity: number;
  // };
  public style: any;

  public zoom: number;

  // 用于拖拽缩放操作
  public currentPos: ICoordinate; // 存储实时偏移的位置

  public coord: ICoordinate; // 存储当前鼠标的坐标

  public imgInfo?: ISize;

  public isDrag = false; // 判断是否进行拖拽

  public isSpaceKey = false; // 是否点击空格键

  public staticMode = false; // 以静态截图模式渲染

  public attributeLockList: string[]; // 属性限制列表

  public dblClickListener: DblClickEventListener;

  public isHidden: boolean;

  public config: any; // 供后面操作使用

  public dragStatus: EDragStatus; // 用于拖拽中间状态的判断

  public defaultAttribute: string; // 默认属性

  public forbidCursorLine: boolean;

  public lang: ELang;

  public dataInjectionAtCreation?: TDataInjectionAtCreateion;

  public renderEnhance?: IRenderEnhance;

  public customRenderStyle?: (
    data: IRect | IPolygonData | IPoint | ILine | ITagResult | IBasicText,
  ) => IAnnotationStyle;

  public operationMode: EOperationMode = EOperationMode.General;

  // 拖拽 - 私有变量
  private _firstClickCoordinate?: ICoordinate; // 存储第一次点击的坐标

  private innerZoom = 1; // 用于内外 zoom 事件的变量，缓存 zoom 变换前的数据

  private currentPosStorage?: ICoordinate; // 存储当前点击的平移位置

  private basicZoom = 0.01; // 限定最少放大倍数

  private isSpaceClick = false; // 用于空格拖拽

  private isDragStart = false; // 用于拖拽情况的初始判定

  private startTime = 0; // 开始时间

  private _ctx?: CanvasRenderingContext2D;

  private _imgAttribute?: IImageAttribute;

  private _invalidDOM?: HTMLElement;

  private showDefaultCursor: boolean; // 是否展示默认的 cursor

  private hiddenImg: boolean;

  public coordUtils: CoordinateUtils;

  public zoomInfo = DEFAULT_ZOOM_INFO;

  public offscreenCanvas!: HTMLCanvasElement;

  constructor(props: IBasicToolOperationProps) {
    super();
    this.container = props.container;
    this.config = CommonToolUtils.jsonParser(props.config);
    this.showDefaultCursor = props.showDefaultCursor || false;

    this.destroyCanvas();
    this.createCanvas(props.size, props.isAppend);
    this.imgNode = props.imgNode;
    this.staticMode = props.staticMode ?? false;
    this.isImgError = !props.imgNode;
    this.basicImgInfo = {
      width: props.imgNode?.width ?? 0,
      height: props.imgNode?.height ?? 0,
      valid: true,
      rotate: 0,
    };
    this.forbidOperation = props.forbidOperation ?? false;
    this.forbidBasicResultRender = props.forbidBasicResultRender ?? false;

    this.size = props.size;
    this.currentPos = {
      x: 0,
      y: 0,
    };
    this.zoom = 1;
    this.coord = {
      x: -1,
      y: -1,
    };
    this.currentPosStorage = {
      x: 0,
      y: 0,
    };
    this.isShowCursor = false;
    this.attributeLockList = [];
    this.history = new ActionsHistory();
    this.style = props.style ?? CommonToolUtils.jsonParser(styleString);
    this._imgAttribute = props.imgAttribute ?? {};
    this.isHidden = false;
    this.dragStatus = EDragStatus.Wait;
    this.defaultAttribute = props?.defaultAttribute ?? '';
    this.forbidCursorLine = !!props.forbidCursorLine;
    this.lang = props?.language ?? ELang.Zh;
    i18n.changeLanguage(LANGUAGE_MAP[this.lang]);
    // 阻止右键菜单栏
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onLeftDblClick = this.onLeftDblClick.bind(this);
    this.onRightDblClick = this.onRightDblClick.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
    this.clearImgDrag = this.clearImgDrag.bind(this);

    // 初始化监听事件
    this.dblClickListener = new DblClickEventListener(this.container, 200);
    this.coordUtils = new CoordinateUtils(this);
    this.coordUtils.setBasicImgInfo(this.basicImgInfo);

    this.hiddenImg = props.hiddenImg || false;

    if (props.zoomInfo) {
      this.zoomInfo = props.zoomInfo;
    }
  }

  public onContextmenu(e: MouseEvent) {
    e.preventDefault();
  }

  get ctx() {
    return this._ctx || this.canvas?.getContext('2d');
  }

  get basicCtx() {
    return this.basicCanvas?.getContext('2d');
  }

  get offscreenCtx() {
    return this.offscreenCanvas?.getContext('2d');
  }

  get rotate() {
    return this.basicImgInfo?.rotate ?? 0;
  }

  get valid() {
    return this.basicImgInfo?.valid ?? true;
  }

  get baseIcon() {
    // this.style.color 获取当前的颜色的位置的  1 3 5 7 9
    return BASE_ICON[this.style.color];
  }

  get defaultCursor(): string {
    return this.showDefaultCursor ? 'default' : 'none';
  }

  /** 数据列表，根据其判断是否可以旋转 */
  get dataList(): any[] {
    return [];
  }

  get innerPosAndZoom() {
    return {
      innerZoom: this.innerZoom,
      currentPosStorage: this.currentPosStorage,
    };
  }

  get isShowDefaultCursor() {
    return this.showDefaultCursor;
  }

  public get isMultiMoveMode() {
    return this.operationMode === EOperationMode.MultiMove;
  }

  /**
   * 是否含有列表标注
   */
  public get hasMarkerConfig() {
    return this.config.markerConfigurable === true && this.config.markerList && this.config.markerList.length > 0;
  }

  public setZoom(zoom: number) {
    this.zoom = zoom;
    this.innerZoom = zoom;
    this.coordUtils.setZoomAndCurrentPos(this.zoom, this.currentPos);
  }

  public setCurrentPos(currentPos: ICoordinate) {
    this.currentPos = currentPos;
    this.coordUtils.setZoomAndCurrentPos(this.zoom, this.currentPos);
  }

  public setReferenceData(referenceData: IReferenceData) {
    this.referenceData = referenceData;
  }

  public setImgInfo(size: ISize) {
    this.imgInfo = size;
  }

  public setCurrentPosStorage(currentPosStorage: ICoordinate) {
    this.currentPosStorage = currentPosStorage;
  }

  public setOperationMode(operationMode: EOperationMode) {
    this.operationMode = operationMode;
  }

  public recoverOperationMode() {
    if (this.operationMode === EOperationMode.MultiMove) {
      this.setOperationMode(EOperationMode.General);
    }
  }

  /**
   * 外界直接更改当前渲染位置
   * @param zoom
   * @param currentPos
   */
  public updatePosition(params: { zoom: number; currentPos: ICoordinate }) {
    const { zoom, currentPos } = params;

    // 内部位置初始化
    this.setZoom(zoom);
    this.setCurrentPos(currentPos);
    this.currentPosStorage = currentPos;

    this.renderBasicCanvas();
    this.render();
  }

  public setLang(lang: ELang) {
    this.lang = lang;
    const i18nLanguage = LANGUAGE_MAP[lang];
    i18n.changeLanguage(i18nLanguage);
  }

  public setShowDefaultCursor(showDefaultCursor: boolean) {
    this.showDefaultCursor = showDefaultCursor;
    this.container.style.cursor = this.defaultCursor;
  }

  public setCustomCursor(cursor: string) {
    this.container.style.cursor = cursor;
  }

  // 是否限制鼠标操作
  public get forbidMouseOperation() {
    return this.forbidOperation || this.valid === false;
  }

  public get pixelRatio() {
    return CanvasUtils.getPixelRatio(this.canvas?.getContext('2d'));
  }

  public init() {
    this.eventUnbinding();
    this.initPosition();
    this.eventBinding();
    this.render();
    this.renderBasicCanvas();
  }

  public destroy() {
    this.destroyCanvas();
    this.eventUnbinding();
  }

  public updateCanvasBasicStyle(canvas: HTMLCanvasElement, size: ISize, zIndex: number) {
    const pixel = this.pixelRatio;
    canvas.style.position = 'absolute';
    canvas.width = size.width * pixel;
    canvas.height = size.height * pixel;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = `${zIndex} `;
  }

  public createCanvas(size: ISize, isAppend = true) {
    // TODO 后续需要将 canvas 抽离出来，迭代器叠加
    const pixel = this.pixelRatio;

    const basicCanvas = document.createElement('canvas');
    this.updateCanvasBasicStyle(basicCanvas, size, 0);

    this.basicCanvas = basicCanvas;

    const canvas = document.createElement('canvas');
    this.updateCanvasBasicStyle(canvas, size, 10);

    const offscreenCanvas = document.createElement('canvas');
    this.updateCanvasBasicStyle(offscreenCanvas, size, 20);

    // set Attribute
    // this.container.style.position = 'relative';

    if (isAppend) {
      if (this.container.hasChildNodes()) {
        this.container.insertBefore(offscreenCanvas, this.container.childNodes[0]);
        this.container.insertBefore(canvas, this.container.childNodes[0]);
        this.container.insertBefore(basicCanvas, this.container.childNodes[0]);
      } else {
        this.container.appendChild(basicCanvas);
        this.container.appendChild(canvas);
        this.container.appendChild(offscreenCanvas);
      }
    }
    this.offscreenCanvas = offscreenCanvas;
    this.canvas = canvas;
    this.container.style.cursor = this.defaultCursor;
    this.ctx?.scale(pixel, pixel);
    this.basicCtx?.scale(pixel, pixel);
    this.offscreenCtx?.scale(pixel, pixel);
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  public destroyCanvas() {
    if (this.canvas && this.container.contains(this.canvas)) {
      // container 内可能包含其他元素，故需单独清楚
      this.container.removeChild(this.canvas);
    }

    if (this.basicCanvas && this.container.contains(this.basicCanvas)) {
      this.container.removeChild(this.basicCanvas);
    }

    if (this.offscreenCanvas && this.container.contains(this.offscreenCanvas)) {
      this.container.removeChild(this.offscreenCanvas);
    }

    // 恢复初始状态
    this.clearInvalidPage();
    this.clearImgDrag();
  }

  /**
   * 设置框的样式
   * @param lineWidth
   * @param strokeColor
   */
  public setStyle(toolStyle: any) {
    this.style = toolStyle;
    this.render();
  }

  /**
   * Notice. It needs to set the default imgInfo. Because it will needs to create info when it doesn't have
   * @param imgNode
   * @param basicImgInfo
   */
  public setImgNode(imgNode: HTMLImageElement, basicImgInfo: Partial<{ valid: boolean; rotate: number }> = {}) {
    this.imgNode = imgNode;

    this.setBasicImgInfo({
      width: imgNode.width,
      height: imgNode.height,
      valid: true,
      rotate: 0,
      ...basicImgInfo,
    });

    this.updateZoomInfo();

    if (this.isImgError === true) {
      this.isImgError = false;
      this.emit('changeAnnotationShow');
    }

    if (typeof basicImgInfo.valid === 'boolean') {
      this.setValid(basicImgInfo.valid);
    }

    this.initImgPos();
    this.render();
    this.renderBasicCanvas();
  }

  /**
   * Update the zoomInfo when Image or Size updated.
   */
  public updateZoomInfo(imgNode = this.imgNode, size = this.size) {
    if (!imgNode || !size) {
      return;
    }

    const { min } = ImgPosUtils.getMinZoomByImgAndSize({
      canvasSize: size,
      imgSize: { width: imgNode.width, height: imgNode.height },
      rotate: this.rotate,
      zoomRatio: this._imgAttribute?.zoomRatio,
    });

    this.zoomInfo = {
      ...this.zoomInfo,
      min,
    };
  }

  public setErrorImg() {
    const originIsImgError = this.isImgError;
    // 设置当前为错误图片
    this.isImgError = true;
    this.imgNode = undefined;

    this.setBasicImgInfo({
      width: 0,
      height: 0,
      valid: true,
      rotate: 0,
    });

    if (originIsImgError === false) {
      this.emit('changeAnnotationShow');
    }
  }

  public setBasicImgInfo(basicImgInfo: any) {
    this.basicImgInfo = basicImgInfo;
    this.coordUtils.setBasicImgInfo(basicImgInfo);
  }

  public setForbidOperation(forbidOperation: boolean) {
    this.forbidOperation = forbidOperation;
    this.setShowDefaultCursor(forbidOperation);
    this.render();
  }

  public setForbidCursorLine(forbidCursorLine: boolean) {
    this.forbidCursorLine = forbidCursorLine;
    this.render();
  }

  public setIsHidden(isHidden: boolean) {
    this.isHidden = isHidden;

    this.emit('hiddenChange');
  }

  public setDefaultAttribute(attribute: string) {
    this.defaultAttribute = attribute;
  }

  public getCoordinateInOrigin(e: MouseEvent) {
    const bounding = this.canvas.getBoundingClientRect();

    return {
      x: (e.clientX - bounding.left - this.currentPos.x) / this.zoom,
      y: (e.clientY - bounding.top - this.currentPos.y) / this.zoom,
    };
  }

  /**
   * Get the textIconSvg by attribute.
   * @param attribute
   */
  public getTextIconSvg(attribute = '') {
    return AttributeUtils.getTextIconSvg(
      attribute,
      this.config?.attributeList,
      this.config.attributeConfigurable,
      this.baseIcon,
    );
  }

  /**
   * 用于外界直接控制序号的是否展示
   * @param isShowOrder
   */
  public setIsShowOrder(isShowOrder: boolean) {
    this.config.isShowOrder = isShowOrder;
    this.render();
  }

  /** 获取坐标值 */
  public getCoordinate(e: MouseEvent) {
    const bounding = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - bounding.left,
      y: e.clientY - bounding.top,
    };
  }

  /** 获取当前zoom 下的坐标 */
  public getCoordinateUnderZoom(e: MouseEvent) {
    const bounding = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - bounding.left - this.currentPos.x,
      y: e.clientY - bounding.top - this.currentPos.y,
    };
  }

  /**
   * Get the coordinate based on zoom and rotate
   *
   *
   * @param e
   * @returns
   */
  public getCoordinateUnderZoomByRotate(e: MouseEvent) {
    const { x, y } = this.getCoordinateUnderZoom(e);

    if (this.basicImgInfo.rotate === 90) {
      return {
        x: y,
        y: this.basicImgInfo.height * this.zoom - x,
      };
    }

    if (this.basicImgInfo.rotate === 180) {
      return {
        x: this.basicImgInfo.width * this.zoom - x,
        y: this.basicImgInfo.height * this.zoom - y,
      };
    }

    if (this.basicImgInfo.rotate === 270) {
      return {
        x: this.basicImgInfo.width * this.zoom - y,
        y: x,
      };
    }

    return {
      x,
      y,
    };
  }

  /**
   * Get the coordinates of the outer canvas by scaling the coordinates of the relative image under rotation
   */
  public getCoordinateUnderZoomByRotateFromImgPoint(point: ICoordinate) {
    const { x, y } = point;
    if (this.basicImgInfo.rotate === 90) {
      return {
        x: (this.basicImgInfo.height - y) * this.zoom + this.currentPos.x,
        y: x * this.zoom + this.currentPos.y,
      };
    }

    if (this.basicImgInfo.rotate === 180) {
      return {
        x: (this.basicImgInfo.width - x) * this.zoom + this.currentPos.x,
        y: (this.basicImgInfo.height - y) * this.zoom + this.currentPos.y,
      };
    }

    if (this.basicImgInfo.rotate === 270) {
      return {
        x: y * this.zoom + this.currentPos.x,
        y: (this.basicImgInfo.width - x) * this.zoom + this.currentPos.y,
      };
    }

    return {
      x: x * this.zoom + this.currentPos.x,
      y: y * this.zoom + this.currentPos.y,
    };
  }

  public getGetCenterCoordinate() {
    return {
      x: this.size.width / 2,
      y: this.size.height / 2,
    };
  }

  /** 用于初始化图片的位置 */
  public initImgPos = async () => {
    if (!this.imgNode) {
      return;
    }
    const zoomRatio = this._imgAttribute?.zoomRatio;
    const isOriginalSize = this._imgAttribute?.isOriginalSize;
    const { currentPos, imgInfo, zoom } = ImgPosUtils.getInitImgPos(
      this.size,
      { width: this.imgNode.width, height: this.imgNode.height },
      this.rotate,
      zoomRatio,
      isOriginalSize,
    );

    this.setCurrentPos(currentPos);

    this.currentPosStorage = currentPos;
    this.setImgInfo(imgInfo);
    this.setZoom(zoom);
    this.render();
    this.renderBasicCanvas();

    this.emit('dependRender');

    this.emit('renderZoom', zoom, currentPos, imgInfo);
  };

  /**
   * 用于依赖情况下的图片初始化
   */
  public initPosition() {
    if (this.basicResult && this.imgInfo) {
      // 目的： 初始化有依赖情况下的多框展示
      const { basicResult, size, imgNode, _imgAttribute, imgInfo, dependToolName } = this;
      if (basicResult && imgNode && dependToolName) {
        let newBoundry = basicResult;

        switch (dependToolName) {
          case EToolName.Polygon:
          case EToolName.Line: {
            // 依赖检测
            if (basicResult.pointList) {
              // 多边形检测
              const basicZone = MathUtils.calcViewportBoundaries(basicResult.pointList);
              newBoundry = {
                x: basicZone.left,
                y: basicZone.top,
                width: basicZone.right - basicZone.left,
                height: basicZone.bottom - basicZone.top,
              };
            }
            break;
          }

          default: {
            //
          }
        }

        const pos = ImgPosUtils.getBasicRecPos(
          imgNode,
          newBoundry,
          size,
          undefined,
          _imgAttribute?.zoomRatio,
          _imgAttribute?.isOriginalSize,
        );
        if (pos) {
          this.setCurrentPos(pos.currentPos);
          this.currentPosStorage = this.currentPos;
          this.setImgInfo({
            ...imgInfo,
            width: (imgInfo.width / this.innerZoom) * pos.innerZoom,
            height: (imgInfo.height / this.innerZoom) * pos.innerZoom,
          });

          // 需要加载下更改当前的 imgInfo
          this.setZoom(pos.innerZoom);

          this.render();
          this.renderBasicCanvas();
        }
      }
    } else {
      this.initImgPos();
    }
  }

  public getCurrentPos = (coord: any) => {
    const { _firstClickCoordinate, currentPosStorage } = this;
    try {
      let currentPos;
      if (_firstClickCoordinate && currentPosStorage) {
        currentPos = {
          y: currentPosStorage.y + coord.y - _firstClickCoordinate.y,
          x: currentPosStorage.x + coord.x - _firstClickCoordinate.x,
        };
      } else {
        currentPos = {
          x: 0,
          y: 0,
        };
      }
      return currentPos;
    } catch (e) {
      console.error(e);
      return {
        x: 0,
        y: 0,
      };
    }
  };

  /** 撤销 */
  public undo() {
    this.history.undo();
  }

  /** 重做 */
  public redo() {
    this.history.redo();
  }

  public clearCanvas() {
    this.ctx?.clearRect(0, 0, this.size.width, this.size.height);
  }

  public clearBasicCanvas() {
    this.basicCtx?.clearRect(0, 0, this.size.width, this.size.height);
  }

  public clearOffscreenCanvas() {
    this.offscreenCtx?.clearRect(0, 0, this.size.width, this.size.height);
  }

  /** 事件绑定 */
  public eventBinding() {
    this.dblClickListener.addEvent(() => {}, this.onLeftDblClick, this.onRightDblClick);
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseleave', this.onMouseLeave);
    this.container.addEventListener('click', this.onClick);
    this.container.addEventListener('wheel', this.onWheel);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.parent.document.addEventListener('contextmenu', this.onContextmenu, false);
  }

  public eventUnbinding() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
    this.container.removeEventListener('wheel', this.onWheel);
    this.container.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    window.parent.document.removeEventListener('contextmenu', this.onContextmenu, false);

    this.dblClickListener.removeEvent();
  }

  public clearImgDrag() {
    this.isDrag = false;
    this.isDragStart = false;
    this.isSpaceClick = false;
    this.startTime = 0;
    this.container.style.cursor = this.defaultCursor;
    this.forbidCursorLine = false;
  }

  public clearCursorLine() {
    this.coord = {
      x: -1,
      y: -1,
    };
  }

  public onMouseDown(e: MouseEvent): void | boolean {
    // e.stopPropagation();
    if (!this.canvas || this.isImgError) {
      return true;
    }

    const coord = this.getCoordinate(e);

    if ((this.isSpaceKey && e.button === 0) || e.button === 2) {
      e.stopPropagation();
      this._firstClickCoordinate = coord;
      this.currentPosStorage = this.currentPos;
      this.isSpaceClick = true;
      this.isDragStart = true;
      this.startTime = new Date().getTime();
    }
  }

  public onMouseMove(e: MouseEvent, isRender: boolean = true): boolean | void {
    if (!this.canvas || this.isImgError) {
      return true;
    }

    const coord = this.getCoordinate(e);

    // 是否展示十字光标
    if (this.isShowCursor) {
      this.coord = coord;
    }

    try {
      if (!coord || !isNumber(coord?.x) || !isNumber(coord?.y)) {
        throw new Error('coord error');
      }

      this.coord = coord;
      if ((this.isSpaceClick || this.isDragStart) && this._firstClickCoordinate) {
        const currentPos = this.getCurrentPos(coord);
        this.setCurrentPos(currentPos);
        this.isDrag = true;
        this.container.style.cursor = 'grabbing';
        this.forbidCursorLine = true;
        this.renderBasicCanvas();

        // 依赖渲染触发
        this.emit('dependRender');

        // 拖拽信息触发
        this.emit('dragMove', { currentPos, zoom: this.zoom, imgInfo: this.imgInfo });
      }
      if (isRender) {
        this.render();
      }
    } catch (error) {
      console.error(error);
    }
  }

  public onMouseUp(e: MouseEvent): boolean | void {
    if (!this.canvas || this.isImgError) {
      return true;
    }
    this.container.style.cursor = this.defaultCursor;
    this.forbidCursorLine = false;

    this.isDrag = false;
    this.isDragStart = false;
    this.isSpaceClick = false;
    if (this.startTime !== 0 && this._firstClickCoordinate) {
      const time = new Date().getTime();
      const currentCoord = this.getCoordinate(e);

      /**
       * 图片拖拽判断
       * 1. 拖拽时间超过 1 秒则为拖拽
       * 2. 开启了 space 键为拖拽
       * 3. 鼠标移动 10 像素
       */
      if (
        time - this.startTime > 1000 ||
        this.isSpaceKey === true ||
        LineToolUtils.calcTwoPointDistance(currentCoord, this._firstClickCoordinate) > 10
      ) {
        e.stopPropagation();
        this.startTime = 0;
        this.render();
        return true;
      }
    }

    this.startTime = 0;

    if (e.button === 2) {
      this.onRightClick(e);
    }
    this.render();
  }

  // 后续需抽象成 abstract
  public onMouseLeave() {
    //  鼠标脱离了屏幕
    // 清除拖拽状态
    this.clearImgDrag();
  }

  // eslint-disable-next-line no-unused-vars
  public onClick(e: MouseEvent) {}

  // eslint-disable-next-line no-unused-vars
  public onRightClick(e: MouseEvent) {}

  // eslint-disable-next-line no-unused-vars
  public onLeftDblClick(e: MouseEvent) {
    // 左键双击
  }

  // eslint-disable-next-line no-unused-vars
  public onRightDblClick(e: MouseEvent) {
    // 右键双击
    this.clearImgDrag();
  }

  public onKeyDown(e: KeyboardEvent): boolean | void {
    /** 取消window系统下默认的失焦和全选事件 */
    if (e.keyCode === EKeyCode.Alt || e.keyCode === EKeyCode.A) {
      e.preventDefault();
    }

    // empty
    switch (e.keyCode) {
      case EKeyCode.Space:
        this.isSpaceKey = true;
        e.preventDefault();
        break;

      case EKeyCode.Z:
        if (e.ctrlKey) {
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }

          return false;
        }
        break;

      default: {
        break;
      }
      // case EKeyCode.F11:
      //   if (!document.fullscreenElement) {
      //     document.documentElement.requestFullscreen();
      //   } else {
      //     if (document.exitFullscreen) {
      //       document.exitFullscreen();
      //     }
      //   }
      //   e.preventDefault();

      //   break;
    }
    return true;
  }

  public onKeyUp(e: KeyboardEvent): boolean | void {
    // empty
    switch (e.keyCode) {
      case EKeyCode.Space:
        this.isSpaceKey = false;
        break;

      default: {
        break;
      }
    }
  }

  /**
   * 导出自定义数据
   * @returns
   */
  public exportCustomData() {
    return {};
  }

  // 按鼠标位置放大缩小
  public onWheel(e: any, isRender = true): boolean | void {
    if (!this.imgNode || !this.coord) {
      return;
    }

    // 禁止外层滚轮操作
    e.preventDefault();
    e.stopPropagation();

    const coord = this.getCoordinate(e);

    const delta = e.deltaY || e.wheelDelta;

    let operator: 0 | -1 | 1 = 0;

    if (delta > 0 && this.zoom > this.zoomInfo.min) {
      // 减小
      operator = -1;
    }
    if (delta < 0 && this.zoom < this.zoomInfo.max) {
      // 放大
      operator = 1;
    }
    this.wheelChangePos(coord, operator);
    this.emit('dependRender');
    if (isRender) {
      this.render();
    }
    this.renderBasicCanvas();
  }

  public wheelChangePos = (coord: ICoordinate, operator: 1 | -1 | 0, newZoom?: number) => {
    // 更改放大后图片的位置以及倍数, operator: 1 放大， -1 缩小， 0 放大
    const { currentPos, imgNode } = this;
    if (!imgNode) {
      console.error('unable to load image');
      return;
    }
    if (this.zoom === this.basicZoom && operator === -1) {
      return;
    }

    const pos = ZoomUtils.wheelChangePos(imgNode, coord, operator, currentPos, {
      zoom: newZoom || this.zoom,
      innerZoom: this.innerZoom,
      basicZoom: this.basicZoom,
      zoomMax: this.zoomInfo.max,
      rotate: this.rotate,
    });

    if (!pos) {
      return;
    }

    const { currentPos: newCurrentPos, ratio, zoom, imgInfo } = pos;
    this.setZoom(zoom);
    this.setCurrentPos(newCurrentPos);
    this.currentPosStorage = newCurrentPos;
    this.setImgInfo(imgInfo);

    this.zoomInfo.ratio = ratio;

    this.emit('renderZoom', zoom, newCurrentPos, imgInfo);
  };

  /**
   * 通过ZOOM_LEVEL, 计算出下一个缩放的值。
   * @param isZoomIn 是否为放大
   */
  public zoomChanged = (isZoomIn: boolean, growthMode = EGrowthMode.Linear) => {
    const newZoom = ZoomUtils.zoomChanged(this.zoom, isZoomIn, growthMode);
    this.wheelChangePos(this.getGetCenterCoordinate(), newZoom > this.zoom ? 1 : -1, newZoom);
    this.render();
    this.renderBasicCanvas();
  };

  /**
   *  Update by center.
   *
   * @param newZoom
   */
  public zoomChangeOnCenter = (newZoom: number) => {
    this.wheelChangePos(this.getGetCenterCoordinate(), 0, newZoom);
    this.render();
    this.renderBasicCanvas();
  };

  public renderCursorLine(lineColor = this.style.lineColor[0] ?? '') {
    if (!this.ctx || this.forbidCursorLine || this.forbidOperation) {
      return;
    }

    const { x, y } = this.coord;
    DrawUtils.drawLine(this.canvas, { x: 0, y }, { x: 10000, y }, { color: lineColor });
    DrawUtils.drawLine(this.canvas, { x, y: 0 }, { x, y: 10000 }, { color: lineColor });
    DrawUtils.drawCircleWithFill(this.canvas, { x, y }, 1, { color: 'white' });
  }

  public drawStraightLine = (
    points: ICoordinate[],
    config: {
      color: string;
      lineWidth: number;
      globalAlpha: number;
    },
  ) => {
    const { ctx } = this;
    if (ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = config.color;
      ctx.lineWidth = config.lineWidth;
      ctx.globalAlpha = config.globalAlpha;
      points.forEach((point, index) => {
        ctx.beginPath();
        if (index > 0) {
          const prePoint = points[index - 1];
          ctx.save();
          ctx.moveTo(prePoint.x, prePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          ctx.restore();
        }
      });
      ctx.restore();
    }
  };

  public drawImg = () => {
    if (!this.imgNode || this.hiddenImg === true) return;

    DrawUtils.drawImg(this.basicCanvas, this.imgNode, {
      zoom: this.zoom,
      currentPos: this.currentPos,
      rotate: this.rotate,
      imgAttribute: this._imgAttribute,
    });
    this.drawStaticImg();
  };

  public drawStaticImg = () => {
    if (!this.staticImgNode || !this.staticMode) return;

    this.clearCanvas();
    DrawUtils.drawImg(this.canvas, this.staticImgNode, {
      zoom: this.zoom,
      currentPos: this.currentPos,
      rotate: this.rotate,
      imgAttribute: this._imgAttribute,
    });
  };

  /**
   * 更改当前 canvas 整体的大小，需要重新初始化
   * @param size
   */
  public setSize(size: ISize) {
    this.size = size;
    this.updateZoomInfo();
    if (this.container.contains(this.canvas)) {
      this.destroyCanvas();
      this.createCanvas(size);
      this.eventUnbinding();
      this.init();

      if (this.basicImgInfo?.valid === false) {
        this.renderInvalidPage();
      }
    }
  }

  public setImgAttribute(imgAttribute: IImageAttribute) {
    const oldImgAttribute = this._imgAttribute;
    this._imgAttribute = imgAttribute;
    if (
      oldImgAttribute?.zoomRatio !== imgAttribute.zoomRatio ||
      oldImgAttribute.isOriginalSize !== imgAttribute.isOriginalSize
    ) {
      this.initImgPos();
      return;
    }
    this.renderBasicCanvas();
    this.render();
  }

  public clearResult(sendMessage?: boolean | string) {
    // 清除数据
    if (sendMessage) {
      // send someting
    }
  }

  public setValid(valid: boolean) {
    this.basicImgInfo.valid = valid;
    if (valid === false) {
      this.renderInvalidPage();
      this.clearResult(false);
    } else {
      this.clearInvalidPage();
    }
  }

  public setRotate(rotate: number) {
    this.basicImgInfo.rotate = rotate;
  }

  public setBasicResult(basicResult: any) {
    this.basicResult = basicResult;
    this.coordUtils.setBasicResult(basicResult);
    this.initPosition();
    this.emit('dependRender');
  }

  public setDependName(dependToolName: EToolName, dependToolConfig?: IRectConfig | IPolygonConfig) {
    this.dependToolName = dependToolName;
    this.coordUtils.setDependInfo(dependToolName, dependToolConfig);
  }

  public filterCacheContext() {}

  public setAttributeLockList(attributeLockList: string[]) {
    this.attributeLockList = attributeLockList;
    this.filterCacheContext();
    this.render();
  }

  public setConfig(config: string) {
    this.config = CommonToolUtils.jsonParser(config);
  }

  public setDataInjectionAtCreation(dataInjectionAtCreation: TDataInjectionAtCreateion) {
    this.dataInjectionAtCreation = dataInjectionAtCreation;
  }

  public setRenderEnhance(renderEnhance: IRenderEnhance) {
    this.renderEnhance = renderEnhance;
  }

  public setCustomRenderStyle(
    customRenderStyle: (data: IRect | IPolygonData | IPoint | ILine | ITagResult | IBasicText) => IAnnotationStyle,
  ) {
    this.customRenderStyle = customRenderStyle;
  }

  /**
   * 进行图片旋转操作
   * @returns
   */
  public updateRotate() {
    // 依赖情况下禁止旋转
    if (this.dependToolName) {
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.NoRotateInDependence, this.lang));
      return false;
    }

    // 有数据情况下禁止旋转
    if (this.dataList.length > 0) {
      this.emit('messageInfo', locale.getMessagesByLocale(EMessage.NoRotateNotice, this.lang));
      return false;
    }

    // 更改当前图片的旋转方式
    const rotate = MathUtils.getRotate(this.basicImgInfo.rotate);
    this.basicImgInfo.rotate = rotate;
    this.initImgPos();

    // 触发外层 result 的更改
    this.emit('updateResult');
  }

  /** Get the current property color */
  public getColor(attribute = '', config = this.config) {
    return toolStyleConverter.getColorByConfig({ attribute, config, style: this.style });
  }

  public getLineColor(attribute = '') {
    if (this.config?.attributeConfigurable === true) {
      const attributeIndex = AttributeUtils.getAttributeIndex(attribute, this.config?.attributeList ?? []) + 1;
      const color = this.config?.attributeList?.find((i: any) => i.value === attribute)?.color;
      if (color) {
        return toolStyleConverter.getColorByConfig({ attribute, config: this.config })?.valid?.stroke;
      }
      return this.style.attributeLineColor ? this.style.attributeLineColor[attributeIndex] : '';
    }
    const { color, lineColor } = this.style;
    if (color && lineColor) {
      return lineColor[color];
    }
    return '';
  }

  public clearInvalidPage() {
    if (this._invalidDOM && this.container && this.container.contains(this._invalidDOM)) {
      this.container.removeChild(this._invalidDOM);
      this._invalidDOM = undefined;
    }
  }

  public renderInvalidPage() {
    if (!this.container || this._invalidDOM) {
      return;
    }

    this._invalidDOM = RenderDomUtils.renderInvalidPage(this.container, this.size, this.lang);
  }

  public renderBasicCanvas() {
    if (!this.basicCanvas) {
      return;
    }

    this.clearBasicCanvas();
    this.drawImg();

    const thickness = 3;

    if (this.forbidBasicResultRender) {
      return;
    }

    if (this.basicResult && this.dependToolName) {
      switch (this.dependToolName) {
        case EToolName.Rect: {
          DrawUtils.drawRect(
            this.basicCanvas,
            AxisUtils.changeRectByZoom(this.basicResult, this.zoom, this.currentPos),
            {
              color: 'rgba(204,204,204,1.00)',
              thickness,
            },
          );
          break;
        }

        case EToolName.Polygon: {
          DrawUtils.drawPolygonWithFillAndLine(
            this.basicCanvas,
            AxisUtils.changePointListByZoom(this.basicResult.pointList, this.zoom, this.currentPos),
            {
              fillColor: 'transparent',
              strokeColor: 'rgba(204,204,204,1.00)',
              isClose: true,
              thickness,
            },
          );

          break;
        }

        case EToolName.Line: {
          DrawUtils.drawLineWithPointList(
            this.basicCanvas,
            AxisUtils.changePointListByZoom(this.basicResult.pointList, this.zoom, this.currentPos),
            {
              color: 'rgba(204,204,204,1.00)',
              thickness,
            },
          );

          break;
        }

        default: {
          //
        }
      }
    }
  }

  public render() {
    if (!this.canvas || !this.ctx || !this.imgNode) {
      return;
    }
    this.clearCanvas();
  }

  // 触发外界 style 的样式
  public changeStyle(newAttribute = this.defaultAttribute) {
    this.emit('changeStyle', { attribute: newAttribute });
  }
}

export { IBasicToolOperationProps, BasicToolOperation };
