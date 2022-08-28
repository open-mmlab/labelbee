/**
 * It can expand various types of operations
 *
 * @file PointCloud 2D Operation
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

import { ESortDirection } from '@/constant/annotation';
import { EPolygonPattern } from '@/constant/tool';
import { IPolygonData, IPolygonPoint } from '@/types/tool/polygon';
import AxisUtils from '@/utils/tool/AxisUtils';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import DrawUtils from '@/utils/tool/DrawUtils';
import PolygonUtils from '@/utils/tool/PolygonUtils';
import StyleUtils from '@/utils/tool/StyleUtils';
import PolygonOperation, { IPolygonOperationProps } from './polygonOperation';

interface IPointCloud2dOperationProps {
  showDirectionLine?: boolean;
  forbidAddNew?: boolean;
}

class PointCloud2dOperation extends PolygonOperation {
  public showDirectionLine: boolean;

  public forbidAddNew: boolean;

  private selectedIDs: string[] = [];

  constructor(props: IPolygonOperationProps & IPointCloud2dOperationProps) {
    super(props);

    this.showDirectionLine = props.showDirectionLine ?? true;
    this.forbidAddNew = props.forbidAddNew ?? false;
  }

  get getSelectedIDs() {
    return this.selectedIDs;
  }

  /**
   * Update selectedIDs and rerender
   * @param selectedIDs
   */
  public setSelectedIDs(selectedIDs: string[]) {
    this.selectedIDs = selectedIDs;
    this.setSelectedID(this.selectedIDs.length === 1 ? this.selectedIDs[0] : '');
    this.render();
  }

  public deleteSelectedID() {
    super.deleteSelectedID();
    /** ID not existed and empty selectedID */
    this.selectedIDs = [];
    this.emit('deleteSelectedIDs');
  }

  /**
   * Right click event
   * @override
   */
  public rightMouseUp = (e: MouseEvent) => {
    if (this.drawingPointList.length > 0) {
      this.addDrawingPointToPolygonList();
      return;
    }

    if (e.ctrlKey && this.hoverID) {
      this.emit('addSelectedIDs', this.hoverID);
    } else {
      this.emit('setSelectedIDs', this.hoverID);
    }
  };

  public get selectedPolygons() {
    return PolygonUtils.getPolygonByIDs(this.polygonList, this.selectedIDs);
  }

  /**
   * keydown event
   * @override
   */
  public onKeyDown = () => {};

  /**
   * keyup event
   * @override
   */
  public onKeyUp = () => {};

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
        if ([...this.selectedIDs, this.editPolygonID].includes(polygon.id)) {
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
        if (polygon.isRect === true && this.showDirectionLine === true) {
          this.renderRectPolygonDirection(transformPointList);
        }
      });
    }
  }

  /**
   * Update the show
   * @override
   * */
  public renderSelectedPolygon() {
    this.selectedPolygons?.forEach((polygon) => {
      this.renderSingleSelectedPolygon(polygon);
    });
  }

  public renderSingleSelectedPolygon = (selectedPolygon: IPolygonData) => {
    if (this.selectedPolygons) {
      const toolColor = this.getColor(selectedPolygon.attribute);
      const toolData = StyleUtils.getStrokeAndFill(toolColor, selectedPolygon.valid, { isSelected: true });

      const polygon = AxisUtils.changePointListByZoom(selectedPolygon.pointList, this.zoom, this.currentPos);

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
      if (selectedPolygon.isRect === true && this.showDirectionLine === true) {
        this.renderRectPolygonDirection(polygon);
      }
    }
  };

  public renderRectPolygonDirection(polygon: IPolygonPoint[]) {
    if (polygon.length < 2) {
      return;
    }

    DrawUtils.drawLine(this.canvas, polygon[0], polygon[1], {
      color: 'red',
      thickness: 3,
    });
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
      this.setSelectedIDs([nextSelectedResult.id]);
    }
    this.render();

    return [nextSelectedResult.id];
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

  /**
   * Overwrite and prevent selectedChange emit
   * @override
   */
  public setSelectedID(newID?: string) {
    const oldID = this.selectedID;
    if (newID !== oldID && oldID) {
      // 触发文本切换的操作

      this._textAttributInstance?.changeSelected();
    }

    if (!newID) {
      this._textAttributInstance?.clearTextAttribute();
    }

    this.selectedID = newID;
    this.render();
  }

  public addPointInDrawing(e: MouseEvent) {
    if (this.forbidAddNew) {
      return;
    }
    super.addPointInDrawing(e);
  }
}

export default PointCloud2dOperation;

export { IPointCloud2dOperationProps };
