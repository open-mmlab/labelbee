import { useContext } from 'react';
import { IAnnotationStateProps } from '@/store/annotation/map';
import { synchronizeBackView, synchronizeSideView } from './usePointCloudViews';
import { useSingleBox } from './useSingleBox';
import { PointCloudContext } from '../PointCloudContext';
import { cAnnotation } from '@labelbee/lb-annotation';
import { PointCloudUtils } from '@labelbee/lb-utils';
import { EPointCloudBoxRenderTrigger } from '@/utils/ToolPointCloudBoxRenderHelper';
import { useThrottleFn } from 'ahooks';

const { ERotateDirection } = cAnnotation;

/**
 * PointCloud Rotate Hook
 * @returns
 */
export const useRotate = ({ currentData }: IAnnotationStateProps) => {
  const ptCtx = useContext(PointCloudContext);
  const { selectedBox, updateSelectedBox } = useSingleBox();
  const { run: updateRotate } = useThrottleFn(
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

      const newPointCloudList = updateSelectedBox({
        rotation: PointCloudUtils.restrictAngleRange(
          selectedPointCloudBox.rotation + Number(Math.PI * angle) / 180,
        ),
      });

      TopPointCloudPolygonOperation.rotatePolygon(angle, ERotateDirection.Anticlockwise);
      const selectedPolygon = TopPointCloudPolygonOperation.selectedPolygon;

      mainViewInstance.generateBox(selectedPointCloudBox);
      syncAllViewPointCloudColor(EPointCloudBoxRenderTrigger.SingleRotate, newPointCloudList);
      synchronizeSideView(
        selectedPointCloudBox,
        selectedPolygon,
        ptCtx.sideViewInstance,
        currentData.url,
      );
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
    updateRotate,
  };
};
