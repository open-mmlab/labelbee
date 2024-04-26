/**
 * @file Update PointCloud Status
 * @createDate 2022-08-26
 * @author Ron <ron.f.luo@gmail.com>
 */

import { useContext, useMemo } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { cTool } from '@labelbee/lb-annotation';
import { useHistory } from './useHistory';
import { EPointCloudPattern } from '@labelbee/lb-utils';

const { EToolName, EPolygonPattern } = cTool;

export const useStatus = () => {
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    setPointCloudResult,
    setPointCloudSphereList,
    setPolygonList,
    setRectList,
    pointCloudPattern,
    setPointCloudPattern,
    syncAllViewPointCloudColor,
    globalPattern,
    setLineList,
  } = useContext(PointCloudContext);
  const { pushHistoryWithList } = useHistory();

  // Clear All PointView Data
  const clearAllResult = () => {
    mainViewInstance?.clearAllBox();
    mainViewInstance?.clearAllSphere();
    mainViewInstance?.render();

    setPointCloudResult([]);
    setPolygonList([]);
    setPointCloudSphereList([]);
    setLineList([]);
    setRectList([]);

    topViewInstance?.toolScheduler.clearStatusAndResult();

    syncAllViewPointCloudColor([]);

    // Add History
    pushHistoryWithList({ pointCloudBoxList: [], polygonList: [], pointCloudSphereList: [] });
  };

  // Clear results of sideview and backview
  const clearSBViewResult = () => {
    sideViewInstance?.toolInstance.clearResult();
    backViewInstance?.toolInstance.clearResult();
  };

  const updatePointCloudPattern = (toolName: any) => {
    if (toolName === pointCloudPattern) {
      return;
    }

    const instanceArr = [topViewInstance, sideViewInstance, backViewInstance];

    switch (toolName) {
      case EToolName.Rect:
        clearSBViewResult();
        instanceArr.forEach((instance) => {
          instance?.switchToCanvas(EToolName.PointCloudPolygon);
          instance?.toolInstance.setPattern(EPolygonPattern.Rect);
        });
        setPointCloudPattern(EToolName.Rect);
        break;
      case EToolName.Polygon:
        clearSBViewResult();
        instanceArr.forEach((instance) => {
          instance?.switchToCanvas(EToolName.PointCloudPolygon);
          instance?.toolInstance.setPattern(EPolygonPattern.Normal);
        });
        setPointCloudPattern(EToolName.Polygon);
        break;
      case EToolName.Point:
        clearSBViewResult();
        instanceArr.forEach((instance) => {
          instance?.switchToCanvas(EToolName.Point);
        });
        setPointCloudPattern(EToolName.Point);
        break;
      case EToolName.Line:
        clearSBViewResult();
        instanceArr.forEach((instance) => {
          instance?.switchToCanvas(EToolName.Line);
        });
        setPointCloudPattern(EToolName.Line);
        break;
    }
  };

  const isPointCloudDetectionPattern = useMemo(() => {
    return globalPattern === EPointCloudPattern.Detection;
  }, [globalPattern]);

  const isPointCloudSegmentationPattern = useMemo(() => {
    return globalPattern === EPointCloudPattern.Segmentation;
  }, [globalPattern]);

  return {
    clearAllResult,
    updatePointCloudPattern,
    pointCloudPattern,
    isPointCloudDetectionPattern,
    isPointCloudSegmentationPattern,
  };
};
