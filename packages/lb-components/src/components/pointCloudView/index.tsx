/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-07-04 14:39:44
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 10:01:08
 */
/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Point cloud tool view
 *       Includes 2D-view、3Dview、top-view、side-view、back-view
 * @date 2022-06-21
 */

import { getClassName } from '@/utils/dom';
import React, { useContext, useEffect, useRef, useState } from 'react';
import PointCloud3DView from './PointCloud3DView';
import PointCloudBackView from './PointCloudBackView';
import PointCloudTopView from './PointCloudTopView';
import PointCloudSideView from './PointCloudSideView';
import PointCloud2DView from './PointCloud2DView';
import PointCloudListener from './PointCloudListener';
import PointCloudSegmentListener from './PointCloudSegmentListener';
import PointCloudSegment from './PointCloudSegment';
import PointCloudSegmentStatus from './PointCloudSegmentStatus';
import PointCloudSegmentToolbar from './PointCloudSegmentToolbar';
import PointCloudSegment2DView from './PointCloudSegment2DView';
import { connect } from 'react-redux';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import {
  AnnotatedAttributesPanelFixedLeft,
  AnnotatedAttributesPanelFixedRight,
} from '@/views/MainView/toolFooter/AnnotatedAttributes';
import { DrawLayerSlot } from '@/types/main';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudPattern, PointCloudUtils } from '@labelbee/lb-utils';
import { useCustomToolInstance } from '@/hooks/annotation';
import { jsonParser, resolveFileItemValid } from '@/utils';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import classNames from 'classnames';
import SideAndBackOverView from './components/sideAndBackOverView';
import { SetLoadPCDFileLoading } from '@/store/annotation/actionCreators';
import DynamicResizer from '@/components/DynamicResizer';
import { IBatchSetValid } from '@/views/MainView/sidebar/GeneralOperation';

interface IProps extends IA2MapStateProps {
  drawLayerSlot?: DrawLayerSlot;
  checkMode?: boolean;
  intelligentFit?: boolean;
  measureVisible?: boolean;
  setResourceLoading?: (loading: boolean) => void;
  setBatchSetValid?: (values: IBatchSetValid) => void;
}

const PointCloudView: React.FC<IProps> = (props) => {
  const {
    currentData,
    imgList,
    drawLayerSlot,
    checkMode,
    intelligentFit,
    imgIndex,
    config,
    measureVisible,
    setResourceLoading,
    stepInfo,
    setBatchSetValid,
  } = props;
  const ptCtx = useContext(PointCloudContext);
  const { globalPattern, setGlobalPattern, selectedIDs, isLargeStatus, setIsLargeStatus } = ptCtx;
  const dispatch = useDispatch();
  const rightRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [minTopHeight, setMinTopHeight] = useState<number>(0);
  const [isEnlargeTopView, setIsEnlargeTopView] = useState(false);
  const selectAndEnlarge = selectedIDs?.length > 0 && isEnlargeTopView;

  const basicInfo = jsonParser(currentData.result);
  const { toolInstanceRef, clearToolInstance } = useCustomToolInstance({ basicInfo });

  useEffect(() => {
    toolInstanceRef.current.setPointCloudGlobalPattern = (pattern: EPointCloudPattern) => {
      if (pattern !== globalPattern) {
        setGlobalPattern(pattern);
        ptCtx.clearAllDetectionInstance();
        clearToolInstance();
      }
    };
  }, [globalPattern]);

  /**
   * PointCloud Data initialization !!
   *
   * 1. Initialize all point cloud data types into the PointCloudContext so that data
   * from other patterns can be accessed when submitted under current patterns.
   *
   * 2. Data initialization for each pattern is implemented in respective child listeners.
   * （Detection => PointCloudListener / Segmentation => PointCloudSegmentListener）
   */
  useEffect(() => {
    SetLoadPCDFileLoading(dispatch, true);
    if (currentData) {
      const { boxParamsList, polygonList, lineList, sphereParamsList, segmentation, rectList } =
        PointCloudUtils.parsePointCloudCurrentResult(currentData?.result ?? '');
      ptCtx.setPointCloudResult(boxParamsList);
      ptCtx.setPolygonList(polygonList);
      ptCtx.setLineList(lineList);
      ptCtx.setPointCloudSphereList(sphereParamsList);
      ptCtx.setRectList(rectList);
      ptCtx.setSegmentation(segmentation);
      ptCtx.setPointCloudValid(
        resolveFileItemValid(currentData?.result, currentData?.preResult),
      );
    }
  }, [imgIndex]);

  useEffect(() => {
    if (rightRef.current) {
      // Limit the minimum drag range of the upper half
      const calcHeight = rightRef.current?.offsetHeight - 233;
      setMinTopHeight(calcHeight);
    }
  }, [contentRef.current]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [ptCtx.pointCloudBoxList, { valid: ptCtx.valid }];
    };

    toolInstanceRef.current.exportCustomData = () => {
      return {
        resultPolygon: ptCtx.polygonList ?? [],
        resultLine: ptCtx.lineList ?? [],
        resultPoint: ptCtx.pointCloudSphereList ?? [],
        resultRect: ptCtx.rectList ?? [],
        segmentation: ptCtx.segmentation ?? [],
      };
    };
  }, [
    ptCtx.pointCloudBoxList,
    ptCtx.rectList,
    ptCtx.valid,
    ptCtx.polygonList,
    ptCtx.lineList,
    ptCtx.pointCloudSphereList,
    ptCtx.ptSegmentInstance,
    ptCtx.segmentation,
  ]);

  if (imgList.length === 0) {
    return null;
  }

  if (globalPattern === EPointCloudPattern.Segmentation) {
    return (
      <>
        <PointCloudSegmentListener checkMode={checkMode} toolInstanceRef={toolInstanceRef} />
        <PointCloudSegmentToolbar />
        <div className={getClassName('point-cloud-layout')}>
          <PointCloudSegment checkMode={checkMode} />
          <PointCloudSegment2DView />
        </div>
        <PointCloudSegmentStatus config={config} />
        {drawLayerSlot?.({
          direct: true,
        })}
      </>
    );
  }

  let backAndSideView = (
    <div className={getClassName('point-cloud-container', 'left-bottom')}>
      <PointCloudBackView checkMode={checkMode} />
      <PointCloudSideView checkMode={checkMode} />
    </div>
  );
  if (isEnlargeTopView) {
    backAndSideView = (
      <SideAndBackOverView selectAndEnlarge={selectAndEnlarge} checkMode={checkMode} />
    );
  }

  return (
    <>
      <PointCloudListener
        checkMode={checkMode}
        toolInstanceRef={toolInstanceRef}
        setResourceLoading={setResourceLoading}
        isBatchSetValid={!!setBatchSetValid}
      />
      <div className={getClassName('point-cloud-layout')} onContextMenu={(e) => e.preventDefault()}>
        <div className={getClassName('point-cloud-wrapper')}>
          <AnnotatedAttributesPanelFixedLeft />

          <div className={getClassName('point-cloud-content')} ref={contentRef}>
            <DynamicResizer
              direction='horizontal'
              localKey={
                'leftAllView' +
                'id:' +
                stepInfo?.id +
                'taskID:' +
                stepInfo?.taskID +
                'step:' +
                stepInfo?.step +
                'type:' +
                stepInfo?.type
              }
              defaultWidth={360}
              minLeftWidth={244}
              minRightWidth={'50%'}
              disabled={isLargeStatus}
            >
              <div
                className={getClassName(
                  'point-cloud-container',
                  isLargeStatus ? 'left-large' : 'left-noLarge',
                )}
              >
                <PointCloud3DView setResourceLoading={setResourceLoading} />
                {backAndSideView}
              </div>
              <div
                className={classNames({
                  [getClassName('point-cloud-container', 'right')]: true,
                  [getClassName('point-cloud-container', 'rightZoom')]: isEnlargeTopView,
                })}
                ref={rightRef}
              >
                <DynamicResizer
                  localKey={
                    'rightAllView' +
                    'id:' +
                    stepInfo?.id +
                    'taskID:' +
                    stepInfo?.taskID +
                    'step:' +
                    stepInfo?.step +
                    'type:' +
                    stepInfo?.type
                  }
                  defaultHeight={300}
                  minTopHeight={minTopHeight}
                  minBottomHeight={160}
                  disabled={isLargeStatus}
                >
                  <PointCloudTopView
                    drawLayerSlot={drawLayerSlot}
                    checkMode={checkMode}
                    intelligentFit={intelligentFit}
                    setIsEnlargeTopView={setIsEnlargeTopView}
                    onExitZoom={() => {
                      setIsLargeStatus(false);
                      setIsEnlargeTopView(false);
                    }}
                    isEnlargeTopView={isEnlargeTopView}
                  />
                  <div
                    className={classNames({
                      [getClassName(
                        'point-cloud-container',
                        isLargeStatus ? 'right-bottom-large' : 'right-bottom-noLarge',
                      )]: !isEnlargeTopView,
                      [getClassName('point-cloud-container', 'right-bottom-floatLeft')]:
                        isEnlargeTopView,
                    })}
                  >
                    <PointCloud2DView
                      isEnlargeTopView={isEnlargeTopView}
                      thumbnailWidth={isEnlargeTopView ? 300 : 455}
                      checkMode={checkMode}
                      measureVisible={measureVisible}
                    />
                  </div>
                </DynamicResizer>
              </div>
            </DynamicResizer>
          </div>

          <AnnotatedAttributesPanelFixedRight />
        </div>
      </div>
      {ptCtx.visibleBatchSetValid &&
        setBatchSetValid?.({
          valid: ptCtx.valid,
          isModal: true,
          visibleModal: ptCtx.visibleBatchSetValid,
          onClose: () => ptCtx.setBatchSetValidModal(false),
          singleSetQuestionImg: () => ptCtx.setPointCloudValid(!ptCtx.valid),
        })}
    </>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(PointCloudView);
