import MathUtils from '../MathUtils';

export default class CanvasUtils {
  public static getMousePositionOnCanvasFromEvent(event: MouseEvent, canvas: HTMLCanvasElement) {
    if (canvas && event) {
      const canvasRect: ClientRect | DOMRect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      };
    }
    return null;
  }

  public static getClientRect(canvas: HTMLCanvasElement) {
    if (canvas) {
      const canvasRect: ClientRect | DOMRect = canvas.getBoundingClientRect();
      return {
        x: canvasRect.left,
        y: canvasRect.top,
        width: canvasRect.width,
        height: canvasRect.height,
      };
    }
    return null;
  }

  public static getSize(canvas: HTMLCanvasElement) {
    if (canvas) {
      const canvasRect: ClientRect | DOMRect = canvas.getBoundingClientRect();
      return {
        width: canvasRect.width,
        height: canvasRect.height,
      };
    }
    return null;
  }

  /**
   * 点在视野内
   * @param coord
   * @param viewPort
   */
  public static inViewPort(
    coord: ICoordinate | undefined,
    viewPort: { top: number; bottom: number; left: number; right: number },
  ) {
    if (!coord) {
      return false;
    }

    return (
      MathUtils.isInRange(coord.x, [viewPort.left, viewPort.right]) &&
      MathUtils.isInRange(coord.y, [viewPort.top, viewPort.bottom])
    );
  }

  /**
   * 计算视野边界点
   * @param canvas
   * @param originOffset
   * @param zoom
   * @returns
   */
  public static getViewPort = (canvas: HTMLCanvasElement | ISize, originOffset: ICoordinate, zoom: number) => {
    const { width: canvasWidth, height: canvasHeight } = canvas;
    const { x, y } = originOffset;

    const top = (0 - y) / zoom;
    const left = (0 - x) / zoom;

    const bottom = top + canvasHeight / zoom;
    const right = left + canvasWidth / zoom;

    return { top, bottom, left, right };
  };

  /**
   * 获取当前的渲染像素比例
   * @param context
   * @returns
   */
  public static getPixelRatio = (context: any) => {
    if (!context || !window) {
      return 1;
    }

    const backingStore =
      context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1;

    return (window.devicePixelRatio || 1) / backingStore;
  };
}
