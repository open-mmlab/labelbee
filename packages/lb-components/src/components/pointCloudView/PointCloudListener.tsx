import { PointCloudContext } from './PointCloudContext';
import { useRotate } from './hooks/useRotate';
import { useBoxes } from './hooks/useBoxes';
import { useSingleBox } from './hooks/useSingleBox';
import React, { useContext, useEffect } from 'react';
import { cTool } from '@labelbee/lb-annotation';
import { message } from 'antd';
import { connect } from 'react-redux';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';
import { useCustomToolInstance } from '@/hooks/annotation';
import { useStatus } from './hooks/useStatus';
import { jsonParser } from '@/utils';

const { EPolygonPattern } = cTool;

const PointCloudListener: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ptCtx = useContext(PointCloudContext);
  const { changeSelectedBoxValid, selectNextBox, selectPrevBox, updateSelectedBox } =
    useSingleBox();
  const { clearAllResult } = useStatus();
  const { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes } = useBoxes();
  const { toolInstanceRef } = useCustomToolInstance();
  const { updateRotate } = useRotate({ currentData });

  const keydownEvents = (lowerCaseKey: string) => {
    const { topViewInstance, mainViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    const { pointCloud2dOperation: TopPointCloudPolygonOperation } = topViewInstance;

    switch (lowerCaseKey) {
      case 'q': {
        // Q - anticlockwise
        updateRotate(2);
        break;
      }

      case 'e':
        // E - closewise
        updateRotate(-2);

        break;

      case 'g':
        // G ， overturn 180
        updateRotate(180);

        break;

      case 'u':
        {
          // U , change TopOpereation Pattern
          const newPattern =
            TopPointCloudPolygonOperation.pattern === EPolygonPattern.Normal
              ? EPolygonPattern.Rect
              : EPolygonPattern.Normal;
          TopPointCloudPolygonOperation.setPattern(newPattern);
          const POLYGON_PATTERN = {
            [EPolygonPattern.Normal]: 'Normal Pattern',
            [EPolygonPattern.Rect]: 'Rect Pattern',
          };
          message.success(`Change Pattern to ${POLYGON_PATTERN[newPattern]} successfully`);

          // Clear Status
          TopPointCloudPolygonOperation.clearActiveStatus();
          TopPointCloudPolygonOperation.clearDrawingStatus();
        }

        break;

      // +: Increase points size
      case '+':
        mainViewInstance?.updatePointSize(true);
        break;

      // -: Reduce points size
      case '-':
        mainViewInstance?.updatePointSize(false);
        break;

      case 'v':
        ptCtx.setPointCloudValid(!ptCtx.valid);
        break;

      case 'z':
        selectNextBox();
        break;

      case 'c':
        selectPrevBox();
        break;

      case 'f':
        changeSelectedBoxValid();
        break;

      default: {
        return;
      }
    }
  };

  const ctrlKeydownEvents = (lowerCaseKey: string) => {
    switch (lowerCaseKey) {
      case 'c':
        copySelectedBoxes();
        break;
      case 'v':
        pasteSelectedBoxes();
        break;
      case 'a':
        ptCtx.selectedAllBoxes();
        break;
      default:
        break;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const lowerCaseKey = e.key.toLocaleLowerCase();

    if (e.ctrlKey) {
      ctrlKeydownEvents(lowerCaseKey);
      return;
    }

    keydownEvents(lowerCaseKey);
  };

  useEffect(() => {
    const { topViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ptCtx, copiedBoxes]);

  // Page switch data initialization
  useEffect(() => {
    const pointCloud = ptCtx.mainViewInstance;
    if (currentData?.url && pointCloud) {
      pointCloud.loadPCDFile(currentData.url);

      // Clear All Data
      ptCtx.pointCloudBoxList.forEach((v) => {
        pointCloud?.removeObjectByName(v.id);
      });

      if (currentData.result) {
        const boxParamsList = PointCloudUtils.getBoxParamsFromResultList(currentData.result);
        const polygonList = PointCloudUtils.getPolygonListFromResultList(currentData.result);

        // Add Init Box
        boxParamsList.forEach((v: IPointCloudBox) => {
          pointCloud?.generateBox(v);
        });

        ptCtx.setPointCloudResult(boxParamsList);
        ptCtx.setPolygonList(polygonList);
      } else {
        ptCtx.setPointCloudResult([]);
        ptCtx.setPolygonList([]);
      }

      pointCloud.updateTopCamera();

      const valid = jsonParser(currentData.result)?.valid ?? true;
      ptCtx.setPointCloudValid(valid);

      // Clear other view data during initialization
      ptCtx.sideViewInstance?.clearAllData();
      ptCtx.backViewInstance?.clearAllData();
    }
  }, [currentData, ptCtx.mainViewInstance]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [ptCtx.pointCloudBoxList, { valid: ptCtx.valid }];
    };

    toolInstanceRef.current.exportCustomData = () => {
      return {
        renderPolygon: ptCtx.polygonList ?? [],
      };
    };

    toolInstanceRef.current.setDefaultAttribute = (newAttribute: string) => {
      const selectBox = ptCtx.selectedPointCloudBox;
      if (selectBox) {
        selectBox.attribute = newAttribute;

        updateSelectedBox(selectBox);
      }
    };

    toolInstanceRef.current.setSubAttribute = (key: string, value: string) => {
      const selectBox = ptCtx.selectedPointCloudBox;
      if (selectBox) {
        const originSubAttribute = selectBox?.subAttribute ?? {};

        selectBox.subAttribute = {
          ...originSubAttribute,
          [key]: value,
        };

        updateSelectedBox(selectBox);
      }
    };
    toolInstanceRef.current.clearResult = () => {
      clearAllResult?.();
    };
  }, [ptCtx.pointCloudBoxList, ptCtx.selectedID, ptCtx.valid, ptCtx.polygonList]);

  useEffect(() => {
    toolInstanceRef.current.setValid = () => {
      ptCtx.setPointCloudValid(!ptCtx.valid);
    };
  }, [ptCtx.valid]);

  return null;
};

export default connect(aMapStateToProps)(PointCloudListener);
