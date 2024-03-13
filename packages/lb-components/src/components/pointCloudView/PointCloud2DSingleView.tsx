import { getClassName } from '@/utils/dom';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import AnnotationView from '@/components/AnnotationView';
import useSize from '@/hooks/useSize';
import { useSingleBox } from './hooks/useSingleBox';
import { ViewOperation } from '@labelbee/lb-annotation';
import { IAnnotationData2dView, IAnnotationDataTemporarily } from './PointCloud2DView';
import { useHighlight } from './hooks/useHighlight';
import HighlightVisible from './components/HighlightVisible';
import { IFileItem } from '@/types/data';
import { PointCloudContext } from './PointCloudContext';

import PointCloud2DRectOperationView from '@/components/pointCloud2DRectOperationView';

const PointCloud2DSingleView = ({
  view2dData,
  setSelectedID,
  currentData,
  showEnlarge,
  checkMode = false,
  measureVisible,
}: {
  view2dData: IAnnotationData2dView;
  setSelectedID: (value: string | number) => void;
  currentData: IFileItem;
  showEnlarge: boolean;
  checkMode?: boolean;
  measureVisible?: boolean;
}) => {
  const ref = useRef(null);
  const viewRef = useRef<{ toolInstance: ViewOperation }>();
  const { selectedBox } = useSingleBox();
  const size = useSize(ref);
  const { url, calib, path } = view2dData;
  const { toggle2dVisible, isHighlightVisible } = useHighlight({ currentData });
  const [loading, setLoading] = useState(false);
  const { cuboidBoxIn2DView, cacheImageNodeSize } = useContext(PointCloudContext);
  const hiddenData = !view2dData;

  const afterImgOnLoad = (imgNode: HTMLImageElement) => {
    focusSelectBox();
    cacheImageNodeSize({
      path,
      imgNode,
    });
    // TODO: Save the ImgNode Data and cache the highlightIndex
  };

  const focusSelectBox = useCallback(() => {
    const toolInstance = viewRef.current?.toolInstance;

    // Clear Selected.
    setSelectedID('');

    if (!selectedBox || !toolInstance) {
      return;
    }
    const selected2data = view2dData.annotations.find(
      (v: IAnnotationDataTemporarily) => v.annotation.id === selectedBox.info.id,
    );

    let id = '';
    if (selected2data && selected2data?.annotation.pointList?.length > 0) {
      toolInstance.focusPositionByPointList(selected2data?.annotation.pointList);
      id = selectedBox.info.id;
      setSelectedID(id);
    }
  }, [selectedBox, viewRef.current, view2dData.annotations]);

  /**
   * If the status is updated, it needs to
   */
  useEffect(() => {
    focusSelectBox();
  }, [focusSelectBox]);

  const highlightOnClick = async () => {
    setLoading(true);
    await toggle2dVisible(url, calib);
    setLoading(false);
  };

  return (
    <div className={getClassName('point-cloud-2d-image')} ref={ref}>
      {cuboidBoxIn2DView ? (
        <AnnotationView
          src={view2dData?.url ?? ''}
          annotations={view2dData.annotations}
          size={size}
          ref={viewRef}
          globalStyle={{
            display: hiddenData ? 'none' : 'block',
          }}
          afterImgOnLoad={afterImgOnLoad}
          zoomInfo={{
            min: 0.01,
            max: 1000,
            ratio: 0.4,
          }}
          measureVisible={measureVisible}
        />
      ) : (
        <PointCloud2DRectOperationView
          mappingData={view2dData}
          size={size}
          checkMode={checkMode}
          afterImgOnLoad={afterImgOnLoad}
        />
      )}

      {calib && (
        <HighlightVisible
          visible={isHighlightVisible(url)}
          onClick={highlightOnClick}
          loading={loading}
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: showEnlarge ? -1 : 101,
          }}
        />
      )}
    </div>
  );
};

export default PointCloud2DSingleView;
