/**
 * AnnotationEngine 标注引擎 - 各类标注工具管理
 */

import { EToolName } from '@/constant/tool';
import { getConfig } from '@/constant/defaultConfig';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import { IBasicToolOperationProps } from './toolOperation/basicToolOperation';

interface IProps extends IBasicToolOperationProps {
  toolName: EToolName;
}

export default class AnnotationEngine {
  public toolInstance: any; // 用于存储当前工具实例

  public toolName: EToolName;

  private container: HTMLDivElement; // 当前结构绑定 container

  private size: ISize;

  private config: string; // 定义 TODO！！

  private style: any; // 定义 TODO！！

  private imgNode?: HTMLImageElement;

  constructor(props: IProps) {
    this.container = props.container;
    this.size = props.size;
    this.toolName = props.toolName;
    this.config = props.config;
    this.imgNode = props.imgNode;
    this.style = props.style;
    this._initToolOperation();
  }

  /**
   * 同步各种基础类型信息
   * 1. imgNode （TODO，后续是否将 imgNode 放置在内部管理）
   * 2. size
   * 3. config
   * 4. style
   */

  /**
   * 设置当前工具类型
   * @param toolName
   * @param config
   */
  public setToolName(toolName: EToolName, config?: string) {
    this.toolName = toolName;
    const defaultConfig = config || getConfig(toolName); // 防止用户没有注入配置
    this.config = JSON.stringify(defaultConfig);
    this._initToolOperation();
  }

  public setImgNode(imgNode: HTMLImageElement) {
    if (!this.toolInstance) {
      return;
    }
    this.imgNode = imgNode;
    this.toolInstance.setImgNode(imgNode);
  }

  public setSize(size: ISize) {
    this.size = size;
  }

  public setStyle(style: any) {
    this.style = style;
  }

  /**
   * 初始化工具实例
   * @returns
   */
  private _initToolOperation() {
    if (this.toolInstance) {
      this.toolInstance.destroy();
    }

    const ToolOperation: any = CommonToolUtils.getCurrentOperation(this.toolName);
    if (!ToolOperation) {
      return;
    }

    const defaultData = {
      container: this.container,
      size: this.size,
      config: this.config,
      drawOutSideTarget: false,
      style: this.style,
    };

    /**
     * 存储上层
     */
    if (this.imgNode) {
      Object.assign(defaultData, { imgNode: this.imgNode });
    }

    this.toolInstance = new ToolOperation(defaultData);
    this.toolInstance.init();
  }
}
