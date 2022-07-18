/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-07-04 14:39:44
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 10:01:08
 */
/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Point cloud tool view
 *       Includes 2D-view、3Dview、top-view、side-view、back-view
 * @date 2022-06-21
 */

import { getClassName } from '@/utils/dom';
import React, { useEffect, useMemo, useState } from 'react';
import PointCloud3DView, { pointCloudMain } from './PointCloud3DView';
import PointCloudBackView from './PointCloudBackView';
import PointCloudTopView, {
  synchronizeBackView,
  synchronizeSideView,
  TopPointCloudPolygonOperation,
} from './PointCloudTopView';
import PointCloudSideView from './PointCloudSideView';
import PointCloud2DView from './PointCloud2DView';
import { PointCloudContext } from './PointCloudContext';
import { IPointCloudBoxList, IPointCloudBox } from '@labelbee/lb-utils';
import { cAnnotation, cTool } from '@labelbee/lb-annotation';
import { message } from 'antd';

const { EPolygonPattern } = cTool;
const { ERotateDirection } = cAnnotation;

const PointCloudView = () => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedID, setSelectedID] = useState<string>('');

  useEffect(() => {
    // TODO! It need to be optimize later;
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
  });

  const addBox = (box: IPointCloudBox) => {
    setPointCloudResult(pointCloudBoxList.concat(box));
  };

  const ptCtx = useMemo(() => {
    const selectedPointCloudBox = pointCloudBoxList.find((v) => v.id === selectedID);

    const updateSelectedPointCloud = (id: string, newPointCloudBox: IPointCloudBox) => {
      const newPointCloudBoxList = [...pointCloudBoxList].map((v) => {
        if (v.id === id) {
          return newPointCloudBox;
        }
        return v;
      });

      setPointCloudResult(newPointCloudBoxList);
    };

    return {
      pointCloudBoxList,
      selectedID,
      setPointCloudResult,
      setSelectedID,
      addBox,
      selectedPointCloudBox,
      updateSelectedPointCloud,
    };
  }, [selectedID, pointCloudBoxList]);

  return (
    <PointCloudContext.Provider value={ptCtx}>
      <div className={getClassName('point-cloud-layout')}>
        <div className={getClassName('point-cloud-wrapper')}>
          <div className={getClassName('point-cloud-container', 'left')}>
            <PointCloud2DView />
            <PointCloud3DView />
          </div>

          <div className={getClassName('point-cloud-container', 'right')}>
            <PointCloudTopView />
            <div className={getClassName('point-cloud-container', 'right-bottom')}>
              <PointCloudSideView />
              <PointCloudBackView />
            </div>
          </div>
        </div>
      </div>
    </PointCloudContext.Provider>
  );
};

export default PointCloudView;
