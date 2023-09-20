import React, { useContext, useEffect } from 'react';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { connect } from 'react-redux';
import { LabelBeeContext } from '@/store/ctx';
import { ICustomToolInstance } from '@/hooks/annotation';
import { PointCloudContext } from './PointCloudContext';
import { CommonToolUtils } from '@labelbee/lb-annotation';
import { EPointCloudSegmentMode, PointCloudUtils } from '@labelbee/lb-utils';
import { useAttribute } from './hooks/useAttribute';

interface IProps extends IA2MapStateProps {
  checkMode?: boolean;
  toolInstanceRef: React.MutableRefObject<ICustomToolInstance>;
}

const PointCloudSegmentListener: React.FC<IProps> = ({
  checkMode,
  currentData,
  imgIndex,
  highlightAttribute,
  config,
  toolInstanceRef,
}) => {
  const { updateSegmentAttribute, updateSegmentSubAttribute } = useAttribute();

  const ptCtx = useContext(PointCloudContext);
  const { ptSegmentInstance, setSegmentation } = ptCtx;

  /**
   * Listen
   */
  useEffect(() => {
    if (ptSegmentInstance && currentData.url) {
      /**
       * Reset All Status and data.
       *
       * 1. clear stash
       * 2. clear all segment data.
       *
       */
      ptSegmentInstance.emit('clearStash');
      ptSegmentInstance.emit('clearAllSegmentData');
      ptSegmentInstance.loadPCDFile(currentData?.url ?? '').then(() => {
        const segmentData = PointCloudUtils.getSegmentFromResultList(currentData?.result ?? '');
        ptSegmentInstance?.store?.updateCurrentSegment(segmentData);
      });

      // Update segmentData.
      ptSegmentInstance.on('syncSegmentData', setSegmentation);

      return () => {
        ptSegmentInstance.unbind('syncSegmentData', setSegmentation);
      };
    }
  }, [imgIndex, ptSegmentInstance]);

  useEffect(() => {
    ptSegmentInstance?.store?.highlightPointsByAttribute(highlightAttribute ?? '');
  }, [highlightAttribute, ptSegmentInstance]);

  const segmentKeydownEvents = (lowerCaseKey: string, e: KeyboardEvent) => {
    switch (lowerCaseKey) {
      case 'h':
        ptSegmentInstance?.emit('LassoSelector');
        break;

      case 'j':
        ptSegmentInstance?.emit('RectSelector');
        break;

      case 'k':
        ptSegmentInstance?.emit('CircleSelector');
        break;

      case 'u':
        ptSegmentInstance?.emit('setSegmentMode', EPointCloudSegmentMode.Add);
        break;

      case 'i':
        ptSegmentInstance?.emit('setSegmentMode', EPointCloudSegmentMode.Remove);
        break;

      case 'enter':
        ptSegmentInstance?.emit('updateCheck2Edit');
        break;

      case 'delete':
        ptSegmentInstance?.emit(
          'deleteSelectedSegmentData',
          ptSegmentInstance.store?.cacheSegData?.id,
        );
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

    toolInstanceRef.current.setDefaultAttribute = (newAttribute: string) => {
      updateSegmentAttribute(newAttribute);
    };

    toolInstanceRef.current.setSubAttribute = (key: string, value: string) => {
      updateSegmentSubAttribute(key, value);
    };

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ptSegmentInstance]);

  useEffect(() => {
    toolInstanceRef.current.clearResult = () => {
      if (!ptCtx.ptSegmentInstance) {
        return;
      }
      ptCtx.ptSegmentInstance.emit('clearAllSegmentData');
    };
  }, [
    ptCtx.pointCloudBoxList,
    ptCtx.valid,
    ptCtx.polygonList,
    ptCtx.lineList,
    ptCtx.pointCloudSphereList,
    ptCtx.ptSegmentInstance,
  ]);

  return null;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSegmentListener,
);
