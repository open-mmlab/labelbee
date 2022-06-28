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
import PointCloud3D from './PointCloud3DView';
import { PointCloudContainer } from './PointCloudLayout';
import PointCloudTopView from './PointCloudTopView';

const PointCloudView = () => {
  return (
    <div className={getClassName('point-cloud-wrapper')}>
      <div className={getClassName('point-cloud-container', 'left')}>
        <PointCloudContainer className={getClassName('point-cloud-2d-container')} title='2D视图'>
          <div className={getClassName('point-cloud-2d-image')}>
            <img src='http://10.53.25.142:8001/1/000001.jpg' width='100%' />
          </div>
        </PointCloudContainer>

        <PointCloudContainer className={getClassName('point-cloud-3d-container')} title='3D视图'>
          <PointCloud3D />
        </PointCloudContainer>
      </div>

      <div className={getClassName('point-cloud-container', 'right')}>
        <PointCloudContainer
          className={getClassName('point-cloud-container', 'top-view')}
          title='俯视图'
        >
          <PointCloudTopView />
        </PointCloudContainer>

        <div className={getClassName('point-cloud-container', 'right-bottom')}>
          <PointCloudContainer
            className={getClassName('point-cloud-container', 'side-view')}
            title='侧视图'
          >
            <div />
          </PointCloudContainer>

          <PointCloudContainer
            className={getClassName('point-cloud-container', 'back-view')}
            title='背视图'
          >
            <div />
          </PointCloudContainer>
        </div>
      </div>
    </div>
  );
};

export default PointCloudView;
