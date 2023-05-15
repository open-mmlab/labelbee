import { IPointCloudBox } from '@labelbee/lb-utils';
import { useContext, useEffect, useCallback } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useAttribute = () => {
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    ptSegmentInstance,
    defaultAttribute,
    setDefaultAttribute,
  } = useContext(PointCloudContext);

  useEffect(() => {
    if (!ptSegmentInstance) {
      return
    }
  }, [ptSegmentInstance])

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

  const updateSegmentAttribute = useCallback((attribute: string) => {
    if (!ptSegmentInstance) {
      return
    }
    ptSegmentInstance.store.setAttribute(attribute)
    ptSegmentInstance.pointCloudRender.updatePointsColor()
    setDefaultAttribute(attribute)
  }, [ptSegmentInstance])

  return {
    syncThreeViewsAttribute,
    updateDefaultAttribute,
    reRenderPointCloud3DBox,
    defaultAttribute,
    updateSegmentAttribute,
  };
};
