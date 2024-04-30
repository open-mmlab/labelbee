/**
 * @file render layer of basic results, should be initialized in annotationEngine
 * @Author wanghaiqing wanghaiqing@sensetime.com
 * @Date 2024-01-31
 */

import { EToolName, THybridToolName } from '@/constant/tool';
import CanvasUtils from '@/utils/tool/CanvasUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import AxisUtils, { CoordinateUtils } from '@/utils/tool/AxisUtils';
import { HybridToolUtils } from '@/core/scheduler';
import EventListener from '@/core/toolOperation/eventListener';
import { IPolygonConfig } from '@/types/tool/polygon';
import { IPolygonData, toolStyleConverter } from '@labelbee/lb-utils';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import { styleString } from '@/constant/style';
import StyleUtils from '@/utils/tool/StyleUtils';
import { ICommonProps } from './index';

type IReferenceConfig = IRectConfig | IPolygonConfig | ILineConfig | IPointToolConfig;

export interface IReferenceInfoProps {
  referenceConfig: IReferenceConfig;
  referenceResult: any;
  referenceToolName: EToolName;
}

interface IBasicLayerProps extends ICommonProps {
  container: HTMLElement;
  size: ISize;
  toolName?: THybridToolName;
  imgNode?: HTMLImageElement; // dom node of image
  config?: string; // config of annotation task
  style?: any;
  forbidBasicResultRender?: boolean;
}

export default class BasicLayer extends EventListener {
  public container: HTMLElement; // external dom node

  public config: any;

  public style: any;

  public size: ISize;

  public imgNode?: HTMLImageElement;

  public basicCanvas!: HTMLCanvasElement; // dom for basic layer

  public basicResult?: any; // data of depended tool

  public referenceInfo?: IReferenceInfoProps;

  public dependToolName?: EToolName;

  public forbidBasicResultRender: boolean; // disable rendering of basic result

  public zoom: number;

  public currentPos: ICoordinate; // store real-time offset position

  public coordUtils?: CoordinateUtils;

  public basicImgInfo: any; // store info of current image

  public imgInfo?: ISize;

  private hiddenImg: boolean;

  private _imgAttribute?: any;

  private currentPosStorage?: ICoordinate; // store the current clicked translation position

  constructor(props: IBasicLayerProps) {
    super();
    this.container = props.container;
    this.config = CommonToolUtils.jsonParser(props.config);
    this.style = props.style ?? CommonToolUtils.jsonParser(styleString);

    this.size = props.size;
    this.zoom = props.zoom ?? 1;
    this.currentPos = props.currentPos ?? { x: 0, y: 0 };
    this.basicImgInfo = props.basicImgInfo;
    this.coordUtils = props.coordUtils;
    this._imgAttribute = props.imgAttribute ?? {};

    this.imgNode = props.imgNode;
    this.hiddenImg = props.toolName ? !HybridToolUtils.isSingleTool(props.toolName) : false;
    this.forbidBasicResultRender = props.forbidBasicResultRender ?? false;

    this.destroyBasicCanvas();
    this.createBasicCanvas(props.size);
  }

  // getters
  get basicCtx() {
    return this.basicCanvas?.getContext('2d');
  }

  public get pixelRatio() {
    return CanvasUtils.getPixelRatio(this.basicCanvas?.getContext('2d'));
  }

  get rotate() {
    return this.basicImgInfo?.rotate ?? 0;
  }

  // setters
  public setZoom(zoom: number) {
    this.zoom = zoom;
  }

  public setCurrentPos(currentPos: ICoordinate) {
    this.currentPos = currentPos;
    this.currentPosStorage = currentPos;
  }

  public setBasicImgInfo(basicImgInfo: any) {
    this.basicImgInfo = basicImgInfo;
  }

  public setImgAttribute(imgAttribute: IImageAttribute) {
    this._imgAttribute = imgAttribute;
    this.renderBasicCanvas();
  }

  public setImgInfo(size?: ISize) {
    this.imgInfo = size;
  }

  public setDependName(dependToolName?: EToolName, dependToolConfig?: IRectConfig | IPolygonConfig) {
    this.dependToolName = dependToolName;
    this.coordUtils?.setDependInfo(dependToolName, dependToolConfig);
  }

  public setBasicResult(basicResult: any) {
    this.basicResult = basicResult;
    this.coordUtils?.setBasicResult(basicResult);
  }

  public setReferenceInfo(referenceInfo: IReferenceInfoProps) {
    this.referenceInfo = referenceInfo;
  }

  /**
   * Synchronize common information such as currentPos, zoom, etc
   */
  public syncCommonInfo(info: ICommonProps) {
    this.setZoom(info?.zoom ?? this.zoom);
    this.setCurrentPos(info?.currentPos ?? this.currentPos);
    this.setBasicImgInfo(info?.basicImgInfo ?? this.basicImgInfo);
    this.setImgInfo(info?.imgInfo ?? this.imgInfo);
  }

  /**
   * Resize the current canvas and reinitialize
   * @param size
   */
  public setSize(size: ISize) {
    this.size = size;
    if (this.container.contains(this.basicCanvas)) {
      this.destroyBasicCanvas();
      this.createBasicCanvas(size);
      this.renderBasicCanvas();
    }
  }

  /** Get the current property color */
  public getColor(attribute = '', config = this.config) {
    return toolStyleConverter.getColorByConfig({ attribute, config, style: this.style });
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

    this.renderBasicCanvas();
  }

  public createBasicCanvas(size: ISize) {
    const basicCanvas = document.createElement('canvas');
    basicCanvas.className = 'bee-basic-layer';
    this.updateCanvasBasicStyle(basicCanvas, size, 0);
    this.basicCanvas = basicCanvas;
    if (this.container.hasChildNodes()) {
      this.container.insertBefore(basicCanvas, this.container.childNodes[0]);
    } else {
      this.container.appendChild(basicCanvas);
    }
    this.basicCtx?.scale(this.pixelRatio, this.pixelRatio);
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

  public drawImg = () => {
    if (!this.imgNode || this.hiddenImg === true) return;

    DrawUtils.drawImg(this.basicCanvas, this.imgNode, {
      zoom: this.zoom,
      currentPos: this.currentPos,
      rotate: this.rotate,
      imgAttribute: this._imgAttribute,
    });
  };

  public destroyBasicCanvas() {
    if (this.basicCanvas && this.container.contains(this.basicCanvas)) {
      this.container.removeChild(this.basicCanvas);
    }
  }

  public clearBasicCanvas() {
    this.basicCtx?.clearRect(0, 0, this.size.width, this.size.height);
  }

  public renderBasicCanvas() {
    if (!this.basicCanvas) {
      return;
    }

    this.clearBasicCanvas();
    this.drawImg();

    const thickness = 2;

    if (this.basicResult && this.dependToolName && !this.forbidBasicResultRender) {
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

    this.renderReference();
  }

  public renderReference() {
    const thickness = 2;

    if (this.referenceInfo) {
      const { referenceResult, referenceToolName, referenceConfig } = this.referenceInfo;
      switch (referenceToolName) {
        case EToolName.RectTrack:
        case EToolName.Rect: {
          const rectList = referenceResult;
          rectList.forEach((rect: IRect) => {
            const toolColor = this.getColor(rect.attribute, referenceConfig);
            const toolData = StyleUtils.getStrokeAndFill(toolColor, rect.valid);
            DrawUtils.drawRect(this.basicCanvas, AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos), {
              color: toolData.stroke,
              thickness,
              lineDash: [24],
            });
          });
          break;
        }

        case EToolName.Point: {
          const pointList = referenceResult;
          pointList.forEach((point: IPointUnit) => {
            const toolColor = this.getColor(point.attribute, referenceConfig);
            const toolData = StyleUtils.getStrokeAndFill(toolColor, point.valid);
            DrawUtils.drawCircle(this.basicCanvas, AxisUtils.changePointByZoom(point, this.zoom, this.currentPos), 5, {
              color: toolData.stroke,
              fill: toolData.fill,
            });
          });
          break;
        }

        case EToolName.Polygon: {
          const polygonList = referenceResult;
          polygonList.forEach((polygon: IPolygonData) => {
            const toolColor = this.getColor(polygon.attribute, referenceConfig);
            const toolData = StyleUtils.getStrokeAndFill(toolColor, polygon.valid);

            DrawUtils.drawPolygonWithFillAndLine(
              this.basicCanvas,
              AxisUtils.changePointListByZoom(polygon.pointList, this.zoom, this.currentPos),
              {
                fillColor: toolData.fill,
                strokeColor: toolData.stroke,
                isClose: true,
                thickness,
              },
            );
          });

          break;
        }

        case EToolName.LineMarker:
        case EToolName.Line: {
          const lineList = referenceResult;
          lineList.forEach((line: any) => {
            const toolColor = this.getColor(line.attribute, referenceConfig);
            const toolData = StyleUtils.getStrokeAndFill(toolColor, line.valid);

            DrawUtils.drawLineWithPointList(
              this.basicCanvas,
              AxisUtils.changePointListByZoom(line.pointList, this.zoom, this.currentPos),
              {
                color: toolData.stroke,
                thickness,
              },
            );
          });

          break;
        }

        default: {
          //
        }
      }
    }
  }
}
