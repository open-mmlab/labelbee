/**
 * It can expand various types of operations
 *
 * @file PointCloud 2D Operation
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import AxisUtils from '@/utils/tool/AxisUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import StyleUtils from '@/utils/tool/StyleUtils';
import PolygonOperation from './polygonOperation';

class PointCloud2dOperation extends PolygonOperation {
  public renderStaticPolygon() {
    if (this.isHidden === false) {
      this.polygonList?.forEach((polygon) => {
        if ([this.selectedID, this.editPolygonID].includes(polygon.id)) {
          return;
        }
        const { attribute } = polygon;
        const toolColor = this.getColor(attribute);
        const toolData = StyleUtils.getStrokeAndFill(toolColor, polygon.valid);
        const transformPointList = AxisUtils.changePointListByZoom(polygon.pointList || [], this.zoom, this.currentPos);

        DrawUtils.drawPolygonWithFillAndLine(this.canvas, transformPointList, {
          fillColor: 'transparent',
          strokeColor: toolData.stroke,
          pointColor: 'white',
          thickness: this.style?.width ?? 2,
          lineCap: 'round',
          isClose: true,
          lineType: this.config?.lineType,
        });

        DrawUtils.drawLine(this.canvas, transformPointList[0], transformPointList[1], {
          color: 'red',
          thickness: 3,
        });
      });
    }
  }

  public renderSelectedPolygon() {
    if (this.selectedID) {
      const selectdPolygon = this.selectedPolygon;

      if (selectdPolygon) {
        const toolColor = this.getColor(selectdPolygon.attribute);
        const toolData = StyleUtils.getStrokeAndFill(toolColor, selectdPolygon.valid, { isSelected: true });

        const polygon = AxisUtils.changePointListByZoom(selectdPolygon.pointList, this.zoom, this.currentPos);

        DrawUtils.drawSelectedPolygonWithFillAndLine(this.canvas, polygon, {
          fillColor: 'transparent',
          strokeColor: toolData.stroke,
          pointColor: 'white',
          thickness: 2,
          lineCap: 'round',
          isClose: true,
          lineType: this.config?.lineType,
        });

        DrawUtils.drawLine(this.canvas, polygon[0], polygon[1], {
          color: 'red',
          thickness: 3,
        });
      }
    }
  }
}

export default PointCloud2dOperation;
