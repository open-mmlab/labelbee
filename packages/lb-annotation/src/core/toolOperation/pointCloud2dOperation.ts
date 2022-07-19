/**
 * It can expand various types of operations
 *
 * @file PointCloud 2D Operation
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import { ESortDirection } from '@/constant/annotation';
import { EPolygonPattern } from '@/constant/tool';
import AxisUtils from '@/utils/tool/AxisUtils';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import StyleUtils from '@/utils/tool/StyleUtils';
import PolygonOperation from './polygonOperation';

class PointCloud2dOperation extends PolygonOperation {
  public getLineColor() {
    return 'rgba(0, 255, 255, 0.5)';
  }

  /**
   * Add direction
   * @override
   * */
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

        // Only the rectangle shows the direction.
        if (polygon.isRect === true) {
          DrawUtils.drawLine(this.canvas, transformPointList[0], transformPointList[1], {
            color: 'red',
            thickness: 3,
          });
        }
      });
    }
  }

  /**
   * Update the show
   * @override
   * */
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

        // Only the rectangle shows the direction.
        if (selectdPolygon.isRect === true) {
          DrawUtils.drawLine(this.canvas, polygon[0], polygon[1], {
            color: 'red',
            thickness: 3,
          });
        }
      }
    }
  }

  public get currentPolygonListByPattern() {
    return this.polygonList.filter((v) => {
      if (this.pattern === EPolygonPattern.Rect) {
        return v.isRect === true;
      }

      if (this.pattern === EPolygonPattern.Normal) {
        return v.isRect !== true;
      }

      return true;
    });
  }

  /**
   * Filter the polygon by Pattern
   * @override
   * */
  public getHoverID(e: MouseEvent) {
    const coordinate = this.getCoordinateUnderZoom(e);

    // Key Point!
    const currentPolygonList = this.currentPolygonListByPattern;

    const polygonListWithZoom = currentPolygonList.map((polygon) => ({
      ...polygon,
      pointList: AxisUtils.changePointListByZoom(polygon.pointList, this.zoom),
    }));
    return PolygonUtils.getHoverPolygonID(coordinate, polygonListWithZoom, 10, this.config?.lineType);
  }

  /**
   * Filter the polygon by Pattern
   * @override
   * */
  public switchToNextPolygon(sort: ESortDirection = ESortDirection.ascend) {
    // If it is in drawing, return;
    if (this.drawingPointList.length > 0) {
      return;
    }

    // Compared to the original filtering of patterns
    const sortList = this.currentPolygonListByPattern.map((v) => ({
      ...v,
      x: v.pointList[0]?.x ?? 0, // Sort with the first point.
      y: v.pointList[0]?.y ?? 0,
    }));

    const nextSelectedResult = CommonToolUtils.getNextSelectedRectID(sortList, sort, this.selectedID);
    if (nextSelectedResult) {
      this.setSelectedID(nextSelectedResult.id);
    }
    this.render();
  }

  /**
   * Be selected after created.
   * @override
   */
  public setSelectedIdAfterAddingDrawing(newID: string) {
    if (this.drawingPointList.length === 0) {
      return;
    }

    this.setSelectedID(newID);
  }
}

export default PointCloud2dOperation;
