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

const newScope = 3;

interface IBasicStyle {
  color?: string; // 用于当前图形的颜色的特殊设置
  fill?: string; // 填充颜色
  thickness?: number; // 当前图形宽度
}

interface IAnnotationData {
  type: 'rect' | 'polygon' | 'line' | 'point';
  annotation: IBasicRect & IBasicPolygon & IBasicLine & IPoint;
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
}

type IBasicLine = IBasicPolygon;

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

  public render() {
    super.render();
    if (this.loading === true) {
      return;
    }

    this.annotations.forEach((annotation) => {
      switch (annotation.type) {
        case 'rect': {
          const rect: any = annotation.annotation;
          const renderRect = AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos);
          const style = this.getSpecificStyle(rect);

          if (rect.id === this.mouseHoverID || style.fill) {
            const fillArr = rgba(style.color);
            const fill = `rgba(${fillArr[0]}, ${fillArr[1]}, ${fillArr[2]},${fillArr[3] * 0.8})`;
            DrawUtils.drawRectWithFill(this.canvas, renderRect, { color: fill }); // color 看后续是否要改 TODO
          }
          DrawUtils.drawRect(this.canvas, renderRect, style);
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
          });
          break;
        }

        case 'line': {
          const line = annotation.annotation;

          const renderLine = AxisUtils.changePointListByZoom(line.pointList as IPoint[], this.zoom, this.currentPos);
          const style = this.getSpecificStyle(line);
          DrawUtils.drawPolygon(this.canvas, renderLine, style);
          break;
        }

        case 'point': {
          const point = annotation.annotation;

          const renderPoint = AxisUtils.changePointByZoom(point, this.zoom, this.currentPos);
          const style = this.getSpecificStyle(point);

          DrawUtils.drawCircle(this.canvas, renderPoint, style.radius ?? DEFAULT_RADIUS, style);
          break;
        }

        default: {
          //
        }
      }
    });
  }
}
