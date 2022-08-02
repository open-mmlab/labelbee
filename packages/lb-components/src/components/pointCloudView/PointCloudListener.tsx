import { useContext, useEffect } from 'react';
import { PointCloudContext, useNextOne, useRotate, useSelectedBox } from './PointCloudContext';
import { cTool, cAnnotation } from '@labelbee/lb-annotation';
import { message } from 'antd';
const { ESortDirection } = cAnnotation;

const { EPolygonPattern } = cTool;

const PointCloudListener = () => {
  const ptCtx = useContext(PointCloudContext);
  const { updateRotate } = useRotate();
  const { switchToNextPolygon } = useNextOne();
  const { changeSelectedBoxValid } = useSelectedBox();

  useEffect(() => {
    const { topViewInstance, mainViewInstance } = ptCtx;
    if (!topViewInstance) {
      return;
    }

    const { pointCloud2dOpeartion: TopPointCloudPolygonOperation } = topViewInstance;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLocaleLowerCase()) {
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
          switchToNextPolygon(ESortDirection.ascend);
          break;

        case 'c':
          switchToNextPolygon(ESortDirection.descend);
          break;

        case 'f':
          changeSelectedBoxValid();
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

  return null;
};

export default PointCloudListener;
