/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Point cloud tool view
 *       Includes 2D-view、3Dview、top-view、side-view、back-view
 * @date 2022-06-21
 */

import { getClassName } from '@/utils/dom';
import React, { useMemo, useState } from 'react';
import PointCloud3DView from './PointCloud3DView';
import PointCloudBackView from './PointCloudBackView';
import PointCloudTopView from './PointCloudTopView';
import PointCloudSideView from './PointCloudSideView';
import PointCloud2DView from './PointCloud2DView';
import { PointCloudContext } from './PointCloudContext';
import { IPointCloudBoxList, IPointCloudBox } from '@labelbee/lb-utils';

const PointCloudView = () => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedID, setSelectedID] = useState<string>('');

  const addBox = (box: IPointCloudBox) => {
    setPointCloudResult(pointCloudBoxList.concat(box));
  };

  const ptCtx = useMemo(() => {
    return { pointCloudBoxList, selectedID, setPointCloudResult, setSelectedID, addBox };
  }, [selectedID, pointCloudBoxList]);

  return (
    <PointCloudContext.Provider value={ptCtx}>
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
    </PointCloudContext.Provider>
  );
};

export default PointCloudView;
