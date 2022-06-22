import { getClassName } from '@/utils/dom';
import React from 'react';
import { PointCloudContainer } from './PointCloudLayout';

const PointCloudBackView = () => {
  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'back-view')}
      title='背视图'
    >
      <div>PointCloudBackView</div>
    </PointCloudContainer>
  );
};

export default PointCloudBackView;
