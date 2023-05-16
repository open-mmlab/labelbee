import useSize from '@/hooks/useSize';
import { IA2MapStateProps, a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { getClassName } from '@/utils/dom';
import { CommonToolUtils, PointCloud } from '@labelbee/lb-annotation';
import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudSegmentMode } from '@labelbee/lb-utils';

interface IProps extends IA2MapStateProps {
  checkMode?: boolean;
}

const PointCloudSegment: React.FC<IProps> = ({ currentData, config, checkMode }) => {
  const domRef = useRef<HTMLDivElement>(null);
  const { setPtSegmentInstance, ptSegmentInstance, setDefaultAttribute } =
    useContext(PointCloudContext);
  const size = useSize(domRef);

  const defaultAttribute = config?.attributeList?.[0]?.value;

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

    ptSegmentInstance.store.setAttribute(defaultAttribute);
    setDefaultAttribute(defaultAttribute);

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

  const segmentKeydownEvents = (lowerCaseKey: string, e: KeyboardEvent) => {
    switch (lowerCaseKey) {
      case 'h':
        ptSegmentInstance?.emit('LassoSelector');
        break;

      case 'j':
        ptSegmentInstance?.emit('CircleSelector');
        break;

      case 'u':
        ptSegmentInstance?.emit('setSegmentMode', EPointCloudSegmentMode.Add);
        break;

      case 'i':
        ptSegmentInstance?.emit('setSegmentMode', EPointCloudSegmentMode.Remove);
        break;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!CommonToolUtils.hotkeyFilter(e) || checkMode === true) {
      return;
    }

    const lowerCaseKey = e.key.toLocaleLowerCase();

    segmentKeydownEvents(lowerCaseKey, e);
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ptSegmentInstance]);

  return <div className={getClassName('point-cloud-layout')} ref={domRef} />;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSegment,
);
