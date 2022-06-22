/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Point cloud tool view, includes 2D-view、3Dview、top-view、side-view、back-view
 * @date 2022-06-21
 */

import { getClassName } from '@/utils/dom';
import React from 'react';
import PointCloud3D from './PointCloud3DView';

const PointCloudView = () => {
  return (
    <div className={getClassName('point-cloud-wrapper')}>
      <div className={getClassName('point-cloud-container', 'left')}>
        <div className={getClassName('point-cloud-2d-container')}>
          <div>2D视图</div>
          <div className={getClassName('point-cloud-2d-image')}>
            <img src='http://10.53.25.142:8001/1/000001.jpg' width='100%'></img>
          </div>
        </div>

        <div className={getClassName('point-cloud-3d-container')}>
          3D视图
          <PointCloud3D />
        </div>
      </div>

      <div className={getClassName('point-cloud-container', 'right')}>
        <div className={getClassName('point-cloud-container', 'top-view')}>
          俯视图
          <div></div>
        </div>

        <div className={getClassName('point-cloud-container', 'right-bottom')}>
          <div className={getClassName('point-cloud-container', 'side-view')}>
            侧视图
            <div></div>
          </div>

          <div className={getClassName('point-cloud-container', 'back-view')}>
            背视图
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointCloudView;
