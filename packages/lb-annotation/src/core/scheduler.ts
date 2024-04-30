/**
 * @file For multi-level management of tools
 * @createDate 2022-07-27
 * @author Ron <ron.f.luo@gmail.com>
 */

import { getConfig, styleDefaultConfig } from '@/constant/defaultConfig';
import { EToolName, THybridToolName } from '@/constant/tool';
import { getCurrentOperation } from '@/utils/tool/EnhanceCommonToolUtils';
import { CoordinateUtils } from '@/utils/tool/AxisUtils';
import BasicLayer from '@/core/basicLayer';
import { IPolygonData } from '@/types/tool/polygon';
import { RectOperation } from './toolOperation/rectOperation';
import PolygonOperation from './toolOperation/polygonOperation';
import { BasicToolOperation } from './toolOperation/basicToolOperation';
import SegmentByRect from './toolOperation/segmentByRect';
import { ICommonProps } from './index';

interface IToolSchedulerOperation {}

interface IToolSchedulerProps extends ICommonProps {
  container: HTMLElement;
  size: ISize;
  toolName: THybridToolName;
  imgNode?: HTMLImageElement; // 展示图片的内容
  config?: string; // 任务配置
  style?: any;
  proxyMode?: boolean;
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

  private toolOperationNameList: Array<EToolName> = [];

  private size: ISize;

  private config: string; // 定义 TODO！！

  private style: any; // 定义 TODO！！

  private imgNode?: HTMLImageElement;

  private proxyMode?: boolean;

  private coordUtils?: CoordinateUtils;

  constructor(props: IToolSchedulerProps) {
    this.container = props.container;
    this.size = props.size;
    this.imgNode = props.imgNode;
    this.config = props.config ?? JSON.stringify(getConfig(HybridToolUtils.getTopToolName(props.toolName))); // 设置默认操作
    this.style = props.style ?? styleDefaultConfig; // 设置默认操作
    this.proxyMode = props.proxyMode;
    this.coordUtils = props.coordUtils;
    this.onWheel = this.onWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.init();
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

  public setZoom(zoom: number) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setZoom(zoom);
    });
  }

  public setCurrentPos(currentPos: ICoordinate) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setCurrentPos(currentPos);
    });
  }

  public setBasicImgInfo(basicImgInfo: any) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setBasicImgInfo(basicImgInfo);
    });
  }

  public setImgAttribute(imgAttribute: IImageAttribute) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setImgAttribute(imgAttribute);
    });
  }

  public setBasicInstance(basicInstance: BasicLayer) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setBasicInstance(basicInstance);
    });
  }

  public setDependName(dependToolName?: EToolName) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setDependName(dependToolName);
    });
  }

  public setBasicResult(basicResult?: IRect | IPolygonData) {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.setBasicResult(basicResult);
    });
  }

  public syncAllAttributeListInConfig(attributeList: any[]) {
    this.toolOperationList.forEach((toolInstance) => {
      const newConfig = {
        ...toolInstance.config,
        attributeList,
      };
      toolInstance.setConfig(JSON.stringify(newConfig));
    });
  }

  public setSize(size: ISize) {
    // Update the outside Dom Size.
    if (size.width && size.height) {
      this.toolOperationDom.forEach((dom) => {
        dom.style.width = `${size.width}px`;
        dom.style.height = `${size.height}px`;
      });
    }
    // Update the ToolInstance Canvas Size.
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
      zoom: 1,
      currentPos: {
        x: 0,
        y: 0,
      },
      basicImgInfo: {
        width: imgNode?.width ?? 0,
        height: imgNode?.height ?? 0,
        valid: true,
        rotate: 0,
      },
      coordUtils: this.coordUtils,
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

    /**
     * Disabled tool internal history event while init by scheduler
     * Should use history which managed outside
     */
    toolInstance.historyDisabled = true;

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
    this.toolOperationNameList.push(tool);
    this.toolOperationDom.push(dom);

    return toolInstance;
  }

  /**
   * Just to switch last two canvas
   * @returns
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
   * Notice & TODO. Temporary Resolution
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

  /**
   * Switch to canvas by given toolName
   * TODO: change operationList to operationMap
   */
  public switchToCanvas(toolName: EToolName) {
    const chosenIndex = this.toolOperationNameList.indexOf(toolName);
    if (chosenIndex < 0 || this.toolOperationList.length < 1 || chosenIndex > this.toolOperationDom.length - 1) {
      return;
    }
    const lastOneIndex = this.toolOperationDom.length - 1;
    const chosenDom = this.toolOperationDom[chosenIndex];
    const lastOneDom = this.toolOperationDom[lastOneIndex];

    if (!chosenDom || !lastOneDom) {
      return;
    }

    const temp = lastOneDom.style.zIndex;
    lastOneDom.style.zIndex = `${chosenDom.style.zIndex}`;
    chosenDom.style.zIndex = `${temp}`;

    // The original top-level operation clears the data
    this.toolOperationList[lastOneIndex].clearActiveStatus?.();
    this.toolOperationList[lastOneIndex].clearCursorLine?.();
    this.toolOperationList[lastOneIndex].render();

    // swap
    this.toolOperationList = arraySwap(this.toolOperationList, lastOneIndex, chosenIndex);
    this.toolOperationDom = arraySwap(this.toolOperationDom, lastOneIndex, chosenIndex);
    this.toolOperationNameList = arraySwap(this.toolOperationNameList, lastOneIndex, chosenIndex);

    return this.toolOperationList[lastOneIndex];
  }

  /**
   *
   * @param toolName
   * @param result
   * Update result by give toolName
   * All the operation instances are maintained in toolOperationList,
   * there is no more specific instance like pointCloud2dOperation you can reach,
   * so if you need to update result in specific operation instance, you can try this.
   */
  public updateDataByToolName(toolName: EToolName, result: any) {
    const operationIndex = this.toolOperationNameList.indexOf(toolName);
    if (operationIndex >= 0) {
      const operationInstance = this.toolOperationList[operationIndex];
      operationInstance.setResult(result);
    }
  }

  public clearStatusAndResult() {
    this.toolOperationList.forEach((toolInstance) => {
      toolInstance.clearActiveStatus?.();
      toolInstance.clearResult();
    });
  }

  public destroyAllLayer() {
    this.toolOperationList.forEach((toolInstance) => {
      // use destroy instead of destroyCanvas to delete textAttribute layer
      toolInstance.destroy();
      this.init();
    });
  }

  public init() {
    this.toolOperationList = [];
    this.toolOperationDom = [];
    this.eventBinding();
  }

  public destroy() {
    this.destroyAllLayer();
    this.eventUnBinding();
  }

  public eventBinding() {
    // this event will be touched when the remark layer blocks the onWheel events in specific operations, otherwise it will be blocked by the onWheel events inside
    // for now it will only be called in pointcloud top view
    if (this.proxyMode) {
      this.container.addEventListener('wheel', this.onWheel);
      this.container.addEventListener('mousedown', this.onMouseDown);
      this.container.addEventListener('mousemove', this.onMouseMove);
      this.container.addEventListener('mouseup', this.onMouseUp);
    }
  }

  public eventUnBinding() {
    if (this.proxyMode) {
      this.container.removeEventListener('wheel', this.onWheel);
      this.container.removeEventListener('mousedown', this.onMouseDown);
      this.container.removeEventListener('mousemove', this.onMouseMove);
      this.container.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  public onWheel(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.toolOperationList.length !== 0) {
      const lastOneIndex = this.toolOperationDom.length - 1;
      // the last one operation is the active one
      this.toolOperationList[lastOneIndex].onWheel(e);
    }
  }

  public onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.toolOperationList.length !== 0) {
      const lastOneIndex = this.toolOperationDom.length - 1;
      this.toolOperationList[lastOneIndex].onMouseDown(e);
    }
  }

  public onMouseMove(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.toolOperationList.length !== 0) {
      const lastOneIndex = this.toolOperationDom.length - 1;
      this.toolOperationList[lastOneIndex].onMouseMove(e);
    }
  }

  public onMouseUp(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.toolOperationList.length !== 0) {
      const lastOneIndex = this.toolOperationDom.length - 1;
      this.toolOperationList[lastOneIndex].onMouseUp(e);
    }
  }

  /**
   * Get current tool name of toolInstance
   */
  public getCurrentToolName() {
    return this.toolOperationNameList[this.toolOperationNameList.length - 1];
  }
}
