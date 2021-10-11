import { cloneDeep } from 'lodash';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import TagUtils from '@/utils/tool/TagUtils';
import { DEFAULT_TEXT_OFFSET } from '../../constant/annotation';
import { EToolName } from '../../constant/tool';
import { IPolygonData } from '../../types/tool/polygon';
import AttributeUtils from '../../utils/tool/AttributeUtils';
import AxisUtils from '../../utils/tool/AxisUtils';
import DrawUtils from '../../utils/tool/DrawUtils';
import StyleUtils from '../../utils/tool/StyleUtils';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';

const TEXT_ATTRIBUTE_OFFSET = {
  x: 8,
  y: 26,
};
interface ICheckResult {
  result: Array<IPolygonData | IRect | ITagResult>;
  toolName: EToolName;
  config: string[];
}

interface ICheckOperationProps extends IBasicToolOperationProps {
  resultList: ICheckResult[];
}

class CheckOperation extends BasicToolOperation {
  public resultList: ICheckResult[];

  public hoverID: string[];
  public fillID: string[];

  constructor(props: ICheckOperationProps) {
    super(props);
    this.resultList = [];
    this.hoverID = [];
    this.fillID = [];
    this.render = this.render.bind(this);
    this.drawPolygon = this.drawPolygon.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawTag = this.drawTag.bind(this);

    // 设置默认 cursor
    this.setShowDefaultCursor(true);
  }

  public setResult(result: ICheckResult[]) {
    this.resultList = cloneDeep(result);
    this.render();
  }

  public drawPolygon(polygonList: IPolygonData[], config: any) {
    polygonList?.forEach((polygon) => {
      const toolColor = this.getColor(polygon.attribute, config);
      const toolData = StyleUtils.getStrokeAndFill(toolColor, polygon.valid);
      let thickness = this.style?.width ?? 2;
      if (this.hoverID.includes(polygon.id)) {
        thickness = 4;
        DrawUtils.drawPolygonWithFillAndLine(
          this.canvas,
          AxisUtils.changePointListByZoom(polygon.pointList, this.zoom, this.currentPos),
          {
            fillColor: toolData.fill,
            strokeColor: toolData.stroke,
            pointColor: 'white',
            thickness,
            lineCap: 'round',
            isClose: true,
            lineType: config?.lineType,
          },
        );
      } else {
        DrawUtils.drawPolygon(
          this.canvas,
          AxisUtils.changePointListByZoom(polygon.pointList, this.zoom, this.currentPos),
          {
            color: toolData.fill,
            lineType: this.config?.lineType,
            thickness,
            isClose: true,
          },
        );
      }
      DrawUtils.drawText(
        this.canvas,
        AxisUtils.changePointByZoom(polygon.pointList[0], this.zoom, this.currentPos),
        AttributeUtils.getAttributeShowText(polygon.attribute, config?.attributeList ?? []) ?? '',
        {
          color: toolData.stroke,
          ...DEFAULT_TEXT_OFFSET,
        },
      );
      const transformPointList = AxisUtils.changePointListByZoom(polygon.pointList || [], this.zoom, this.currentPos);
      const endPoint = transformPointList[transformPointList.length - 1];
      DrawUtils.drawText(
        this.canvas,
        { x: endPoint.x + TEXT_ATTRIBUTE_OFFSET.x, y: endPoint.y + TEXT_ATTRIBUTE_OFFSET.y },
        polygon?.textAttribute,
        {
          color: toolData.stroke,
          ...DEFAULT_TEXT_OFFSET,
        },
      );
    });
  }

  public drawRect(rectList: IRect[], config: any) {
    rectList?.forEach((rect) => {
      let thickness = 1;
      if (this.hoverID.includes(rect.id)) {
        thickness = 3;
      }
      const toolColor = this.getColor(rect.attribute, config);
      const renderRect = AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos);
      DrawUtils.drawRect(this.canvas, renderRect, {
        color: rect?.valid ? toolColor.valid.stroke : toolColor.invalid.stroke,
        thickness,
      });

      if (this.fillID.includes(rect.id)) {
        DrawUtils.drawRectWithFill(this.canvas, renderRect, {
          color: rect?.valid ? toolColor.valid.fill : toolColor.invalid.fill,
        });
      }
    });
  }

  public drawTag(tagList: ITagResult[], config: any) {
    const tagInfoList = tagList.reduce((acc: any[], cur: any) => {
      return [
        ...acc,
        ...(config?.inputList
          ? TagUtils.getTagNameList(cur.result, config.inputList)
          : TagUtils.getTagnameListWithoutConfig(cur.result)),
      ];
    }, []);
    DrawUtils.drawTag(this.canvas, tagInfoList);
  }

  public setHoverID(hoverID: string[]) {
    this.hoverID = hoverID;
    this.render();
  }

  public setFillID(fillID: string[]) {
    this.fillID = fillID;
    this.render();
  }

  public render() {
    super.render();
    this.resultList?.forEach((item: any) => {
      switch (item?.toolName) {
        case EToolName.Rect:
          this.drawRect(item.result, CommonToolUtils.jsonParser(item.config));
          break;
        case EToolName.Polygon:
          this.drawPolygon(item.result, CommonToolUtils.jsonParser(item.config));
          break;
        case EToolName.Tag:
          this.drawTag(item.result, CommonToolUtils.jsonParser(item.config));
          break;
        default:
          break;
      }
    });
  }

  /**
   * 同步操作中的基础信息
   */
  public exportData() {
    return [[], {}];
  }
}

export default CheckOperation;
