/**
 * @file Update PointCloud Status
 * @createDate 2022-08-26
 * @author Ron <ron.f.luo@gmail.com>
 */

import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { cTool } from '@labelbee/lb-annotation';
import { useHistory } from './useHistory';

const { EToolName, EPolygonPattern } = cTool;

export const useStatus = () => {
  const {
    topViewInstance,
    mainViewInstance,
    pointCloudBoxList,
    setPointCloudResult,
    setPolygonList,
    pointCloudPattern,
    setPointCloudPattern,
    syncAllViewPointCloudColor,
  } = useContext(PointCloudContext);
  const { pushHistoryWithList } = useHistory();

  // Clear All PointView Data
  const clearAllResult = () => {
    pointCloudBoxList.forEach((v) => {
      mainViewInstance?.removeObjectByName(v.id);
    });
    mainViewInstance?.render();

    setPointCloudResult([]);
    setPolygonList([]);

    topViewInstance?.pointCloud2dOperation.clearActiveStatus();
    topViewInstance?.pointCloud2dOperation.clearResult();

    syncAllViewPointCloudColor([]);

    // Add History
    pushHistoryWithList({ pointCloudBoxList: [], polygonList: [] });
  };

  const updatePointCloudPattern = (toolName: any) => {
    if (toolName === pointCloudPattern) {
      return;
    }

    switch (toolName) {
      case EToolName.Rect:
        topViewInstance?.switchToCanvas(EToolName.PointCloudPolygon);
        topViewInstance?.toolInstance.setPattern(EPolygonPattern.Rect);
        // polygon2dOperation.setPattern(EPolygonPattern.Rect);
        setPointCloudPattern(EToolName.Rect);
        break;
      case EToolName.Polygon:
        topViewInstance?.switchToCanvas(EToolName.PointCloudPolygon);
        topViewInstance?.toolInstance.setPattern(EPolygonPattern.Normal);
        // polygon2dOperation.setPattern(EPolygonPattern.Normal);
        setPointCloudPattern(EToolName.Polygon);
        break;
      case EToolName.Point:
        // polygon2dOperation.setPattern(EPolygonPattern.Point);
        topViewInstance?.switchToCanvas(EToolName.Point);
        setPointCloudPattern(EToolName.Point);
        break;
      case EToolName.Line:
        topViewInstance?.switchToCanvas(EToolName.Line);
        setPointCloudPattern(EToolName.Line);
        break;
    }
  };

  return {
    clearAllResult,
    updatePointCloudPattern,
    pointCloudPattern,
  };
};
