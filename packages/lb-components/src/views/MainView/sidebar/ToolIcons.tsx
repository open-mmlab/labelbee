/**
 * @file Tool options on tool's sidebar
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @createdate 2022-07-14
 */

import { EToolName } from '@/data/enums/ToolType';
import React from 'react';
import { sidebarCls } from './index';
import lineSvg from '@/assets/annotation/lineTool/icon_line.svg';
import lineASvg from '@/assets/annotation/lineTool/icon_line_a.svg';
import pointSvg from '@/assets/annotation/pointTool/icon_point.svg';
import pointASvg from '@/assets/annotation/pointTool/icon_point_a.svg';
import PolygonASvg from '@/assets/annotation/polygonTool/icon_polygon_a.svg';
import PolygonSvg from '@/assets/annotation/polygonTool/icon_polygon.svg';
import rectSvg from '@/assets/annotation/rectTool/icon_rect.svg';
import rectASvg from '@/assets/annotation/rectTool/icon_rect_a.svg';
import { cTool } from '@labelbee/lb-annotation';

const { EPointCloudName, TOOL_NAME } = cTool;

const toolList = [
  {
    toolName: EToolName.Rect,
    commonSvg: rectSvg,
    selectedSvg: rectASvg,
  },
  {
    toolName: EToolName.Polygon,
    commonSvg: PolygonSvg,
    selectedSvg: PolygonASvg,
  },
  {
    toolName: EToolName.Line,
    commonSvg: lineSvg,
    selectedSvg: lineASvg,
  },
  {
    toolName: EToolName.Point,
    commonSvg: pointSvg,
    selectedSvg: pointASvg,
  },
];

export const ToolIcons = ({
  toolName,
  selectedToolName,
}: {
  toolName: string;
  selectedToolName?: string;
}) => {
  const renderTools = toolList?.filter((item) => {
    if (toolName === (EPointCloudName.PointCloud as unknown as EToolName)) {
      return [EToolName.Polygon, EToolName.Rect].includes(item?.toolName);
    }

    return item?.toolName === toolName;
  });

  const hasMultiTools = renderTools.length > 1;

  return (
    <div className={`${sidebarCls}__level`}>
      {renderTools.map((tool) => (
        <span className={`${sidebarCls}__toolOption`} key={tool.toolName}>
          <img
            className={`${sidebarCls}__singleTool`}
            src={
              hasMultiTools && selectedToolName === tool.toolName
                ? tool?.selectedSvg
                : tool?.commonSvg
            }
          />
          <span>{TOOL_NAME[tool.toolName]}</span>
        </span>
      ))}
    </div>
  );
};
