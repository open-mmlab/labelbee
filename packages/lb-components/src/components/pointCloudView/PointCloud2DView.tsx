import { getClassName } from '@/utils/dom';
import React from 'react';
import { PointCloudContainer } from './PointCloudLayout';

const PointCloud2DView = () => {
  return (
    <PointCloudContainer className={getClassName('point-cloud-2d-container')} title='2D视图'>
      <div className={getClassName('point-cloud-2d-image')}>
        <img src='http://10.53.25.142:8001/1/000001.jpg' />
      </div>
    </PointCloudContainer>
  );
};

export default PointCloud2DView;
