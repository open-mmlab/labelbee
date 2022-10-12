/**
 * @file Update PointCloud Status
 * @createDate 2022-08-26
 * @author Ron <ron.f.luo@gmail.com>
 */

import { useContext, useState } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { cTool } from '@labelbee/lb-annotation';

const { EToolName, EPolygonPattern } = cTool;

export const useStatus = () => {
  const { topViewInstance, mainViewInstance, pointCloudBoxList, setPointCloudResult } =
    useContext(PointCloudContext);
  const [pointCloudPattern, setPointCloudPattern] = useState(EToolName.Rect);

  // Clear All PointView Data
  const clearAllResult = () => {
    pointCloudBoxList.forEach((v) => {
      mainViewInstance?.removeObjectByName(v.id);
    });
    mainViewInstance?.render();

    setPointCloudResult([]);
    topViewInstance?.pointCloud2dOperation.clearActiveStatus();
    topViewInstance?.pointCloud2dOperation.clearResult();
  };

  const updatePointCloudPattern = (toolName: any) => {
    const polygon2dOperation = topViewInstance?.pointCloud2dOperation;
    if (!polygon2dOperation) {
      return;
    }

    polygon2dOperation.clearActiveStatus();

    switch (toolName) {
      case EToolName.Rect:
        polygon2dOperation.setPattern(EPolygonPattern.Rect);
        setPointCloudPattern(EToolName.Rect);

        break;
      case EToolName.Polygon:
        polygon2dOperation.setPattern(EPolygonPattern.Normal);
        setPointCloudPattern(EToolName.Polygon);
        break;
    }
  };

  return {
    clearAllResult,
    updatePointCloudPattern,
    pointCloudPattern,
  };
};
