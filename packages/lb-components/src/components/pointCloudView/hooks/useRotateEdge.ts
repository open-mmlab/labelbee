import { useContext } from 'react';
import { IAnnotationStateProps } from '@/store/annotation/map';
import { synchronizeBackView, synchronizeSideView } from './usePointCloudViews';
import { useSingleBox } from './useSingleBox';
import { PointCloudContext } from '../PointCloudContext';
import { useThrottleFn } from 'ahooks';
import { PointCloudUtils, ICoordinate } from '@labelbee/lb-utils';

/**
 * PointCloud Rotate Hook
 * @returns
 */
export const useRotateEdge = ({ currentData }: IAnnotationStateProps) => {
  const ptCtx = useContext(PointCloudContext);
  const { selectedBox, updateSelectedBox } = useSingleBox();
  const { run: updateRotateEdge } = useThrottleFn(
    (angle: number) => {
      const { topViewInstance, mainViewInstance, syncAllViewPointCloudColor } = ptCtx;
      if (!topViewInstance || !mainViewInstance) {
        return;
      }

      const { pointCloud2dOperation: TopPointCloudPolygonOperation } = topViewInstance;

      const selectedPointCloudBox = selectedBox?.info;

      if (!selectedPointCloudBox || !currentData?.url || !ptCtx.backViewInstance) {
        return;
      }

      const newPointList = TopPointCloudPolygonOperation.selectedPolygon.pointList || [];
      const nextPointItem: ICoordinate = newPointList.shift();
      newPointList.push(nextPointItem);

      const newPointCloudList = updateSelectedBox({
        newPointList,
        rotation: PointCloudUtils.restrictAngleRange(
          selectedPointCloudBox.rotation + Number(Math.PI * angle) / 180,
        ),
        width: selectedPointCloudBox.height,
        height: selectedPointCloudBox.width,
      });

      TopPointCloudPolygonOperation.rotatePolygonEdge(newPointList);
      const selectedPolygon = TopPointCloudPolygonOperation.selectedPolygon;

      // 更新3D视图
      mainViewInstance.generateBox(selectedPointCloudBox);
      syncAllViewPointCloudColor(newPointCloudList);
      // 更新侧视图
      synchronizeSideView(
        selectedPointCloudBox,
        selectedPolygon,
        ptCtx.sideViewInstance,
        currentData.url,
      );
      // 更新背视图
      synchronizeBackView(
        selectedPointCloudBox,
        selectedPolygon,
        ptCtx.backViewInstance,
        currentData.url,
      );
      mainViewInstance.render();
    },
    {
      wait: 800,
    },
  );

  return {
    updateRotateEdge,
  };
};
