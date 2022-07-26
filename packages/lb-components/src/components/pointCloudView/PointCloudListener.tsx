import React, { useContext, useEffect, useRef } from 'react';
import { PointCloudContext, useRotate } from './PointCloudContext';
import { cTool } from '@labelbee/lb-annotation';
import { message } from 'antd';
import { connect, useDispatch } from 'react-redux';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';

const { EPolygonPattern } = cTool;

const PointCloudListener: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ptCtx = useContext(PointCloudContext);
  const dispatch = useDispatch();
  const toolInstanceRef = useRef({
    exportData: () => {
      return [[], {}];
    },
    singleOn: () => {},
    setResult: () => {
      // Rerender Data
    },
    history: {
      initRecord: () => {},
    },
  });
  const { updateRotate } = useRotate({ currentData });

  const onMounted = (instance: any) => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance,
      },
    });
  };

  const onUnmounted = () => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance: undefined,
      },
    });
  };

  useEffect(() => {
    // Initial toolInstance
    onMounted(toolInstanceRef.current);
    return () => {
      onUnmounted();
    };
  }, []);

  useEffect(() => {
    const { topViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    const { pointCloud2dOpeartion: TopPointCloudPolygonOperation } = topViewInstance;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 81: {
          // Q - anticlockwise
          updateRotate(2);
          break;
        }

        case 69:
          // E - closewise
          updateRotate(-2);

          break;

        case 71:
          // G ， overturn 180
          updateRotate(180);

          break;

        case 85:
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

        default: {
          return;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ptCtx]);

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

        // Add Init Box
        boxParamsList.forEach((v: IPointCloudBox) => {
          pointCloud?.generateBox(v, v.id);
        });

        ptCtx.setPointCloudResult(boxParamsList);
      } else {
        ptCtx.setPointCloudResult([]);
      }

      pointCloud.updateTopCamera();

      // Clear other view data during initialization
      ptCtx.sideViewInstance?.pointCloudInstance.clearPointCloud();
      ptCtx.backViewInstance?.pointCloudInstance.clearPointCloud();
    }
  }, [currentData, ptCtx.mainViewInstance]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [ptCtx.pointCloudBoxList, {}];
    };
  }, [ptCtx.pointCloudBoxList]);

  return null;
};

export default connect(aMapStateToProps)(PointCloudListener);
