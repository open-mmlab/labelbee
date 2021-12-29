/**
 * 查看模式 - 支持简单数据注入查看
 */

import _ from 'lodash';
import rgba from 'color-rgba';
import DrawUtils from '@/utils/tool/DrawUtils';
import AxisUtils from '@/utils/tool/AxisUtils';
import RectUtils from '@/utils/tool/RectUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import MathUtils from '@/utils/MathUtils';
import { DEFAULT_FONT } from '@/constant/tool';
import { DEFAULT_TEXT_SHADOW, DEFAULT_TEXT_OFFSET, TEXT_ATTRIBUTE_OFFSET } from '@/constant/annotation';

const newScope = 3;

interface IBasicStyle {
  color?: string; // 用于当前图形的颜色的特殊设置
  fill?: string; // 填充颜色
  thickness?: number; // 当前图形宽度

  hiddenText?: boolean; // 是否隐藏文本
  isReference?: boolean; // 是否进行的参考显示
}

interface IAnnotationData {
  type: 'rect' | 'polygon' | 'line' | 'point' | 'text';
  annotation: IBasicRect & IBasicPolygon & IBasicLine & IPoint & IBasicText;
}

interface IBasicRect extends IBasicStyle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IBasicPolygon extends IBasicStyle {
  id: string;
  pointList: IPoint[];
  showDirection?: boolean;
  specialPoint?: boolean; // 顶点是否特殊点
  specialEdge?: boolean; // 顶点与其下一个顶点连成的边是否为特殊边
}

type IBasicLine = IBasicPolygon;

interface IBasicText {
  x: number;
  y: number;
  text: string; // Use \n for line feed
  textMaxWidth?: number;

  color?: string;
  background?: string;
  lineHeight?: number;
  font?: string; // canvas-font https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
}

interface IPoint extends IBasicStyle {
  x: number;
  y: number;
  radius?: number;
}

type IViewOperationProps = {
  style: IBasicStyle;
  annotations: IAnnotationData[];
} & IBasicToolOperationProps;

const DEFAULT_RADIUS = 3;

export default class ViewOperation extends BasicToolOperation {
  public style: IBasicStyle = {};

  public annotations: IAnnotationData[] = [];

  private mouseHoverID?: string;

  private loading: boolean; // 加载图片时不渲染图形

  constructor(props: IViewOperationProps) {
    super({ ...props, showDefaultCursor: true });
    this.style = props.style ?? { color: '#6371FF', thickness: 1 };
    this.annotations = props.annotations;
    this.loading = false;
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

  public updateData(annotations: IAnnotationData[]) {
    this.annotations = annotations;
    this.render();
  }

  /**
   * 获取当前结果的标注类型
   * @param obj
   * @returns
   */
  private getSpecificStyle(obj: { [a: string]: any }) {
    const specificStyle = _.pick(obj, ['color', 'thickness', 'fill', 'radius']);
    return {
      ...this.style,
      ...specificStyle,
    };
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
      headerText = `${result?.label}`;
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
    return { headerText, bottomText };
  }

  public getReferenceOptions(isReference?: boolean): { lineCap?: CanvasLineCap; lineDash?: number[] } {
    return isReference ? { lineCap: 'butt', lineDash: [20, 20] } : {};
  }

  public render() {
    super.render();
    if (this.loading === true) {
      return;
    }

    this.annotations.forEach((annotation) => {
      switch (annotation.type) {
        case 'rect': {
          const rect: any = annotation.annotation;
          const { hiddenText = false, isReference } = rect;
          const { zoom } = this;
          const renderRect = AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos);

          const { x, y, width, height } = renderRect;
          const style = this.getSpecificStyle(rect);

          if (rect.id === this.mouseHoverID || style.fill) {
            const fillArr = rgba(style.color);
            const fill = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;
            DrawUtils.drawRectWithFill(this.canvas, renderRect, { color: fill }); // color 看后续是否要改 TODO
          }
          DrawUtils.drawRect(this.canvas, renderRect, {
            ...style,
            hiddenText: true,
            ...this.getReferenceOptions(isReference),
          });

          // 文本渲染
          const { headerText, bottomText } = this.getRenderText(rect, rect?.hiddenText);

          if (headerText) {
            // 框体上方展示
            DrawUtils.drawText(this.canvas, { x, y: y - 6 }, headerText, {
              color: style.color,
              font: 'normal normal 900 14px SourceHanSansCN-Regular',
              ...DEFAULT_TEXT_SHADOW,
              textMaxWidth: 300,
            });
          }

          // 框大小数值显示
          const rectSize = `${Math.round(width / zoom)} * ${Math.round(height / zoom)}`;
          const textSizeWidth = rectSize.length * 7;
          if (!hiddenText) {
            DrawUtils.drawText(this.canvas, { x: x + width - textSizeWidth, y: y + height + 15 }, rectSize, {
              color: style.color,
              font: 'normal normal 600 14px Arial',
              ...DEFAULT_TEXT_SHADOW,
            });
          }

          if (bottomText) {
            const marginTop = 20;
            const textWidth = Math.max(20, width - textSizeWidth);
            DrawUtils.drawText(this.canvas, { x, y: y + height + marginTop }, rect.textAttribute, {
              color: style.color,
              font: 'italic normal 900 14px Arial',
              textMaxWidth: textWidth,
              ...DEFAULT_TEXT_SHADOW,
            });
          }

          break;
        }
        case 'polygon': {
          const polygon = annotation.annotation;
          const renderPolygon = AxisUtils.changePointListByZoom(polygon?.pointList ?? [], this.zoom, this.currentPos);
          const style = this.getSpecificStyle(polygon);
          if (polygon.id === this.mouseHoverID || style.fill) {
            const fillArr = rgba(style.color);
            const fill = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;
            DrawUtils.drawPolygonWithFill(this.canvas, renderPolygon, { color: fill });
          }
          DrawUtils.drawPolygon(this.canvas, renderPolygon, {
            ...style,
            isClose: true,
            ...this.getReferenceOptions(polygon?.isReference),
          });

          const isShowDirection = polygon?.showDirection === true && polygon?.pointList?.length > 2;

          // 是否展示方向
          if (isShowDirection) {
            DrawUtils.drawArrowByCanvas(
              this.canvas,
              renderPolygon[0],
              MathUtils.getLineCenterPoint([renderPolygon[0], renderPolygon[1]]),
              {
                color: style.color,
                thickness: style.thickness,
              },
            );
            DrawUtils.drawCircleWithFill(this.canvas, renderPolygon[0], style.thickness + 2, {
              color: style.color,
            });
          }

          // 文本渲染
          const { headerText, bottomText } = this.getRenderText(polygon, polygon?.hiddenText);
          if (headerText) {
            DrawUtils.drawText(this.canvas, renderPolygon[0], headerText, {
              color: style.color,
              ...DEFAULT_TEXT_OFFSET,
            });
          }
          if (bottomText) {
            const endPoint = renderPolygon[renderPolygon.length - 1];

            DrawUtils.drawText(
              this.canvas,
              { x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y },
              bottomText,
              {
                color: style.color,
                ...DEFAULT_TEXT_OFFSET,
              },
            );
          }

          break;
        }

        case 'line': {
          const line = annotation.annotation;

          const renderLine = AxisUtils.changePointListByZoom(line.pointList as IPoint[], this.zoom, this.currentPos);
          const style = this.getSpecificStyle(line);
          DrawUtils.drawPolygon(this.canvas, renderLine, { ...style, ...this.getReferenceOptions(line?.isReference) });
          // 文本渲染
          const { headerText, bottomText } = this.getRenderText(line, line?.hiddenText);
          if (headerText) {
            DrawUtils.drawText(this.canvas, renderLine[0], headerText, {
              color: style.color,
              ...DEFAULT_TEXT_OFFSET,
            });
          }
          if (bottomText) {
            const endPoint = renderLine[renderLine.length - 1];

            DrawUtils.drawText(
              this.canvas,
              { x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y },
              bottomText,
              {
                color: style.color,
                ...DEFAULT_TEXT_OFFSET,
              },
            );
          }
          break;
        }

        case 'point': {
          const point = annotation.annotation;

          const renderPoint = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);
          const style = this.getSpecificStyle(point);

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
                color: style.color,
              },
            );
          }
          if (bottomText) {
            DrawUtils.drawText(this.canvas, { x: renderPoint.x + radius, y: renderPoint.y + radius + 24 }, bottomText, {
              color: style.color,
              ...DEFAULT_TEXT_OFFSET,
            });
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
          } = textAnnotation;
          const renderPoint = AxisUtils.changePointByZoom({ x, y }, this.zoom, this.currentPos);

          const {
            width,
            height,
            fontHeight = 0,
          } = MathUtils.getTextArea(this.canvas, textAnnotation.text, textMaxWidth, font, lineHeight);

          const paddingTB = 10;
          const paddingLR = 10;

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

        default: {
          //
        }
      }
    });
  }
}
