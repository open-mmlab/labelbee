import { PointCloudContext } from './PointCloudContext';
import { useRotate } from './hooks/useRotate';
import { useBoxes } from './hooks/useBoxes';
import { useSingleBox } from './hooks/useSingleBox';
import React, { useContext, useEffect } from 'react';
import { cTool } from '@labelbee/lb-annotation';
import { message } from 'antd';
import { connect } from 'react-redux';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { useCustomToolInstance } from '@/hooks/annotation';
import { useStatus } from './hooks/useStatus';
import { jsonParser } from '@/utils';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { LabelBeeContext } from '@/store/ctx';
import { useHistory } from './hooks/useHistory';
import { useAttribute } from './hooks/useAttribute';

const { EPolygonPattern } = cTool;

const PointCloudListener: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ptCtx = useContext(PointCloudContext);
  const { changeSelectedBoxValid, selectNextBox, selectPrevBox, updateSelectedBox } =
    useSingleBox();
  const { clearAllResult } = useStatus();
  const basicInfo = jsonParser(currentData.result);
  const { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes } = useBoxes();
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });
  const { updateRotate } = useRotate({ currentData });
  const { updatePointCloudData } = usePointCloudViews();
  const { redo, undo, pushHistoryWithList } = useHistory();
  const { syncThreeViewsAttribute, reRenderPointCloud3DBox } = useAttribute();

  const keydownEvents = (lowerCaseKey: string, e: KeyboardEvent) => {
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

      case 'tab':
        if (e.shiftKey) {
          selectPrevBox();
          break;
        }
        selectNextBox();
        break;

      case 'f':
        changeSelectedBoxValid();
        break;

      default: {
        return;
      }
    }
  };

  const ctrlKeydownEvents = (lowerCaseKey: string, e: KeyboardEvent) => {
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
      case 'z': {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        break;
      }

      default:
        break;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const lowerCaseKey = e.key.toLocaleLowerCase();

    if (e.ctrlKey) {
      ctrlKeydownEvents(lowerCaseKey, e);
      return;
    }

    keydownEvents(lowerCaseKey, e);
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
    updatePointCloudData?.();
  }, [currentData, ptCtx.mainViewInstance]);

  // Update the listener of toolInstance.
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
        syncThreeViewsAttribute(newAttribute);
        reRenderPointCloud3DBox(selectBox);
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

    toolInstanceRef.current.redo = () => {
      redo();
    };

    toolInstanceRef.current.undo = () => {
      undo();
    };

    toolInstanceRef.current.setValid = (valid: boolean) => {
      toolInstanceRef.current.valid = valid;

      // Avoid triggering SetState operations in the reducer phase
      setTimeout(() => {
        ptCtx.setPointCloudValid(valid);

        if (valid === false) {
          clearAllResult();
        }
      });
    };
  }, [ptCtx.pointCloudBoxList, ptCtx.selectedID, ptCtx.valid, ptCtx.polygonList]);

  useEffect(() => {
    toolInstanceRef.current.history = {
      // Origin Result
      pushHistory: (result: any[]) => {
        // Rewrite
        // TODO, The polygon is out of range.
        pushHistoryWithList({ pointCloudBoxList: result });
      },
      initRecord: () => {},
    };
  }, []);

  useEffect(() => {
    // TopViewOperation Emitter
    const syncAttribute = (newAttribute: string) => {
      syncThreeViewsAttribute(newAttribute);
    };

    ptCtx.topViewInstance?.pointCloud2dOperation.on('syncAttribute', syncAttribute);

    return () => {
      ptCtx.topViewInstance?.pointCloud2dOperation.unbind('syncAttribute', syncAttribute);
    };
  }, [ptCtx.topViewInstance]);

  return null;
};

export default connect(aMapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudListener,
);
