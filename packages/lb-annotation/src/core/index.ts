/**
 * AnnotationEngine 标注引擎 - 各类标注工具管理
 */

import { EToolName } from '@/constant/tool';
import { getConfig, styleDefaultConfig } from '@/constant/defaultConfig';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import { IPolygonData } from '@/types/tool/polygon';
import { ELang } from '@/constant/annotation';

interface IProps {
  container: HTMLElement;
  size: ISize;
  toolName: EToolName;
  imgNode?: HTMLImageElement; // 展示图片的内容
  config?: string; // 任务配置
  style?: any;
}

const loadImage = (imgSrc: string) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.onerror = (e) => {
      console.error(e);
      reject(img);
    };
    img.src = imgSrc;
    img.onload = () => {
      resolve(img);
    };
  });
};

export default class AnnotationEngine {
  public toolInstance: any; // 用于存储当前工具实例

  public toolName: EToolName;

  public i18nLanguage: 'en' | 'cn'; // 存储当前 i18n 初始化数据

  private container: HTMLElement; // 当前结构绑定 container

  private size: ISize;

  private config: string; // 定义 TODO！！

  private style: any; // 定义 TODO！！

  private imgNode?: HTMLImageElement;

  // 工具内依赖的记录
  private basicResult?: IRect | IPolygonData; // 用于存储当前的标注结果的依赖物体结果状态

  private dependToolName?: EToolName;

  constructor(props: IProps) {
    this.container = props.container;
    this.size = props.size;
    this.toolName = props.toolName;
    this.imgNode = props.imgNode;
    this.config = props.config ?? JSON.stringify(getConfig(props.toolName)); // 设置默认操作
    this.style = props.style ?? styleDefaultConfig; // 设置默认操作
    this.i18nLanguage = 'cn'; // 默认为中文（跟 basicOperation 内同步）
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
    const defaultConfig = config || JSON.stringify(getConfig(toolName)); // 防止用户没有注入配置
    this.config = defaultConfig;
    this._initToolOperation();
  }

  public setImgSrc = async (imgSrc: string) => {
    const imgNode = await loadImage(imgSrc);
    if (!imgNode) {
      return;
    }

    this.setImgNode(imgNode as HTMLImageElement);
  };

  public setImgNode(
    imgNode: HTMLImageElement,
    basicImgInfo?: Partial<{
      valid: boolean;
      rotate: number;
    }>,
  ) {
    if (!this.toolInstance) {
      return;
    }
    this.imgNode = imgNode;
    this.toolInstance.setImgNode(imgNode, basicImgInfo);
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

    // 实时同步语言
    this.setLang(this.i18nLanguage);
    this.toolInstance.init();
  }

  /**
   * 设置当前依赖物体渲染
   * @param dependToolName
   * @param basicResult
   */
  public setBasicInfo(dependToolName?: EToolName, basicResult?: IRect | IPolygonData) {
    this.dependToolName = dependToolName;
    this.basicResult = basicResult;

    this.toolInstance.setDependName(dependToolName);
    this.toolInstance.setBasicResult(basicResult);
    this.toolInstance.renderBasicCanvas();
  }

  /**
   * 清空当前依赖
   */
  public clearBasicResult() {
    this.setBasicInfo();
  }

  /**
   * 禁止操作
   */
  public forbidOperation() {
    this.toolInstance.setForbidOperation(true);
  }

  /**
   * 触发操作
   */
  public launchOperation() {
    this.toolInstance.setForbidOperation(false);
  }

  /**
   * 快速将 i18n 定义的国际化版本对应到当前渲染实例内
   * @param i18nLanguage
   */
  public setLang(i18nLanguage: 'en' | 'cn') {
    // 同步跟进本地数据
    this.i18nLanguage = i18nLanguage;

    switch (i18nLanguage) {
      case 'cn':
        this.toolInstance.setLang(ELang.Zh);
        break;

      case 'en':
        this.toolInstance.setLang(ELang.US);
        break;

      default: {
        //
        break;
      }
    }
  }

  /**
   * 用于创建时的数据时的数据注入
   * @param dataInjectionAtCreation
   */
  public setDataInjectionAtCreation(dataInjectionAtCreation: any) {
    this.toolInstance.setDataInjectionAtCreation(dataInjectionAtCreation);
  }

  /**
   * 数据渲染增强操作
   * @param renderEnhance
   */
  public setRenderEnhance(renderEnhance: IRenderEnhance) {
    this.toolInstance.setRenderEnhance(renderEnhance);
  }
}
