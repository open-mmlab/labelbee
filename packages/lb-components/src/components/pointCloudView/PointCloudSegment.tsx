import useSize from '@/hooks/useSize';
import { IA2MapStateProps, a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { getClassName } from '@/utils/dom';
import { PointCloud } from '@labelbee/lb-annotation';
import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { PointCloudContext } from './PointCloudContext';

const PointCloudSegment: React.FC<IA2MapStateProps> = ({ currentData, config }) => {
  const domRef = useRef<HTMLDivElement>(null);
  const { setPtSegmentInstance, ptSegmentInstance } = useContext(PointCloudContext);
  const size = useSize(domRef);

  useEffect(() => {
    if (!size?.width || !domRef.current) {
      return;
    }

    const orthographicParams = {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 100,
      far: -100,
    };

    const ptSegmentInstance = new PointCloud({
      container: domRef.current,
      isOrthographicCamera: true,
      orthographicParams,
      config,
    });

    setPtSegmentInstance(ptSegmentInstance);

    // TODO
    if (currentData?.url) {
      ptSegmentInstance.loadPCDFile(currentData?.url ?? '');
    }
  }, [size]);

  // Template just for Test
  useEffect(() => {
    if (ptSegmentInstance && currentData.url) {
      ptSegmentInstance.loadPCDFile(currentData?.url ?? '');
    }
  }, [currentData, ptSegmentInstance]);

  return <div className={getClassName('point-cloud-layout')} ref={domRef} />;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSegment,
);
