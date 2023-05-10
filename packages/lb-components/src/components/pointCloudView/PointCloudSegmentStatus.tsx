import React, { useEffect, useState, useContext } from 'react';
import { getClassName } from '@/utils/dom';
import { Button } from 'antd';
import FinishSvg from '@/assets/annotation/pointCloudTool/finish.svg';
import CancelSvg from '@/assets/annotation/pointCloudTool/cancel.svg';
import { PointCloudContext } from './PointCloudContext';

const PointCloudSegmentStatus = () => {
  const [visible, setVisible] = useState(false);
  const { ptSegmentInstance } = useContext(PointCloudContext);

  useEffect(() => {
    if (ptSegmentInstance) {
      const updateVisible = (cacheData: any) => {
        setVisible(!!cacheData);
      };

      ptSegmentInstance?.on('syncCacheData', updateVisible);

      return () => {
        ptSegmentInstance?.unbind('syncCacheData', updateVisible);
      };
    }
  }, [ptSegmentInstance]);

  if (visible === false) {
    return null;
  }

  return (
    <div className={getClassName('point-cloud-status')}>
      <Button
        icon={<img src={FinishSvg} />}
        type='default'
        onClick={() => {
          ptSegmentInstance?.emit('addStash2Store');
        }}
      >
        完成
      </Button>
      <Button
        icon={<img src={CancelSvg} />}
        type='default'
        onClick={() => {
          ptSegmentInstance?.emit('clearStash');
        }}
      >
        取消
      </Button>
    </div>
  );
};

export default PointCloudSegmentStatus;
