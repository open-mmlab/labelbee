import { IPointCloudBox } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useAttribute = () => {
  const { topViewInstance, sideViewInstance, backViewInstance, mainViewInstance } =
    useContext(PointCloudContext);

  const defaultAttribute = topViewInstance?.pointCloud2dOperation?.defaultAttribute;

  const syncThreeViewsAttribute = (attribute?: string) => {
    [
      topViewInstance?.pointCloud2dOperation,
      sideViewInstance?.pointCloud2dOperation,
      backViewInstance?.pointCloud2dOperation,
    ].forEach((instance) => {
      instance?.setDefaultAttribute(attribute);
    });
  };

  const updateDefaultAttribute = (attribute?: string) => {
    topViewInstance?.pointCloud2dOperation.setDefaultAttribute(attribute);
  };

  const reRenderPointCloud3DBox = (newBox: IPointCloudBox) => {
    mainViewInstance?.generateBox(newBox);
  };

  return {
    syncThreeViewsAttribute,
    updateDefaultAttribute,
    reRenderPointCloud3DBox,
    defaultAttribute,
  };
};
