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
    if (!topViewInstance?.toolInstance) {
      return;
    }

    const updateDefaultAttribute = () => {
      setDefaultAttribute(topViewInstance?.toolInstance.defaultAttribute);
    };

    topViewInstance?.toolInstance.on('changeAttributeSidebar', updateDefaultAttribute);

    return () => {
      topViewInstance?.toolInstance.unbind('changeAttributeSidebar', updateDefaultAttribute);
    };
  }, [topViewInstance?.toolInstance]);

  const syncThreeViewsAttribute = (attribute?: string) => {
    [
      topViewInstance?.toolInstance,
      sideViewInstance?.toolInstance,
      backViewInstance?.toolInstance,
    ].forEach((instance) => {
      instance?.setDefaultAttribute(attribute);
    });
  };

  const updateDefaultAttribute = (attribute?: string) => {
    topViewInstance?.toolInstance.setDefaultAttribute(attribute);
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
