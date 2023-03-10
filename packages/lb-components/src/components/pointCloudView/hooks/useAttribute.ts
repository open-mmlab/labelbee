import { IPointCloudBox } from '@labelbee/lb-utils';
import { useContext, useEffect } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useAttribute = () => {
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    defaultAttribute,
    setDefaultAttribute,
  } = useContext(PointCloudContext);

  useEffect(() => {
    if (!topViewInstance?.pointCloud2dOperation) {
      return;
    }

    const updateDefaultAttribute = () => {
      setDefaultAttribute(topViewInstance?.pointCloud2dOperation.defaultAttribute);
    };

    topViewInstance?.pointCloud2dOperation.on('changeAttributeSidebar', updateDefaultAttribute);

    return () => {
      topViewInstance?.pointCloud2dOperation.unbind(
        'changeAttributeSidebar',
        updateDefaultAttribute,
      );
    };
  }, [topViewInstance?.pointCloud2dOperation]);

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
