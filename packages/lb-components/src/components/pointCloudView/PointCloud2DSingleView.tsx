import { getClassName } from '@/utils/dom';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AnnotationView from '@/components/AnnotationView';
import useSize from '@/hooks/useSize';
import { useSingleBox } from './hooks/useSingleBox';
import { ViewOperation, EPointCloudName } from '@labelbee/lb-annotation';
import { IAnnotationData2dView, IAnnotationDataTemporarily } from './PointCloud2DView';
import { useHighlight } from './hooks/useHighlight';
import HighlightVisible from './components/HighlightVisible';
import { IFileItem } from '@/types/data';
import { PointCloudContext } from './PointCloudContext';
import useDataLinkSwitch from './hooks/useDataLinkSwitch';

import PointCloud2DRectOperationView from '@/components/pointCloud2DRectOperationView';
import { useToolStyleContext } from '@/hooks/useToolStyle';

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
  const { url, fallbackUrl, calib, path } = view2dData;
  const { toggle2dVisible, isHighlightVisible } = useHighlight({ currentData });
  const [loading, setLoading] = useState(false);
  const {
    highlight2DLoading,
    setHighlight2DLoading,
    cuboidBoxIn2DView,
    cacheImageNodeSize,
    setSelectedIDs,
    pointCloudBoxList,
  } = useContext(PointCloudContext);

  const { value: toolStyle } = useToolStyleContext();
  const { hiddenText } = toolStyle || {};

  const hiddenData = !view2dData;

  const dataLinkSwitchOpts = useMemo(() => {
    return {
      zIndex: showEnlarge ? -1 : 101,
      is2DView: !cuboidBoxIn2DView,
      imageName: view2dData.path,
    };
  }, [showEnlarge, cuboidBoxIn2DView, view2dData.path]);

  const { rendered: dataLinkRendered, isLinking: isLinkToPointCloudDataOrNot } =
    useDataLinkSwitch(dataLinkSwitchOpts);

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
    setHighlight2DLoading(true);
    try {
      await toggle2dVisible(url, fallbackUrl ?? '', calib);
    } catch (error) {
      console.error('highlightOnClick error:', error);
    } finally {
      setLoading(false);
      setHighlight2DLoading(false);
    }
  };

  return (
    <div className={getClassName('point-cloud-2d-image')} ref={ref}>
      {cuboidBoxIn2DView ? (
        <AnnotationView
          src={view2dData?.url ?? ''}
          fallbackSrc={view2dData?.fallbackUrl ?? ''}
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
          onRightClick={({ targetId }) => setSelectedIDs(targetId)}
          pointCloudBoxList={pointCloudBoxList}
          hiddenText={hiddenText}
          renderToolName={EPointCloudName.PointCloud}
        />
      ) : (
        <>
          <PointCloud2DRectOperationView
            shouldExcludePointCloudBoxListUpdate={!isLinkToPointCloudDataOrNot}
            mappingData={view2dData}
            size={size}
            checkMode={checkMode}
            afterImgOnLoad={afterImgOnLoad}
          />
          {!checkMode && dataLinkRendered}
        </>
      )}
      {calib && (
        <HighlightVisible
          visible={isHighlightVisible(url)}
          onClick={highlightOnClick}
          loading={loading}
          disabled={highlight2DLoading}
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
