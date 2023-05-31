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
import React, { useContext, useEffect } from 'react';
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
import { connect } from 'react-redux';
import { LabelBeeContext } from '@/store/ctx';
import {
  AnnotatedAttributesPanelFixedLeft,
  AnnotatedAttributesPanelFixedRight,
} from '@/views/MainView/toolFooter/AnnotatedAttributes';
import { TDrawLayerSlot } from '@/types/main';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudPattern, PointCloudUtils } from '@labelbee/lb-utils';
import { useCustomToolInstance } from '@/hooks/annotation';
import { jsonParser } from '@/utils';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';

interface IProps extends IA2MapStateProps {
  drawLayerSlot?: TDrawLayerSlot;
  checkMode?: boolean;
  intelligentFit?: boolean;
}

const PointCloudView: React.FC<IProps> = ({
  currentData,
  imgList,
  drawLayerSlot,
  checkMode,
  intelligentFit,
  imgIndex,
}) => {
  const ptCtx = useContext(PointCloudContext);
  const { globalPattern, setGlobalPattern } = ptCtx;

  const basicInfo = jsonParser(currentData.result);
  const { toolInstanceRef, clearToolInstance } = useCustomToolInstance({ basicInfo });

  useEffect(() => {
    toolInstanceRef.current.setPointCloudGlobalPattern = (pattern: EPointCloudPattern) => {
      if (pattern !== globalPattern) {
        setGlobalPattern(pattern);
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
    if (currentData) {
      const { boxParamsList, polygonList, lineList, sphereParamsList, segmentation } =
        PointCloudUtils.parsePointCloudCurrentResult(currentData?.result ?? '');

      ptCtx.setPointCloudResult(boxParamsList);
      ptCtx.setPolygonList(polygonList);
      ptCtx.setLineList(lineList);
      ptCtx.setPointCloudSphereList(sphereParamsList);
      ptCtx.setSegmentation(segmentation);
    }
  }, [imgIndex]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [ptCtx.pointCloudBoxList, { valid: ptCtx.valid }];
    };

    toolInstanceRef.current.exportCustomData = () => {
      return {
        resultPolygon: ptCtx.polygonList ?? [],
        resultLine: ptCtx.lineList ?? [],
        resultPoint: ptCtx.pointCloudSphereList ?? [],
        segmentation: ptCtx.segmentation ?? [],
      };
    };
  }, [
    ptCtx.pointCloudBoxList,
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
        <PointCloudSegment />
        <PointCloudSegmentStatus />
        {drawLayerSlot?.({
          direct: true,
        })}
      </>
    );
  }

  return (
    <>
      <PointCloudListener checkMode={checkMode} toolInstanceRef={toolInstanceRef} />
      <div className={getClassName('point-cloud-layout')} onContextMenu={(e) => e.preventDefault()}>
        <div className={getClassName('point-cloud-wrapper')}>
          <AnnotatedAttributesPanelFixedLeft />

          <div className={getClassName('point-cloud-content')}>
            <div className={getClassName('point-cloud-container', 'left')}>
              <PointCloud2DView />
              <PointCloud3DView />
            </div>

            <div className={getClassName('point-cloud-container', 'right')}>
              <PointCloudTopView
                drawLayerSlot={drawLayerSlot}
                checkMode={checkMode}
                intelligentFit={intelligentFit}
              />
              <div className={getClassName('point-cloud-container', 'right-bottom')}>
                <PointCloudSideView checkMode={checkMode} />
                <PointCloudBackView checkMode={checkMode} />
              </div>
            </div>
          </div>

          <AnnotatedAttributesPanelFixedRight />
        </div>
      </div>
    </>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(PointCloudView);
