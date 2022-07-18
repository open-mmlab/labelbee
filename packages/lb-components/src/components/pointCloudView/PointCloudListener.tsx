import { useContext, useEffect } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { cAnnotation, cTool } from '@labelbee/lb-annotation';
import {
  synchronizeBackView,
  synchronizeSideView,
  TopPointCloudPolygonOperation,
} from './PointCloudTopView';
import { pointCloudMain } from './PointCloud3DView';
import { message } from 'antd';

const { EPolygonPattern } = cTool;
const { ERotateDirection } = cAnnotation;

const PointCloudListener = () => {
  const ptx = useContext(PointCloudContext);

  useEffect(() => {
    const { selectedID, pointCloudBoxList, setPointCloudResult } = ptx;

    const updateRotate = (angle: number) => {
      const selectedPointCloudBox = pointCloudBoxList.find((v) => v.id === selectedID);

      if (!selectedPointCloudBox) {
        return;
      }

      selectedPointCloudBox.rotation =
        selectedPointCloudBox.rotation + Number(Math.PI * angle) / 180;

      const newPointCloudBoxList = [...pointCloudBoxList].map((v) => {
        if (v.id === selectedID) {
          return selectedPointCloudBox;
        }
        return v;
      });

      setPointCloudResult(newPointCloudBoxList);
      TopPointCloudPolygonOperation.rotatePolygon(angle, ERotateDirection.Anticlockwise);
      const selectedPolygon = TopPointCloudPolygonOperation.selectedPolygon;

      pointCloudMain.generateBox(selectedPointCloudBox, selectedPolygon.id);
      pointCloudMain.hightLightOriginPointCloud(selectedPointCloudBox);
      synchronizeSideView(selectedPointCloudBox, selectedPolygon);
      synchronizeBackView(selectedPointCloudBox, selectedPolygon);
      pointCloudMain.render();
    };

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
  }, [ptx]);

  return null;
};

export default PointCloudListener;
