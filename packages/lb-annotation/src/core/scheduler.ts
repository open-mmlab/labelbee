/**
 * @file For multi-level management of tools
 * @createDate 2022-07-27
 * @author Ron <ron.f.luo@gmail.com>
 */

import { getConfig, styleDefaultConfig } from '@/constant/defaultConfig';
import { EToolName } from '@/constant/tool';
import { getCurrentOperation } from '@/utils/tool/EnhanceCommonToolUtils';
import { RectOperation } from './toolOperation/rectOperation';
import PolygonOperation from './toolOperation/polygonOperation';
import { BasicToolOperation } from './toolOperation/basicToolOperation';
import SegmentByRect from './toolOperation/segmentByRect';

export type THybridToolName = EToolName | Array<EToolName>;

interface IToolSchedulerOperation {}

interface IToolSchedulerProps {
  container: HTMLElement;
  size: ISize;
  toolName: THybridToolName;
  imgNode?: HTMLImageElement; // 展示图片的内容
  config?: string; // 任务配置
  style?: any;
}

/**
 * Create Empty Image by Canvas
 * @param size
 * @returns
 */
const createEmptyImage = (size: { width: number; height: number }) => {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size.width, size.height);
    return canvas.toDataURL();
  }
  return '';
};

const arraySwap = (array: any[], index1: number, index2: number) => {
  const a = array[index1];
  array[index1] = array[index2];
  array[index2] = a;
  return array;
};

export class HybridToolUtils {
  public static isSingleTool(toolName: THybridToolName) {
    return !this.isHybridTool(toolName);
  }

  public static isHybridTool(toolName: THybridToolName) {
    return Array.isArray(toolName);
  }

  public static getTopToolName = (toolName: THybridToolName) => {
    return (this.isHybridTool(toolName) ? toolName[toolName.length - 1] : toolName) as EToolName;
  };
}

export class ToolScheduler implements IToolSchedulerOperation {
  private container: HTMLElement;

  private toolOperationList: Array<RectOperation | PolygonOperation | SegmentByRect> = [];

  private toolOperationDom: Array<HTMLElement> = [];

  private size: ISize;

  private config: string; // 定义 TODO！！

  private style: any; // 定义 TODO！！

  private imgNode?: HTMLImageElement;

  constructor(props: IToolSchedulerProps) {
    this.init();

    this.container = props.container;
    this.size = props.size;
    this.imgNode = props.imgNode;
    this.config = props.config ?? JSON.stringify(getConfig(HybridToolUtils.getTopToolName(props.toolName))); // 设置默认操作
    this.style = props.style ?? styleDefaultConfig; // 设置默认操作
  }

  public setImgNode(
    imgNode: HTMLImageElement,
    basicImgInfo?: Partial<{
      valid: boolean;
      rotate: number;
    }>,
  ) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setImgNode(imgNode, basicImgInfo);
    });
  }

  public setImgAttribute(imgAttribute: IImageAttribute) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setImgAttribute(imgAttribute);
    });
  }

  public setSize(size: ISize) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setSize(size);
    });
  }

  public syncPosition(currentPos: ICoordinate, zoom: number, imgInfo: ISize, currentToolInstance: any) {
    this.toolOperationList.forEach((toolInstance) => {
      if (currentToolInstance === toolInstance) {
        return;
      }
      toolInstance.setCurrentPos(currentPos);
      toolInstance.setZoom(zoom);
      toolInstance.setImgInfo(imgInfo);
      toolInstance.renderBasicCanvas();
      toolInstance.render();
    });
  }

  public get defaultSize() {
    return {
      width: this.imgNode?.width || this.size.width,
      height: this.imgNode?.height || this.size.height,
    };
  }

  public createDom() {
    const { width, height } = this.defaultSize;
    const dom = window.document.createElement('div');
    dom.style.position = 'absolute';
    dom.style.left = '0';
    dom.style.top = '0';
    dom.style.width = `${width}px`;
    dom.style.height = `${height}px`;
    const zIndex = this.toolOperationList.length + 1;
    dom.style.zIndex = `${zIndex}`;

    return dom;
  }

  public getEmptyImage(width: number, height: number) {
    const imgSrc = createEmptyImage({ width, height });
    const emptyImgNode = new Image();
    emptyImgNode.src = imgSrc;
    return emptyImgNode;
  }

  /**
   * Unified creation of toolInstance
   * @param tool
   * @param imgNode
   * @param config
   * @returns
   */
  public createOperation(tool?: EToolName, imgNode?: HTMLImageElement, config?: Object) {
    const { width, height } = this.defaultSize;
    const dom = this.createDom();
    const emptyImgNode = this.getEmptyImage(width, height);

    const defaultData = {
      container: dom,
      size: this.size,
      config: this?.config ?? '{}',
      drawOutSideTarget: false,
      style: this.style,
      imgNode: imgNode || emptyImgNode,
      hiddenImg: !!tool,
    };
    if (config) {
      Object.assign(defaultData, config);
    }

    let toolInstance: any;
    if (!tool) {
      toolInstance = new BasicToolOperation(defaultData);
      dom.style.zIndex = '0';
      toolInstance.init();
    } else {
      const ToolOperation: any = getCurrentOperation(tool);
      if (!ToolOperation) {
        return;
      }
      toolInstance = new ToolOperation(defaultData);
    }

    toolInstance?.init();
    toolInstance.canvas.id = tool ?? 'basicCanvas';

    // Drag and Zoom sync to each canvas.
    toolInstance.on(
      'dragMove',
      ({ currentPos, zoom, imgInfo }: { currentPos: ICoordinate; zoom: number; imgInfo: ISize }) => {
        this.syncPosition(currentPos, zoom, imgInfo, toolInstance);
      },
    );
    toolInstance.on('renderZoom', (zoom: number, currentPos: ICoordinate, imgInfo: ISize) => {
      if (zoom && currentPos) {
        this.syncPosition(currentPos, zoom, imgInfo, toolInstance);
      }
    });

    // Dom Injection
    if (!tool) {
      this.container.insertBefore(dom, this.container.childNodes[0]);

      // First Level
      this.toolOperationList.unshift(toolInstance);
      this.toolOperationDom.unshift(dom);

      return toolInstance;
    }
    this.container.appendChild(dom);

    this.toolOperationList.push(toolInstance);
    this.toolOperationDom.push(dom);

    return toolInstance;
  }

  /**
   * Notice & TODO. Temporary additions
   * Just to switch last two canvas。
   *
   * It will be deleted later.
   */
  public switchLastTwoCanvas() {
    if (this.toolOperationDom.length < 3) {
      console.error('switchLastTwoCanvas is just used the layer which has 3 canvas');
      return;
    }

    const len = this.toolOperationDom.length;
    const lastOneIndex = len - 1;
    const last2SecondIndex = len - 2;

    const lastOneDom = this.toolOperationDom[lastOneIndex];
    const last2SecondDom = this.toolOperationDom[last2SecondIndex];

    if (!last2SecondDom || !lastOneDom) {
      return;
    }

    lastOneDom.style.zIndex = `${lastOneIndex - 1}`;
    last2SecondDom.style.zIndex = `${lastOneIndex}`;

    // The original top-level operation clears the data
    this.toolOperationList[lastOneIndex].clearActiveStatus();
    this.toolOperationList[lastOneIndex].clearCursorLine();
    this.toolOperationList[lastOneIndex].render();

    // swap
    this.toolOperationList = arraySwap(this.toolOperationList, lastOneIndex, last2SecondIndex);
    this.toolOperationDom = arraySwap(this.toolOperationDom, lastOneIndex, last2SecondIndex);

    return this.toolOperationList[lastOneIndex];
  }

  /**
   * Notice & TODO. Temporary additions
   * Just to set data to toolInstance.
   * @returns
   */
  public getFirstToolOperation() {
    if (this.toolOperationList.length > 1) {
      // Multi Layer
      return this.toolOperationList[1];
    }

    return this.toolOperationList[0];
  }

  public destroyAllLayer() {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.destroyCanvas();
      this.init();
    });
  }

  public init() {
    this.toolOperationList = [];
    this.toolOperationDom = [];
  }
}
