/**
 * 查看模式 - 支持简单数据注入查看
 */

import {
  TAnnotationViewData,
  IBasicText,
  TAnnotationViewLine,
  TAnnotationViewPolygon,
  TAnnotationViewBox3d,
  TAnnotationViewPixelPoints,
  IBasicStyle,
  TAnnotationViewCuboid,
  ImgPosUtils,
} from '@labelbee/lb-utils';
import _ from 'lodash';
import rgba from 'color-rgba';
import DrawUtils from '@/utils/tool/DrawUtils';
import AxisUtils from '@/utils/tool/AxisUtils';
import RectUtils from '@/utils/tool/RectUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import MathUtils from '@/utils/MathUtils';
import RenderDomClass from '@/utils/tool/RenderDomClass';
import { DEFAULT_FONT, ELineTypes, SEGMENT_NUMBER } from '@/constant/tool';
import { DEFAULT_TEXT_SHADOW, DEFAULT_TEXT_OFFSET, TEXT_ATTRIBUTE_OFFSET } from '@/constant/annotation';
import ImgUtils, { cropAndEnlarge } from '@/utils/ImgUtils';
import CanvasUtils from '@/utils/tool/CanvasUtils';
import TagUtils from '@/utils/tool/TagUtils';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import { pointCloudLidar2image } from '../pointCloud/matrix';

const newScope = 3;
const DEFAULT_RADIUS = 3;
const DEFAULT_STROKE_COLOR = '#6371FF';

interface IViewOperationProps extends IBasicToolOperationProps {
  style: IBasicStyle;
  staticMode?: boolean;
  annotations: TAnnotationViewData[];
}

export interface ISpecificStyle {
  stroke: string;
  thickness: number;
  fill: string;
  radius: number;
}

export interface IFontStyle {
  fontFamily: string;
  fontSize: number;
}

export default class ViewOperation extends BasicToolOperation {
  public style: IBasicStyle = {};

  public annotations: TAnnotationViewData[] = [];

  private mouseHoverID?: string;

  private loading: boolean; // 加载图片时不渲染图形

  private renderDomInstance: RenderDomClass;

  private connectionPoints: ICoordinate[] = [];

  // Save the connect - async-calculation
  private connectPointsStatus?: {
    close: () => void;
  };

  private cacheCanvas?: { [url: string]: HTMLCanvasElement }; // Cache the temporary canvas.

  constructor(props: IViewOperationProps) {
    super({ ...props, showDefaultCursor: true });
    this.style = props.style ?? { stroke: DEFAULT_STROKE_COLOR, thickness: 3 };
    this.annotations = props.annotations;
    this.loading = false;
    this.renderDomInstance = new RenderDomClass({
      container: this.container,
      height: this.canvas.height,
    });
  }

  public clearConnectionPoints() {
    this.connectionPoints = [];
    this.render();
  }

  /**
   * Get the connection points in annotationData.
   * @param newAnnotations
   */
  public checkConnectionPoints(newAnnotations: TAnnotationViewData[] = this.annotations) {
    if (this.connectPointsStatus) {
      // Clear the pre-Calculation
      this.connectPointsStatus.close?.();
    }

    this.emit('connectionPointsStatusUpdate', () => {
      return new Promise((resolve) => {
        const { promise, close } = MathUtils.getCollectionPointByAnnotationDataPromise(newAnnotations);

        this.connectPointsStatus = {
          close,
        };

        promise.then((res: any) => {
          this.connectionPoints = res.connectionPoints;
          this.render();
          this.connectPointsStatus = undefined;

          resolve({ connectionPoints: res.connectionPoints });
        });
      });
    });
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
    this.render();
  }

  public onMouseLeave() {
    super.onMouseLeave();
    this.mouseHoverID = undefined;
    this.emit('onChange', 'hover', []);
  }

  public onMouseDown(e: MouseEvent) {
    if (super.onMouseDown(e) || this.forbidMouseOperation || !this.imgInfo) {
      return true;
    }

    const newMouseSelectedID = this.mouseHoverID;
    if (e.button === 0) {
      let selectedID: any[] = [];
      if (newMouseSelectedID) {
        selectedID = [newMouseSelectedID];
      }
      this.emit('onChange', 'selected', selectedID);
      this.render();
    }
  }

  public setImgNode(imgNode: HTMLImageElement, basicImgInfo: Partial<{ valid: boolean; rotate: number }> = {}) {
    super.setImgNode(imgNode, basicImgInfo);

    /**
     * Temporary: New Pattern
     * 1. Initialize the staticImgNode.
     */
    if (this.staticMode) {
      this.generateStaticImgNode();
    }
  }

  /**
   * Temporary: New Pattern
   *
   * 1. crop the canvas.
   */
  public generateStaticImgNode() {
    const tmpUrl = cropAndEnlarge(this.canvas, this.basicImgInfo?.width, this.basicImgInfo?.height, 1);
    ImgUtils.load(tmpUrl).then((imgNode) => {
      this.staticImgNode = imgNode;
      this.drawStaticImg();
    });
  }

  public onMouseMove(e: MouseEvent) {
    if (super.onMouseMove(e) || this.forbidMouseOperation || !this.imgInfo) {
      return;
    }

    const oldMouseHoverID = this.mouseHoverID;
    const newMouseHoverID = this.getHoverRectID(e);
    if (oldMouseHoverID !== newMouseHoverID) {
      this.mouseHoverID = newMouseHoverID;
      let hoverID: string[] = [];
      if (newMouseHoverID) {
        hoverID = [newMouseHoverID];
      }

      this.emit('onChange', 'hover', hoverID);
      this.render();
    }
  }

  // 获取当前 hoverID
  public getHoverRectID = (e: MouseEvent) => {
    const coordinate = this.getCoordinateUnderZoom(e);
    const originCoordinate = AxisUtils.changePointByZoom(coordinate, 1 / this.zoom);
    if (this.annotations?.length <= 0 || !this.annotations?.length) {
      return;
    }

    /**
     * 1. 优先级升序
     * 2. 相同级别
     */
    let id = '';
    let minArea = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < this.annotations.length; i++) {
      const annotation = this.annotations[i];
      switch (annotation.type) {
        case 'rect': {
          const rect = annotation.annotation;
          if (RectUtils.isInRect(coordinate, rect as any, newScope, this.zoom)) {
            const area = rect.width * rect.height;
            if (area < minArea) {
              id = rect.id;
              minArea = area;
            }
          }
          break;
        }

        case 'polygon': {
          const polygon = annotation.annotation;
          if (PolygonUtils.isInPolygon(originCoordinate, polygon.pointList)) {
            const area = PolygonUtils.getPolygonArea(polygon.pointList);
            if (area < minArea) {
              id = polygon.id;
              minArea = area;
            }
          }
          break;
        }
        default: {
          //
        }
      }
    }

    return id;
  };

  public async updateData(annotations: TAnnotationViewData[]) {
    if (_.isEqual(this.annotations, annotations)) {
      return;
    }
    this.annotations = annotations;

    if (this.staticMode) {
      this.staticImgNode = undefined;
    }

    // 1. Update the render.
    this.render();

    // 2. Crop the staticNode
    if (this.staticMode) {
      const preZoom = this.zoom;
      const preCurrentPos = this.currentPos;
      this.initImgPos();
      this.generateStaticImgNode();
      const tmp = this.staticImgNode;
      this.staticImgNode = undefined;
      this.updatePosition({
        zoom: preZoom,
        currentPos: preCurrentPos,
      });
      this.staticImgNode = tmp;
    }
  }

  public setConfig(config: { [a: string]: any } | string) {
    this.config = config;
  }

  /**
   * 获取当前结果的标注类型
   * @param obj
   * @returns
   */
  private getSpecificStyle(obj: { [a: string]: any }) {
    const specificStyle = _.pick(obj, ['stroke', 'thickness', 'fill', 'radius']);

    const newStyle = {
      ...this.style,
      ...specificStyle,
    };

    if (newStyle.stroke) {
      // 兼容下方默认值 color 的携带
      Object.assign(newStyle, {
        color: newStyle.stroke,
      });
    }

    return newStyle;
  }

  /**
   * Get font rendering style
   * @param obj
   * @param style
   * @returns
   */
  private getFontStyle(obj: { [a: string]: any }, style: ISpecificStyle) {
    const fontSize = obj?.fontSize ?? 14;
    const fontFamily = obj?.fontFamily ?? 'Arial';
    return {
      ...DEFAULT_TEXT_SHADOW,
      color: style.stroke,
      font: `normal normal 600 ${fontSize}px ${fontFamily}`,
    };
  }

  /**
   *  Append Draw offset
   */
  public appendOffset({ x, y }: ICoordinate) {
    return { x: x + DEFAULT_TEXT_OFFSET.offsetX, y: y + DEFAULT_TEXT_OFFSET.offsetY };
  }

  /**
   * 获取当前展示的文本
   * @param result
   * @returns
   */
  public getRenderText(result: any, hiddenText = false) {
    let headerText = '';
    let bottomText = '';

    if (!result || hiddenText === true) {
      return { headerText, bottomText };
    }

    if (result?.order) {
      headerText = `${result.order}`;
    }

    if (result?.label) {
      if (headerText) {
        headerText = `${headerText}_${result.label}`;
      } else {
        headerText = `${result.label}`;
      }
    }

    if (result?.attribute) {
      if (headerText) {
        headerText = `${headerText}  ${result.attribute}`;
      } else {
        headerText = `${result.attribute}`;
      }
    }

    if (result?.textAttribute) {
      bottomText = result?.textAttribute;
    }

    // show subAttributeList
    const { secondaryAttributeConfigurable, subAttributeList } = this.config;
    if (result?.subAttribute && secondaryAttributeConfigurable && subAttributeList) {
      const list = TagUtils.getTagNameList(result?.subAttribute, subAttributeList);
      list.forEach((i) => {
        headerText += `\n${i.keyName}: ${i.value.join(`、`)}`;
      });
    }
    return { headerText, bottomText };
  }

  public getReferenceOptions(isReference?: boolean): { lineCap?: CanvasLineCap; lineDash?: number[] } {
    return isReference ? { lineCap: 'butt', lineDash: [20, 20] } : {};
  }

  /**
   * Focus on the selected lang.
   * @param pointList
   */
  public focusPositionByPointList(pointList: ICoordinate[]) {
    const basicZone = MathUtils.calcViewportBoundaries(pointList);
    const newBoundary = {
      x: basicZone.left,
      y: basicZone.top,
      width: basicZone.right - basicZone.left,
      height: basicZone.bottom - basicZone.top,
    } as IRect;
    const pos = ImgPosUtils.getBasicRecPos(this.imgNode, newBoundary, this.size, 0.5);
    if (pos) {
      this.setCurrentPos(pos.currentPos);
      this.setCurrentPosStorage(pos.currentPos);
      const { imgInfo } = this;
      const { innerZoom } = this.innerPosAndZoom;
      if (imgInfo) {
        this.setImgInfo({
          ...imgInfo,
          width: (imgInfo.width / innerZoom) * pos.innerZoom,
          height: (imgInfo.height / innerZoom) * pos.innerZoom,
        });
      }

      // 需要加载下更改当前的 imgInfo
      this.setZoom(pos.innerZoom);

      this.render();
      this.renderBasicCanvas();
    }
  }

  public renderConnectionPoints() {
    this.connectionPoints.forEach((point) => {
      const renderPoint = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);

      DrawUtils.drawCircleWithFill(this.canvas, renderPoint, 4, { color: '#fff' });
      DrawUtils.drawCircleWithFill(this.canvas, renderPoint, 2, { color: '#000' });
    });
  }

  public getRenderStyle(annotation: TAnnotationViewData) {
    const style = this.getSpecificStyle(annotation.annotation);
    const fontStyle = this.getFontStyle(annotation.annotation, style);

    return {
      style,
      fontStyle,
    };
  }

  public renderLine(annotation: TAnnotationViewLine) {
    if (annotation.type !== 'line') {
      return;
    }

    const { style, fontStyle } = this.getRenderStyle(annotation);

    const line = annotation.annotation;
    if (!(line?.pointList?.length >= 2)) {
      return;
    }

    const { lineType = ELineTypes.Line } = line;
    const renderLineWithZoom = AxisUtils.changePointListByZoom(
      (line?.pointList as IPoint[]) ?? [],
      this.zoom,
      this.currentPos,
    );

    const lineRenderOptions = {
      ...style,
      ...this.getReferenceOptions(line?.isReference),
      lineType,
      strokeColor: style.stroke,
    };

    let newPointList = [];
    if (line.showKeyPoint) {
      // Show the line key point.
      newPointList = DrawUtils.drawPolygonWithKeyPoint(this.canvas, renderLineWithZoom, lineRenderOptions);
    } else {
      newPointList = DrawUtils.drawPolygon(this.canvas, renderLineWithZoom, lineRenderOptions);
    }

    const isShowDirection = line?.showDirection === true && line?.pointList?.length >= 2;

    // 是否展示方向
    if (isShowDirection) {
      let startPoint = renderLineWithZoom[0];
      let endPoint = MathUtils.getLineCenterPoint([renderLineWithZoom[0], renderLineWithZoom[1]]);

      if (lineType === ELineTypes.Curve) {
        const pos = Math.floor(SEGMENT_NUMBER / 2);
        startPoint = newPointList[pos];
        endPoint = newPointList[pos + 1];
      }
      DrawUtils.drawArrowByCanvas(this.canvas, startPoint, endPoint, {
        color: style.stroke,
        thickness: style.thickness,
      });
      DrawUtils.drawCircle(this.canvas, renderLineWithZoom[0], style.thickness + 6, {
        color: style.stroke,
        thickness: style.thickness,
      });
    }

    // 文本渲染
    const { headerText, bottomText } = this.getRenderText(line, line?.hiddenText);
    if (headerText) {
      DrawUtils.drawText(this.canvas, this.appendOffset(renderLineWithZoom[0]), headerText, fontStyle);
    }
    if (bottomText) {
      const endPoint = renderLineWithZoom[renderLineWithZoom.length - 1];

      DrawUtils.drawText(
        this.canvas,
        this.appendOffset({ x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y }),
        bottomText,
        fontStyle,
      );
    }
  }

  public renderPolygon(annotation: TAnnotationViewPolygon) {
    if (annotation.type !== 'polygon') {
      return;
    }
    const { style, fontStyle } = this.getRenderStyle(annotation);

    const polygon = annotation.annotation;
    if (!(polygon?.pointList?.length >= 3)) {
      return;
    }

    const { lineType = ELineTypes.Line } = polygon;
    const renderPolygon = AxisUtils.changePointListByZoom(polygon?.pointList ?? [], this.zoom, this.currentPos);
    if (polygon.id === this.mouseHoverID || style.fill) {
      const fillArr = rgba(style?.fill ?? style?.stroke ?? DEFAULT_STROKE_COLOR);
      const fill = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;
      DrawUtils.drawPolygonWithFill(this.canvas, renderPolygon, { color: fill, lineType });
    }

    const polygonRenderOptions = {
      ...style,
      isClose: true,
      ...this.getReferenceOptions(polygon?.isReference),
      lineType,
      strokeColor: style.stroke,
    };

    let newPointList = [];

    // 是否展示关键点
    if (polygon.showKeyPoint) {
      newPointList = DrawUtils.drawPolygonWithKeyPoint(this.canvas, renderPolygon, polygonRenderOptions);
    } else {
      newPointList = DrawUtils.drawPolygon(this.canvas, renderPolygon, polygonRenderOptions);
    }

    const isShowDirection = polygon?.showDirection === true && polygon?.pointList?.length >= 2;

    // 是否展示方向
    if (isShowDirection) {
      let startPoint = renderPolygon[0];
      let endPoint = MathUtils.getLineCenterPoint([renderPolygon[0], renderPolygon[1]]);

      if (lineType === ELineTypes.Curve) {
        const pos = Math.floor(SEGMENT_NUMBER / 2);
        startPoint = newPointList[pos];
        endPoint = newPointList[pos + 1];
      }
      DrawUtils.drawArrowByCanvas(this.canvas, startPoint, endPoint, {
        color: style.stroke,
        thickness: style.thickness,
      });
      DrawUtils.drawCircle(this.canvas, renderPolygon[0], style.thickness + 6, {
        color: style.stroke,
        thickness: style.thickness,
      });
    }

    // 文本渲染
    const { headerText, bottomText } = this.getRenderText(polygon, polygon?.hiddenText);
    if (headerText) {
      DrawUtils.drawText(this.canvas, this.appendOffset(renderPolygon[0]), headerText, fontStyle);
    }
    if (bottomText) {
      const endPoint = renderPolygon[renderPolygon.length - 1];

      DrawUtils.drawText(
        this.canvas,
        this.appendOffset({ x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y }),
        bottomText,
        fontStyle,
      );
    }
  }

  public renderSingleCuboid(annotation: TAnnotationViewCuboid) {
    const { style } = this.getRenderStyle(annotation);
    const cuboid = annotation.annotation;
    const fillArr = rgba(style?.fill ?? style?.stroke ?? DEFAULT_STROKE_COLOR);
    const fillColor = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;
    const strokeColor = style.stroke;
    const transformCuboid = AxisUtils.changeCuboidByZoom(cuboid, this.zoom, this.currentPos);
    const { headerText, bottomText } = this.getRenderText(cuboid, cuboid?.hiddenText);

    DrawUtils.drawCuboidWithText(
      this.canvas,
      transformCuboid,
      { strokeColor, fillColor, thickness: style.thickness },
      {
        config: this.config,
        hiddenText: cuboid?.hiddenText,
        headerText,
        bottomText,
      },
    );
  }

  public renderBox3d(annotation: TAnnotationViewBox3d) {
    if (annotation.type !== 'box3d') {
      return;
    }

    const data = annotation.annotation;
    const { transferViewData: viewDataPointList } = pointCloudLidar2image(data as any, data.calib) ?? {};
    if (!viewDataPointList) {
      return;
    }
    const defaultViewStyle = {
      fill: 'transparent',
      // stroke: style.stroke,
    };

    const extraData = _.pick(data, ['stroke', 'thickness']);

    viewDataPointList!.forEach((v, i) => {
      const newAnnotation = {
        ...extraData,
        id: `${annotation.annotation.id}-${i}`,
        pointList: v.pointList,
        ...defaultViewStyle,
      };

      switch (v.type) {
        case 'line':
          this.renderLine({
            type: 'line',
            annotation: newAnnotation,
          });
          break;
        case 'polygon':
          this.renderPolygon({
            type: 'polygon',
            annotation: newAnnotation,
          });
          break;

        default: {
          break;
        }
      }
    });
  }

  public renderPixelPoints(annotation: TAnnotationViewPixelPoints) {
    if (annotation.type !== 'pixelPoints') {
      return;
    }

    const data = annotation.annotation;
    if (!this.imgNode) {
      console.error('Need to load after imgLoaded');
      return;
    }
    if (!(data.length > 0)) {
      console.warn('Empty pixelPoints');
      return;
    }

    // 1. Get the cached.
    const uid = this.imgNode.src + data.length + annotation.defaultRGBA;
    const cacheCanvas = this.cacheCanvas?.[uid];
    if (cacheCanvas) {
      DrawUtils.drawImg(this.canvas, cacheCanvas, {
        zoom: this.zoom,
        currentPos: this.currentPos,
      });
      return;
    }

    // 2. Create New offsetCanvas to render
    const size = { width: this.imgNode.width, height: this.imgNode.height };
    const { ctx, canvas: offsetCanvas } = CanvasUtils.createCanvas(size);
    const pixelSize = typeof annotation.pixelSize === 'number' ? annotation.pixelSize : 13;
    if (ctx && data?.length > 0) {
      DrawUtils.drawPixel({
        canvas: offsetCanvas,
        points: data,
        size,
        defaultRGBA: annotation.defaultRGBA,
        pixelSize,
      });
      DrawUtils.drawImg(this.canvas, offsetCanvas, {
        zoom: this.zoom,
        currentPos: this.currentPos,
      });

      // Clear Cached.
      this.cacheCanvas = {
        [uid]: offsetCanvas,
      };
    }
  }

  public render() {
    try {
      if (this.staticImgNode) {
        return;
      }
      super.render();
      if (this.loading === true) {
        return;
      }

      const globalDomTextAnnotation = this.annotations
        .filter((v) => v.type === 'text' && v.annotation.position === 'rt')
        .map((v) => v.annotation) as IBasicText[];

      this.renderDomInstance.render(globalDomTextAnnotation);

      this.annotations.forEach((annotation) => {
        const style = this.getSpecificStyle(annotation.annotation);
        const fontStyle = this.getFontStyle(annotation.annotation, style);

        switch (annotation.type) {
          case 'rect': {
            const rect: any = annotation.annotation;
            const { hiddenText = false, isReference, hiddenRectSize = false } = rect;
            const { zoom } = this;
            const renderRect = AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos);

            const { x, y, width, height } = renderRect;

            const fillArr = rgba(style?.fill ?? style?.stroke ?? DEFAULT_STROKE_COLOR);
            const fill = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;

            if (rect.id === this.mouseHoverID || style.fill) {
              DrawUtils.drawRectWithFill(this.canvas, renderRect, { color: fill }); // color 看后续是否要改 TODO
            }
            DrawUtils.drawRect(this.canvas, renderRect, {
              ...style,
              hiddenText: true,
              ...this.getReferenceOptions(isReference),
            });

            if (rect?.isHighlight) {
              DrawUtils.drawHighlightFlag({
                canvas: this.canvas,
                color: fill,
                position: {
                  x: x - 16,
                  y: y - 16,
                },
              });
            }
            // 文本渲染
            const { headerText, bottomText } = this.getRenderText(rect, rect?.hiddenText);

            if (headerText) {
              // 框体上方展示
              DrawUtils.drawText(this.canvas, { x, y: y - 6 }, headerText, {
                textMaxWidth: 300,
                ...fontStyle,
              });
            }

            // 框大小数值显示
            const rectSize = `${Math.round(width / zoom)} * ${Math.round(height / zoom)}`;
            const textSizeWidth = rectSize.length * 7;

            if (!hiddenText && !hiddenRectSize) {
              DrawUtils.drawText(
                this.canvas,
                { x: x + width - textSizeWidth, y: y + height + 15 },
                rectSize,
                fontStyle,
              );
            }

            if (bottomText) {
              const marginTop = 20;
              const textWidth = Math.max(20, width - textSizeWidth);
              DrawUtils.drawText(this.canvas, { x, y: y + height + marginTop }, rect.textAttribute, {
                textMaxWidth: textWidth,
                ...fontStyle,
              });
            }

            break;
          }
          case 'polygon': {
            this.renderPolygon(annotation);
            break;
          }

          case 'line': {
            this.renderLine(annotation);
            break;
          }

          case 'point': {
            const point = annotation.annotation;

            const renderPoint = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);

            const radius = style.radius ?? DEFAULT_RADIUS;
            DrawUtils.drawCircle(this.canvas, renderPoint, radius, style);

            // 文本渲染
            const { headerText, bottomText } = this.getRenderText(point, point?.hiddenText);
            if (headerText) {
              DrawUtils.drawText(
                this.canvas,
                { x: renderPoint.x + radius / 2, y: renderPoint.y - radius - 4 },
                headerText,
                {
                  textAlign: 'center',
                  ...fontStyle,
                },
              );
            }
            if (bottomText) {
              DrawUtils.drawText(
                this.canvas,
                this.appendOffset({ x: renderPoint.x + radius, y: renderPoint.y + radius + 24 }),
                bottomText,
                fontStyle,
              );
            }
            break;
          }

          case 'text': {
            const textAnnotation = annotation.annotation;
            const {
              text,
              x,
              y,
              textMaxWidth,
              color = 'white',
              background = 'rgba(0, 0, 0, 0.6)',
              lineHeight = 25,
              font = DEFAULT_FONT,
              position,
              offset,
            } = textAnnotation;
            const paddingTB = 10;
            const paddingLR = 10;

            const renderPoint = AxisUtils.changePointByZoom({ x, y }, this.zoom, this.currentPos);
            if (offset) {
              renderPoint.x += offset.x ?? 0;
              renderPoint.y += offset.y ?? 0;
            }

            const {
              width,
              height,
              fontHeight = 0,
            } = MathUtils.getTextArea(this.canvas, textAnnotation.text, textMaxWidth, font, lineHeight);

            // 定位在右上角 - 以 dom 元素展现
            if (position === 'rt') {
              break;
            }

            // 字体背景
            DrawUtils.drawRectWithFill(
              this.canvas,
              {
                x: renderPoint.x,
                y: renderPoint.y,
                width: width + paddingLR * 2,
                height: height + paddingTB * 2,
                id: '',
                sourceID: '',
                valid: true,
                textAttribute: '',
                attribute: '',
              },
              {
                color: background,
              },
            );

            DrawUtils.drawText(
              this.canvas,
              {
                x: renderPoint.x + paddingLR,
                y: renderPoint.y + fontHeight + paddingTB,
              },
              text,
              {
                color,
                lineHeight,
                font,
                textMaxWidth,
              },
            );
            break;
          }

          case 'box3d': {
            this.renderBox3d(annotation);
            break;
          }

          case 'cuboid': {
            this.renderSingleCuboid(annotation);
            break;
          }

          case 'pixelPoints': {
            this.renderPixelPoints(annotation);
            break;
          }

          default: {
            break;
          }
        }

        if ('renderEnhance' in annotation.annotation) {
          annotation.annotation.renderEnhance?.({
            ctx: this.ctx,
            canvas: this.canvas,
            currentPos: this.currentPos,
            zoom: this.zoom,
            data: annotation,
            toolInstance: this,
          });
        }
      });

      this.renderConnectionPoints();
    } catch (e) {
      console.error('ViewOperation Render Error', e);
    }
  }
}
