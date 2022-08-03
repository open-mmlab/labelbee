import { useContext, useEffect } from 'react';
import { PointCloudContext, useBoxes, useRotate, useSingleBox } from './PointCloudContext';
import { cTool } from '@labelbee/lb-annotation';
import { message } from 'antd';

const { EPolygonPattern } = cTool;

const PointCloudListener = () => {
  const ptCtx = useContext(PointCloudContext);
  const { updateRotate } = useRotate();
  const { changeSelectedBoxValid, selectNextBox, selectPrevBox } = useSingleBox();
  const { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes } = useBoxes();

  const keydownEvents = (lowerCaseKey: string) => {
    const { topViewInstance, mainViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    const { pointCloud2dOpeartion: TopPointCloudPolygonOperation } = topViewInstance;

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

  return null;
};

export default PointCloudListener;
