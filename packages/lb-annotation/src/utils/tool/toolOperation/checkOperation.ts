import { cloneDeep } from 'lodash';
import { DEFAULT_TEXT_OFFSET } from '../../../constant/annotation';
import { EToolName } from '../../../constant/tool';
import { IPolygonData } from '../../../types/tool/polygon';
import { getAttributeColor } from '../attribute';
import AttributeUtils from '../AttributeUtils';
import AxisUtils from '../AxisUtils';
import { jsonParser } from '../common';
import DrawUtils from '../DrawUtils';
import StyleUtils from '../StyleUtils';
import { getTagNameList, getTagnameListWithoutConfig } from '../tagTool';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';

interface ICheckResult {
  result: Array<IPolygonData | IRect | ITagResult>;
  toolName: EToolName;
}

interface ICheckOperationProps extends IBasicToolOperationProps {
  resultList: ICheckResult[];
}

class CheckOperation extends BasicToolOperation {
  public resultList: ICheckResult[];

  public hoverID: string[];

  constructor(props: ICheckOperationProps) {
    super(props);
    this.resultList = [];
    this.hoverID = [];
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
    });
  }

  public drawRect(rectList: IRect[], config: any) {
    rectList?.forEach((rect) => {
      let thickness = 1;
      if (this.hoverID.includes(rect.id)) {
        thickness = 3;
      }
      DrawUtils.drawRect(this.canvas, AxisUtils.changeRectByZoom(rect, this.zoom, this.currentPos), {
        color: rect?.valid
          ? getAttributeColor(rect.attribute, config?.attributeList ?? [])
          : this.getColor(rect.attribute)?.invalid.stroke,
        thickness,
      });
    });
  }

  public drawTag(tagList: ITagResult[], config: any) {
    const tagInfoList = tagList.reduce((acc: any[], cur: any) => {
      return [
        ...acc,
        ...(config?.inputList ? getTagNameList(cur.result, config.inputList) : getTagnameListWithoutConfig(cur.result)),
      ];
    }, []);
    DrawUtils.drawTag(this.canvas, tagInfoList);
  }

  public setHoverID(hoverID: string[]) {
    this.hoverID = hoverID;
    this.render();
  }

  public render() {
    super.render();
    this.resultList?.forEach((item: any) => {
      switch (item?.toolName) {
        case EToolName.Rect:
          this.drawRect(item.result, jsonParser(item.config));
          break;
        case EToolName.Polygon:
          this.drawPolygon(item.result, jsonParser(item.config));
          break;
        case EToolName.Tag:
          this.drawTag(item.result, jsonParser(item.config));
          break;
        default:
          break;
      }
    });
  }
}

export default CheckOperation;
