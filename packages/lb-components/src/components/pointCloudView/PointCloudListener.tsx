import { PointCloudContext } from './PointCloudContext';
import { useRotate } from './hooks/useRotate';
import { useBoxes } from './hooks/useBoxes';
import { useSingleBox } from './hooks/useSingleBox';
import React, { useContext, useEffect } from 'react';
import { cTool, AttributeUtils, CommonToolUtils } from '@labelbee/lb-annotation';
import { message } from 'antd';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { useCustomToolInstance } from '@/hooks/annotation';
import { useStatus } from './hooks/useStatus';
import { jsonParser } from '@/utils';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { LabelBeeContext } from '@/store/ctx';
import { useHistory } from './hooks/useHistory';
import { useAttribute } from './hooks/useAttribute';
import { useConfig } from './hooks/useConfig';

const { EPolygonPattern } = cTool;

const PointCloudListener: React.FC<IA2MapStateProps> = ({ currentData, config }) => {
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
  const { syncAllViewsConfig, reRenderTopViewRange } = useConfig();

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
        if (config.attributeList?.length > 0) {
          const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(
            e.keyCode,
            config.attributeList,
          );

          if (keyCode2Attribute !== undefined) {
            toolInstanceRef.current.setDefaultAttribute(keyCode2Attribute);
          }
        }
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
    if (!CommonToolUtils.hotkeyFilter(e)) {
      return;
    }

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
  }, [ptCtx, copiedBoxes, config]);

  useEffect(() => {
    syncAllViewsConfig(config);
  }, [config]);

  useEffect(() => {
    if (config?.radius) {
      reRenderTopViewRange(config?.radius);
    }
  }, [config?.radius]);

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
        resultPolygon: ptCtx.polygonList ?? [],
      };
    };

    toolInstanceRef.current.setDefaultAttribute = (newAttribute: string) => {
      syncThreeViewsAttribute(newAttribute);
      const selectBox = ptCtx.selectedPointCloudBox;
      if (selectBox) {
        selectBox.attribute = newAttribute;

        updateSelectedBox(selectBox);
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

    /**
     * TopView forbid all operations.
     * @param forbidOperation
     */
    toolInstanceRef.current.setForbidOperation = (forbidOperation: boolean) => {
      ptCtx.topViewInstance?.pointCloud2dOperation?.setForbidOperation(forbidOperation);
      if (forbidOperation === true) {
        // Clear Selected Status.
        ptCtx.setSelectedIDs(undefined);
      }
    };

    toolInstanceRef.current.setShowDefaultCursor = (showDefaultCursor: boolean) => {
      ptCtx.topViewInstance?.pointCloud2dOperation?.setShowDefaultCursor(showDefaultCursor);
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
    const toolInstance = ptCtx.topViewInstance?.pointCloud2dOperation;

    if (!toolInstance) {
      return;
    }
    // TopViewOperation Emitter
    const syncAttribute = (newAttribute: string) => {
      syncThreeViewsAttribute(newAttribute);
    };

    const messageError = (error: string) => {
      message.error(error);
    };
    const messageInfo = (info: string) => {
      message.info(info);
    };

    toolInstance.on('syncAttribute', syncAttribute);
    toolInstance.on('messageError', messageError);
    toolInstance.on('messageInfo', messageInfo);

    return () => {
      toolInstance.unbind('syncAttribute', syncAttribute);
      toolInstance.unbind('messageError', messageError);
      toolInstance.unbind('messageInfo', messageInfo);
    };
  }, [ptCtx.topViewInstance]);

  return null;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudListener,
);
