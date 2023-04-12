/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Tool utils
 * @date 2022-06-20
 */

import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName, EPointCloudName, EToolName } = cTool;

class ToolUtils {
  public static isVideoTool(tool?: string) {
    return tool ? (Object.values(EVideoToolName) as string[]).includes(tool) : false;
  }

  public static isPointCloudTool(tool?: string) {
    return tool ? (Object.values(EPointCloudName) as string[]).includes(tool) : false;
  }

  public static getPointCloudToolList() {
    return [EToolName.Point, EToolName.Line, EToolName.PointCloudPolygon]
  }
}

export default ToolUtils;
