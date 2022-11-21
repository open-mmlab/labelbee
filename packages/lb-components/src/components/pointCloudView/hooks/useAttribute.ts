import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useAttribute = () => {
  const { topViewInstance, sideViewInstance, backViewInstance } = useContext(PointCloudContext);

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

  return {
    syncThreeViewsAttribute,
    updateDefaultAttribute,
  };
};
