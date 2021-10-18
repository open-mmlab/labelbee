import { ELineTypes, SEGMENT_NUMBER } from '../../constant/tool';
import { IPolygonPoint } from '../../types/tool/polygon';
import PolygonUtils from './PolygonUtils';
import UnitUtils from './UnitUtils';

const DEFAULT_ZOOM = 1;
const DEFAULT_CURRENT_POS = {
  x: 0,
  y: 0,
};
const DEFAULT_ROTATE = 0;
const DEFAULT_COLOR = '';

export default class DrawUtils {
  public static drawImg = (
    canvas: HTMLCanvasElement,
    imgNode: HTMLImageElement,
    options: Partial<IOffsetCanvasPosition & { imgAttribute: IImageAttribute }> = {},
  ) => {
    const ctx = canvas.getContext('2d')!;

    const { zoom = DEFAULT_ZOOM, currentPos = DEFAULT_CURRENT_POS, rotate = DEFAULT_ROTATE, imgAttribute } = options;

    ctx.save();
    switch (rotate) {
      case 0:
        ctx.translate(currentPos.x, currentPos.y);
        break;

      case 90:
        ctx.translate(currentPos.x + imgNode.height * zoom, currentPos.y);
        ctx.rotate((90 * Math.PI) / 180);
        break;

      case 180:
        ctx.translate(currentPos.x + imgNode.width * zoom, currentPos.y + imgNode.height * zoom);
        ctx.rotate(Math.PI);
        break;

      case 270:
        ctx.translate(currentPos.x, currentPos.y + imgNode.width * zoom);
        ctx.rotate((270 * Math.PI) / 180);
        break;

      default:
        ctx.translate(currentPos.x, currentPos.y);
        break;
    }

    if (imgAttribute) {
      // 更改图片的属性
      const { contrast, saturation, brightness } = imgAttribute;
      ctx.filter = `saturate(${saturation + 100}%) contrast(${contrast + 100}%) brightness(${brightness + 100}%)`;
    }

    ctx.drawImage(imgNode, 0, 0, imgNode.width * zoom, imgNode.height * zoom);
    ctx.restore();
  };

  public static drawLine(
    canvas: HTMLCanvasElement,
    startPoint: IPoint | IPolygonPoint,
    endPoint: IPoint | IPolygonPoint,
    options: Partial<{
      color: string;
      thickness: number;
      lineCap: CanvasLineCap;
    }> = {},
  ): void {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const { color = DEFAULT_COLOR, thickness = 1, lineCap = 'round' } = options;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = lineCap;
    ctx.beginPath();

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x + 1, endPoint.y + 1);
    ctx.stroke();
    ctx.restore();
  }

  /**
   *  查看绘制拉框
   * @param canvas
   * @param rect
   * @param options
   */
  public static drawRect(
    canvas: HTMLCanvasElement,
    rect: IRect,
    options: Partial<{
      color: string;
      thickness: number;
      lineCap: CanvasLineCap;
    }> = {},
  ): void {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const { color = DEFAULT_COLOR, thickness = 1, lineCap = 'round' } = options;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = lineCap;
    ctx.beginPath();
    ctx.fillStyle = color;

    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    let showText = '';
    if (rect.attribute) {
      showText = `${showText}  ${rect.attribute}`;
    }
    this.drawText(canvas, { x: rect.x, y: rect.y - 5 }, showText);
    if (rect.textAttribute) {
      const text = `${~~rect.width} * ${~~rect.height}`;
      const textSizeWidth = text.length * 7;
      const marginTop = 0;
      const textWidth = Math.max(20, rect.width - textSizeWidth);
      this.drawText(canvas, { x: rect.x, y: rect.y + rect.height + 20 + marginTop }, rect.textAttribute, {
        textMaxWidth: textWidth,
      });
    }
    ctx.restore();
  }

  /**
   * 填充矩形框的绘制
   * @param canvas
   * @param rect
   * @param options
   */
  public static drawRectWithFill(
    canvas: HTMLCanvasElement,
    rect: IRect,
    options: Partial<{
      color: string;
    }> = {},
  ): void {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const { color = DEFAULT_COLOR } = options;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }

  public static drawTag(canvas: HTMLCanvasElement, tagList: { keyName: string; value: string[] }[]) {
    const parentNode = canvas?.parentNode;
    const oldDom = window.self.document.getElementById('tagToolTag');
    if (oldDom && parentNode && parentNode.contains(oldDom)) {
      parentNode?.removeChild(oldDom);
    }
    if (!(tagList?.length > 0)) {
      return;
    }
    const dom = document.createElement('div');
    dom.innerHTML =
      tagList.reduce((acc: string, cur) => {
        return `${acc}${cur.keyName}: ${cur.value.join(` 、 `)}\n`;
      }, '') ?? '';
    dom.setAttribute('id', 'tagToolTag');
    parentNode?.appendChild(dom);
  }

  /**
   * 绘制点击线条
   * @param canvas
   * @param pointList
   * @param options
   * @returns
   */
  public static drawLineWithPointList(
    canvas: HTMLCanvasElement,
    pointList: IPoint[] | IPolygonPoint[],
    options: Partial<{
      color: string;
      thickness: number;
      lineCap: CanvasLineCap;
      lineType: ELineTypes;
      hoverEdgeIndex: number; //  配合 ELineTypes.Curve
    }> = {},
  ) {
    if (pointList.length < 2) {
      return;
    }

    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const {
      color = DEFAULT_COLOR,
      thickness = 1,
      lineCap = 'round',
      lineType = ELineTypes.Line,
      hoverEdgeIndex,
    } = options;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = lineCap;
    ctx.beginPath();

    if (lineType === ELineTypes.Curve) {
      if (hoverEdgeIndex !== undefined && hoverEdgeIndex > -1) {
        pointList.push(pointList[0]);
      }

      pointList = PolygonUtils.createSmoothCurvePointsFromPointList([...pointList], SEGMENT_NUMBER);

      if (hoverEdgeIndex !== undefined && hoverEdgeIndex > -1) {
        // 想要绘制第 hoverEdgeIndex 的边, 注意，现在发现这种闭合的初始化的点并不是从 点 0 开始，而是从  0的后一个点开始
        pointList = pointList.slice((SEGMENT_NUMBER + 1) * hoverEdgeIndex, (SEGMENT_NUMBER + 1) * (hoverEdgeIndex + 1));
      }
    } else if (hoverEdgeIndex !== undefined && hoverEdgeIndex > -1) {
      pointList = [...pointList, pointList[0]];
      pointList = pointList.slice(hoverEdgeIndex, hoverEdgeIndex + 2);
    }

    const [firstPoint, ...nextPointList] = pointList;
    ctx.moveTo(firstPoint.x, firstPoint.y);
    nextPointList.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  public static drawCircle(
    canvas: HTMLCanvasElement,
    anchorPoint: IPoint,
    radius: number,
    options: Partial<{
      startAngleDeg: number;
      endAngleDeg: number;
      thickness: number;
      color: string;
      fill: string;
    }> = {},
  ): void {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const {
      startAngleDeg = 0,
      endAngleDeg = 360,
      thickness = 1,
      color = DEFAULT_COLOR,
      fill = DEFAULT_COLOR,
    } = options;

    const startAngleRad = UnitUtils.deg2rad(startAngleDeg);
    const endAngleRad = UnitUtils.deg2rad(endAngleDeg);
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = fill;
    ctx.lineWidth = thickness;
    ctx.arc(anchorPoint.x, anchorPoint.y, radius, startAngleRad, endAngleRad, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  public static drawCircleWithFill(
    canvas: HTMLCanvasElement,
    anchorPoint: IPoint,
    radius: number = 3,
    options: Partial<{
      color: string;
    }> = {},
  ): void {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const { color = DEFAULT_COLOR } = options;

    ctx.save();
    const startAngleRad = UnitUtils.deg2rad(0);
    const endAngleRad = UnitUtils.deg2rad(360);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(anchorPoint.x, anchorPoint.y, radius, startAngleRad, endAngleRad, false);
    ctx.fill();
    ctx.restore();
  }

  public static drawPolygon(
    canvas: HTMLCanvasElement,
    pointList: IPolygonPoint[],
    options: Partial<{
      color: string;
      thickness: number;
      lineCap: CanvasLineCap;
      isClose: boolean; // 是否闭合
      lineType: ELineTypes;
    }> = {},
  ): void {
    const { isClose = false, lineType = ELineTypes.Line } = options;
    if (isClose === true) {
      pointList = [...pointList, pointList[0]];
    }

    if (lineType === ELineTypes.Curve) {
      pointList = PolygonUtils.createSmoothCurvePointsFromPointList([...pointList]);
    }

    this.drawLineWithPointList(canvas, pointList, options);
  }

  public static drawPolygonWithFill(
    canvas: HTMLCanvasElement,
    pointList: IPolygonPoint[],
    options: Partial<{
      color: string;
      lineType: ELineTypes;
    }> = {},
  ): void {
    if (pointList.length < 2) {
      return;
    }
    
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const { color = DEFAULT_COLOR, lineType = ELineTypes.Line } = options;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();

    if (lineType === ELineTypes.Curve) {
      pointList = PolygonUtils.createSmoothCurvePointsFromPointList([...pointList, pointList[0]]);
    }

    const [startPoint, ...otherPointList] = pointList;
    ctx.moveTo(startPoint.x, startPoint.y);
    otherPointList.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.fill();
    ctx.restore();
  }

  public static drawPolygonWithFillAndLine(
    canvas: HTMLCanvasElement,
    pointList: IPolygonPoint[],
    options: Partial<{
      strokeColor: string;
      fillColor: string;
      pointColor: string;
      thickness: number;
      lineCap: CanvasLineCap;
      isClose: boolean; // 是否闭合
      lineType: ELineTypes;
    }> = {},
  ): void {
    const { strokeColor, fillColor, thickness, lineCap, isClose, lineType } = options;

    this.drawPolygon(canvas, pointList, { color: strokeColor, thickness, lineCap, isClose, lineType });
    this.drawPolygonWithFill(canvas, pointList, { color: fillColor, lineType });
  }

  // 绘制选中的多边形
  public static drawSelectedPolygonWithFillAndLine(
    canvas: HTMLCanvasElement,
    pointList: IPolygonPoint[],
    options: Partial<{
      strokeColor: string;
      fillColor: string;
      pointColor: string;
      thickness: number;
      lineCap: CanvasLineCap;
      isClose: boolean; // 是否闭合
      lineType: ELineTypes;
    }> = {},
  ): void {
    const { pointColor = 'white', strokeColor } = options;

    this.drawPolygonWithFillAndLine(canvas, pointList, options);

    const newPointList = [...pointList];
    // if (isClose === false) {
    //   newPointList.pop();
    // }

    newPointList.forEach((point) => {
      this.drawCircleWithFill(canvas, point, 4, { color: strokeColor });
      this.drawCircleWithFill(canvas, point, 3, { color: pointColor });
    });
  }

  // 绘制文本
  public static drawText(
    canvas: HTMLCanvasElement,
    startPoint: IPoint | IPolygonPoint,
    text: string,
    options: Partial<{
      color: string;
      font: string;
      shadowColor: string;
      shadowOffsetX: number;
      shadowOffsetY: number;
      shadowBlur: number;
      textMaxWidth: number;
      offsetX: number;
      offsetY: number;
      textAlign: 'start' | 'center' | 'end' | 'left' | 'right';
    }> = {},
  ): void {
    if (!text) {
      return;
    }

    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const {
      color = DEFAULT_COLOR,
      font = 'normal normal 500 14px Arial',
      shadowColor = '',
      shadowBlur = 0,
      shadowOffsetX = 0,
      shadowOffsetY = 0,
      textMaxWidth = 164,
      offsetX = 0,
      offsetY = 0,
      textAlign = 'start',
    } = options;

    ctx.save();
    ctx.textAlign = textAlign;
    ctx.fillStyle = color ?? 'white';
    ctx.font = font;
    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;
    ctx.shadowBlur = shadowBlur;
    this.wrapText(canvas, `${text}`, startPoint.x + offsetX, startPoint.y + offsetY, textMaxWidth);
    ctx.restore();
  }

  public static wrapText(
    canvas: HTMLCanvasElement,
    text: string,
    x: number,
    y: number,
    maxWidth?: number,
    lineHeight?: number,
  ) {
    if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
      return;
    }

    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    if (typeof maxWidth === 'undefined') {
      maxWidth = (canvas && canvas.width) || 300;
    }
    if (typeof lineHeight === 'undefined') {
      lineHeight =
        (canvas && parseInt(window.getComputedStyle(canvas).lineHeight, 10)) ||
        parseInt(window.getComputedStyle(document.body).lineHeight, 10);
    }

    const arrParagraph = text.split('\n');

    for (let i = 0; i < arrParagraph.length; i++) {
      // 字符分隔为数组
      const arrText = arrParagraph[i].split('');
      let line = '';

      for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (!maxWidth) {
          maxWidth = 300;
        }

        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = arrText[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);

      y += lineHeight;
    }
  }

  /**
   * 绘制箭头
   * @param ctx
   * @param startPoint
   * @param endPoint
   * @param options
   */
  public static drawArrow(
    ctx: CanvasRenderingContext2D,
    startPoint: IPoint | IPolygonPoint,
    endPoint: IPoint | IPolygonPoint,
    options: Partial<{
      color: string;
      thickness: number;
      lineCap: CanvasLineCap;
      theta: number; // 用于控制箭头的偏移
      headLen: number; // 箭头长度
      ctx: CanvasRenderingContext2D;
    }> = {},
  ): void {
    const { color = DEFAULT_COLOR, thickness = 1, lineCap = 'round', theta = 30, headLen = 10 } = options;
    const angle = (Math.atan2(startPoint.y - endPoint.y, startPoint.x - endPoint.x) * 180) / Math.PI;
    const angle1 = ((angle + theta) * Math.PI) / 180;
    const angle2 = ((angle - theta) * Math.PI) / 180;
    const topX = headLen * Math.cos(angle1);
    const topY = headLen * Math.sin(angle1);
    const botX = headLen * Math.cos(angle2);
    const botY = headLen * Math.sin(angle2);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = lineCap;
    ctx.beginPath();

    ctx.moveTo(endPoint.x + topX, endPoint.y + topY);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.lineTo(endPoint.x + botX, endPoint.y + botY);

    ctx.stroke();
    ctx.restore();
  }
}
