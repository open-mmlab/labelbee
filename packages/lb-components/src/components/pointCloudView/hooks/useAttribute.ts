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
      console.log('update');
      setDefaultAttribute(topViewInstance?.toolInstance.defaultAttribute);
    };

    topViewInstance?.toolInstance.on('changeAttributeSidebar', updateDefaultAttribute);

    return () => {
      topViewInstance?.toolInstance.unbind('changeAttributeSidebar', updateDefaultAttribute);
    };
  }, [topViewInstance?.toolInstance]);

  const syncThreeViewsAttribute = (attribute?: string) => {
    let instanceArr = [topViewInstance?.toolInstance];
    if (topViewInstance?.toolInstance.toolName !== 'lineTool') {
      instanceArr = instanceArr.concat([
        sideViewInstance?.toolInstance,
        backViewInstance?.toolInstance,
      ]);
    }
    instanceArr.forEach((instance) => {
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
