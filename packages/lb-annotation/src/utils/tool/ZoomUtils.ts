import { EGrowthMode } from '../../constant/annotation';
import MathUtils from '../MathUtils';

const ZOOM_LEVEL: number[] = [1, 5, 10, 20, 30, 50, 80, 100].concat(
  Array.from({ length: 9 }).map((i, index) => (index + 2) * 100),
);

export default class ZoomUtils {
  // 阶级缩放
  public static zoomChanged = (zoom: number, isZoomIn: boolean, growthMode = EGrowthMode.Linear) => {
    switch (growthMode) {
      case EGrowthMode.Intelligence: {
        const maxZoom = Math.max(...ZOOM_LEVEL);
        const minZoom = Math.min(...ZOOM_LEVEL);

        const zoomIndex = ZOOM_LEVEL.slice(0, ZOOM_LEVEL.length).findIndex(
          (i, index) => zoom >= i && (zoom < ZOOM_LEVEL[index + 1] || i === maxZoom),
        );

        let newZoom;
        /* 如果在范围中找到下一个的缩放值，根据当前的缩或放给出边界的值 */
        if (zoomIndex === -1) {
          if (zoom >= minZoom && zoom <= maxZoom) {
            newZoom = isZoomIn ? maxZoom : minZoom;
          } else {
            newZoom = isZoomIn ? minZoom : zoom;
          }
        } else {
          // 根据当前缩放落在范围，计算出一下个缩放值
          const newZoomIndex = isZoomIn ? zoomIndex + 1 : zoomIndex - (ZOOM_LEVEL.includes(zoom) ? 1 : 0);
          newZoom = ZOOM_LEVEL[MathUtils.withinRange(newZoomIndex, [0, ZOOM_LEVEL.length - 1])];
        }

        return newZoom;
      }

      default: {
        const ratio = isZoomIn ? 2 : 1 / 2;
        return zoom * ratio;
      }
    }
  };

  // 滚轮缩放
  public static wheelChangePos = (
    imgNode: HTMLImageElement,
    coord: ICoordinate,
    operator: 1 | -1 | 0,
    oldCurrentPos: ICoordinate,
    options: Partial<{
      zoom: number;
      innerZoom: number;
      basicZoom: number;
      zoomMax: number;
      rotate: number;
    }> = {},
  ): { currentPos: ICoordinate; zoom: number; imgInfo: ISize; ratio: number } | null => {
    const { zoom = 1, innerZoom = 1, basicZoom = 1, zoomMax = 1000, rotate = 0 } = options;
    const { x, y } = oldCurrentPos;

    // 更改放大后图片的位置以及倍数, operator: 1 放大， -1 缩小， 0 放大
    const ratio = parseFloat((zoom + 1 / 10).toFixed(1)) / 5;

    if (imgNode && coord) {
      let { width, height } = imgNode;
      if ([90, 270].includes(rotate)) {
        width = imgNode.height;
        height = imgNode.width;
      }

      // 注意首先要计算zoom之前的比例，故通过 innerZoom 进行计算
      const imgWidth = width * innerZoom;
      const imgHeight = height * innerZoom;
      const offsetLeft = coord.x - x;
      const offsetTop = coord.y - y; //  点击位置相对与边框长度

      const ratioX = offsetLeft / imgWidth;
      const ratioY = offsetTop / imgHeight;

      let currentZoom = zoom + operator * ratio;

      // 限制缩放范围
      currentZoom = MathUtils.withinRange(currentZoom, [basicZoom, zoomMax]);

      const changeX = width * currentZoom * ratioX;
      const changeY = height * currentZoom * ratioY;

      const currentX = x + (offsetLeft - changeX);
      const currentY = y + (offsetTop - changeY);

      return {
        zoom: currentZoom,
        currentPos: {
          x: currentX,
          y: currentY,
        },
        imgInfo: {
          width: width * currentZoom,
          height: height * currentZoom,
        },
        ratio,
      };
    }
    return null;
  };
}
