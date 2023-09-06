/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Tool utils
 * @date 2022-06-20
 */

import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName, EPointCloudName, EToolName, EAudioToolName } = cTool;

interface IPoint {
  x: number;
  y: number;
}
class ToolUtils {
  public static isVideoTool(tool?: string) {
    return tool ? (Object.values(EVideoToolName) as string[]).includes(tool) : false;
  }

  public static isAudioTool(tool?: string) {
    return tool ? (Object.values(EAudioToolName) as string[]).includes(tool) : false;
  }

  public static isPointCloudTool(tool?: string) {
    return tool ? (Object.values(EPointCloudName) as string[]).includes(tool) : false;
  }

  public static getPointCloudToolList() {
    return [EToolName.Point, EToolName.Line, EToolName.PointCloudPolygon];
  }

  // Calculate the distance from a point to a line
  public static getPointToLineDistance(
    pt: IPoint, // A point outside the straight line
    begin: IPoint, // Straight line start point
    end: IPoint, // Straight line end point
  ) {
    const A = Math.abs(Math.sqrt(Math.pow(pt.x - begin.x, 2) + Math.pow(pt.y - begin.y, 2)));
    const B = Math.abs(Math.sqrt(Math.pow(pt.x - end.x, 2) + Math.pow(pt.y - end.y, 2)));
    const C = Math.abs(Math.sqrt(Math.pow(begin.x - end.x, 2) + Math.pow(begin.y - end.y, 2)));
    const P = (A + B + C) / 2;
    const area = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)));
    return (2 * area) / C;
  }
}

export default ToolUtils;
