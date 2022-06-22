/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-27 19:55:49
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 23:09:57
 */
/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Point cloud tool view, includes 2D-view、3Dview、top-view、side-view、back-view
 * @date 2022-06-21
 */

import { getClassName } from '@/utils/dom';
import React from 'react';
import PointCloud3DView from './PointCloud3DView';
import PointCloudBackView from './PointCloudBackView';
import PointCloudTopView from './PointCloudTopView';
import PointCloudSideView from './PointCloudSideView';
import PointCloud2DView from './PointCloud2DView';

const PointCloudView = () => {
  return (
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
  );
};

export default PointCloudView;
