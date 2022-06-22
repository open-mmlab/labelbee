import { getClassName } from '@/utils/dom';
import React from 'react';
import { PointCloudContainer } from './PointCloudLayout';

const PointCloudSideView = () => {
  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'side-view')}
      title='侧视图'
    >
      <div>PointCloudSideView</div>
    </PointCloudContainer>
  );
};

export default PointCloudSideView;
