import { PointCloudContext } from './PointCloudContext';
import { useRotate } from './hooks/useRotate';
import { useRotateEdge } from './hooks/useRotateEdge';
import { useBoxes } from './hooks/useBoxes';
import { useSingleBox } from './hooks/useSingleBox';
import { useSphere } from './hooks/useSphere';
import React, { useContext, useEffect } from 'react';
import {
  cTool,
  AttributeUtils,
  CommonToolUtils,
  EToolName,
  EPointCloudName,
} from '@labelbee/lb-annotation';
import { message } from 'antd';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { ICustomToolInstance } from '@/hooks/annotation';
import { useStatus } from './hooks/useStatus';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { LabelBeeContext } from '@/store/ctx';
import { useHistory } from './hooks/useHistory';
import { useAttribute } from './hooks/useAttribute';
import { ICoordinate } from '@labelbee/lb-utils/dist/types/types/common';
import { useConfig } from './hooks/useConfig';
import { usePolygon } from './hooks/usePolygon';
import { useLine } from './hooks/useLine';
import { useUpdatePointCloudColor } from './hooks/useUpdatePointCloudColor';
import { useTranslation } from 'react-i18next';
import { IFileItem } from '@/types/data';
import { useLatest } from 'ahooks';

const { EPolygonPattern } = cTool;

interface IProps extends IA2MapStateProps {
  checkMode?: boolean;
  toolInstanceRef: React.MutableRefObject<ICustomToolInstance>;
  setResourceLoading?: (loading: boolean) => void;
}

const PointCloudListener: React.FC<IProps> = ({
  currentData,
  config,
  checkMode,
  configString,
  imgIndex,
  toolInstanceRef,
  setResourceLoading,
}) => {
  const ptCtx = useContext(PointCloudContext);
  const {
    changeSelectedBoxValid,
    selectNextBox,
    selectPrevBox,
    updateSelectedBox,
    deleteSelectedPointCloudBoxAndPolygon,
  } = useSingleBox();
  const { selectedSphere, updatePointCloudSphere } = useSphere();
  const { clearAllResult, updatePointCloudPattern } = useStatus();
  const { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes } = useBoxes({
    config,
    currentData,
  });

  const { updateRotate } = useRotate({ currentData });
  const { updateRotateEdge } = useRotateEdge({ currentData });
  const { updatePointCloudData, topViewSelectedChanged } = usePointCloudViews({
    setResourceLoading,
  });
  const {
    redo,
    undo,
    pushHistoryWithList,
    pushHistoryUnderUpdatePolygon,
    pushHistoryUnderUpdateLine,
  } = useHistory();
  const { syncThreeViewsAttribute } = useAttribute();
  const { syncAllViewsConfig, reRenderTopViewRange } = useConfig();
  const { selectedPolygon } = usePolygon();
  const { selectedLine } = useLine();
  const { t } = useTranslation();
  const { updatePointCloudColor } = useUpdatePointCloudColor(setResourceLoading, config);

  // For event calling or etc to avoid react hook re-bind
  const currentDataRef = useLatest(currentData);

  const updatePolygonOffset = (offset: Partial<ICoordinate>) => {
    const { topViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }
    topViewInstance.pointCloud2dOperation?.updateSelectedPolygonsPoints(offset);
  };

  const keydownEvents = (lowerCaseKey: string, e: KeyboardEvent) => {
    const { topViewInstance, mainViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    const { pointCloud2dOperation: TopPointCloudPolygonOperation } = topViewInstance;

    switch (lowerCaseKey) {
      case 'q': {
        // Q - anticlockwise
        updateRotate(ptCtx.rectRotateSensitivity);
        break;
      }

      case 'e':
        // E - clockwise
        updateRotate(-Number(ptCtx.rectRotateSensitivity));
        break;

      case 'g':
        // G ， overturn 90
        updateRotateEdge(-90);

        break;

      case 'u':
        {
          // U , change TopOpereation Pattern
          const newToolName =
            TopPointCloudPolygonOperation.pattern === EPolygonPattern.Normal
              ? EToolName.Rect
              : EToolName.Polygon;
          updatePointCloudPattern(newToolName);

          // Tips
          const POLYGON_PATTERN = {
            [EToolName.Polygon]: t('PolygonPattern'),
            [EToolName.Rect]: t('RectPattern'),
          };
          message.success(t('ChangePatternMsg', { pattern: POLYGON_PATTERN[newToolName] }));

          // Clear Status
          TopPointCloudPolygonOperation.clearActiveStatus();
          TopPointCloudPolygonOperation.clearDrawingStatus();
        }

        break;

      // +: Increase points size
      case '+':
        mainViewInstance?.updatePointSize({ zoomIn: true });
        break;

      // -: Reduce points size
      case '-':
        mainViewInstance?.updatePointSize({ zoomIn: false });
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
        e.preventDefault();
        break;

      case 'f':
        changeSelectedBoxValid();
        break;

      case 'arrowup':
        updatePolygonOffset({ y: -1 });
        break;

      case 'arrowdown':
        updatePolygonOffset({ y: 1 });
        break;

      case 'arrowleft':
        updatePolygonOffset({ x: -1 });
        break;

      case 'arrowright':
        updatePolygonOffset({ x: 1 });
        break;

      case 'delete':
        deleteSelectedPointCloudBoxAndPolygon(currentDataRef.current);
        break;

      default: {
        if (config.attributeList?.length > 0) {
          const keyCode2Attribute = AttributeUtils.getAttributeByKeycode(
            e.keyCode,
            config.attributeList,
          );

          if (keyCode2Attribute !== undefined) {
            toolInstanceRef.current?.setDefaultAttribute(keyCode2Attribute);
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
        e.preventDefault();
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

  const onKeyDown = useLatest((e: KeyboardEvent) => {
    if (!CommonToolUtils.hotkeyFilter(e) || checkMode === true) {
      return;
    }

    const lowerCaseKey = e.key.toLocaleLowerCase();

    if (e.ctrlKey) {
      ctrlKeydownEvents(lowerCaseKey, e);
      return;
    }

    keydownEvents(lowerCaseKey, e);
  });

  useEffect(() => {
    const topViewInstance = ptCtx.topViewInstance;
    if (!topViewInstance) {
      return;
    }

    const { addEventListener } = ptCtx.windowKeydownListenerHook;
    const listener = (e: KeyboardEvent) => onKeyDown.current(e);
    const dispose = addEventListener(listener);

    return dispose;
  }, [ptCtx, ptCtx.topViewInstance, ptCtx.windowKeydownListenerHook]);

  useEffect(() => {
    syncAllViewsConfig(config);
  }, [configString]);

  useEffect(() => {
    if (config?.radius) {
      reRenderTopViewRange(config?.radius);
    }
  }, [config?.radius]);

  // Page switch data initialization
  useEffect(() => {
    updatePointCloudData?.();
  }, [imgIndex, ptCtx.mainViewInstance]);

  useEffect(() => {
    ptCtx.setHideAttributes([]);
  }, [imgIndex]);

  // Update the listener of toolInstance.
  useEffect(() => {
    toolInstanceRef.current.setDefaultAttribute = (newAttribute: string) => {
      syncThreeViewsAttribute(newAttribute);

      /**
       * The logic for extracting the updated color of the original point cloud due to changes in the main attribute,
       * which originally only supported single selection, now supports multiple selection, and merges to reduce the number of updates
       */
      updatePointCloudColor(newAttribute);

      if (selectedPolygon) {
        pushHistoryUnderUpdatePolygon({ ...selectedPolygon, attribute: newAttribute });
      }
      if (selectedLine) {
        pushHistoryUnderUpdateLine({ ...selectedLine, attribute: newAttribute });
      }
      if (selectedSphere) {
        const newSphereList = updatePointCloudSphere({
          ...selectedSphere,
          attribute: newAttribute,
        });
        if (ptCtx.mainViewInstance) {
          ptCtx.mainViewInstance?.generateSpheres(newSphereList);
          topViewSelectedChanged({
            newSelectedSphere: selectedSphere,
            newSphereList: newSphereList,
          });
        }
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
        if (ptCtx.mainViewInstance && ptCtx.selectedPointCloudBox) {
          ptCtx.mainViewInstance.generateBox(ptCtx.selectedPointCloudBox);
        }
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

    toolInstanceRef.current.asyncData = (newData: IFileItem) => {
      // Next Tick to update.
      setTimeout(() => {
        updatePointCloudData?.(newData);
      });
    };
  }, [
    ptCtx.pointCloudBoxList,
    ptCtx.pointCloudSphereList,
    ptCtx.selectedID,
    ptCtx.selectedIDs,
    ptCtx.valid,
    ptCtx.polygonList,
    ptCtx.lineList,
    ptCtx.mainViewInstance,
    ptCtx.ptSegmentInstance,
  ]);

  /**
   * PointCloud Segmentation
   */
  useEffect(() => {
    toolInstanceRef.current.updateSegmentTool = (tool: 'CircleSelector' | 'CircleSelector') => {
      ptCtx.ptSegmentInstance?.emit(tool);
    };

    toolInstanceRef.current.segmentInstance = ptCtx.ptSegmentInstance;
  }, [ptCtx.ptSegmentInstance]);

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
    const toolInstance = ptCtx.topViewInstance?.toolInstance;

    if (!toolInstance || checkMode) {
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
