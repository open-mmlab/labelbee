import { PointCloudContext } from '../PointCloudContext';
import { useContext } from 'react';
import { IPointCloudConfig } from '@labelbee/lb-utils';

export const useConfig = () => {
  const { topViewInstance, sideViewInstance, backViewInstance, mainViewInstance } =
    useContext(PointCloudContext);

  const syncAllViewsConfig = (config: IPointCloudConfig) => {
    [topViewInstance, sideViewInstance, backViewInstance].forEach((instance) => {
      instance?.updateConfig(config);
      
      /**
       * If update the config, needs to update defaultAttribute.
       */
      const defaultAttribute = config?.attributeList?.[0]?.value;
      if (defaultAttribute) {
        instance?.pointCloud2dOperation.setDefaultAttribute(defaultAttribute);
      }
    });
    mainViewInstance?.setConfig(config);
  };

  const reRenderTopViewRange = (radius: number) => {
    topViewInstance?.pointCloudInstance?.generateRange?.(radius);
    topViewInstance?.pointCloudInstance?.render();
  };

  return {
    syncAllViewsConfig,
    reRenderTopViewRange,
  };
};
