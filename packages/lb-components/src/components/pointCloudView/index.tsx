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
import React, { useContext, useEffect, useState } from 'react';
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
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

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
  const { globalPattern, setGlobalPattern, selectedIDs } = ptCtx;
  const { t } = useTranslation();

  const [isEnlargeTopView, setIsEnlargeTopView] = useState(false);
  const selectAndEnlarge = selectedIDs?.length > 0 && isEnlargeTopView;

  const BACK_SIDE_CONTAIN_WIDTH = 455;
  const BACK_SIDE_CONTAIN_HEIGHT = 400;
  const initPositionX = window.innerWidth - BACK_SIDE_CONTAIN_WIDTH;
  const initPositionY = window.innerHeight - BACK_SIDE_CONTAIN_HEIGHT;

  const [position, setPosition] = useState({
    x: initPositionX,
    y: initPositionY,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onResize = () => {
    const initPositionX = window.innerWidth - BACK_SIDE_CONTAIN_WIDTH;
    const initPositionY = window.innerHeight - BACK_SIDE_CONTAIN_HEIGHT;

    setPosition({
      x: initPositionX,
      y: initPositionY,
    });
  };

  if (imgList.length === 0) {
    return null;
  }

  if (globalPattern === EPointCloudPattern.Segmentation) {
    return (
      <>
        <PointCloudSegmentListener checkMode={checkMode} toolInstanceRef={toolInstanceRef} />
        <PointCloudSegmentToolbar />
        <PointCloudSegment checkMode={checkMode} />
        <PointCloudSegmentStatus />
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
      <div
        className={classNames({
          [getClassName('point-cloud-container', 'left-bottom')]: true,
          [getClassName('point-cloud-container', 'left-bottom-float')]: selectAndEnlarge,
        })}
        style={{
          top: position.y,
          left: position.x,
          width: 360,
        }}
      >
        {selectAndEnlarge && (
          <div
            className={getClassName('point-cloud-container', 'left-bottom-floatHeader')}
            draggable={'true'}
            onDragStart={(event) => {
              if (selectAndEnlarge) {
                setOffset({
                  x: event.clientX - position.x,
                  y: event.clientY - position.y,
                });
              }
            }}
            onDrag={(e: any) => {
              const moveX = e.clientX - offset.x;
              const moveY = e.clientY - offset.y;
              setPosition({ x: moveX, y: moveY });
            }}
            onDragEnd={(e: any) => {
              const moveX = e.clientX - offset.x;
              const moveY = e.clientY - offset.y;
              setPosition({ x: moveX, y: moveY });
            }}
          >
            {t('HoldDrag')}
          </div>
        )}
        <PointCloudBackView checkMode={checkMode} />
        <PointCloudSideView checkMode={checkMode} />
      </div>
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
              <PointCloud3DView />
              {backAndSideView}
            </div>
            <div
              className={classNames({
                [getClassName('point-cloud-container', 'right')]: true,
                [getClassName('point-cloud-container', 'rightZoom')]: isEnlargeTopView,
              })}
            >
              <PointCloudTopView
                drawLayerSlot={drawLayerSlot}
                checkMode={checkMode}
                intelligentFit={intelligentFit}
                setIsEnlargeTopView={setIsEnlargeTopView}
                onExitZoom={() => {
                  setIsEnlargeTopView(false);
                  setPosition({
                    x: initPositionX,
                    y: initPositionY,
                  });
                  setOffset({ x: 0, y: 0 });
                }}
                isEnlargeTopView={isEnlargeTopView}
              />
              <div
                className={classNames({
                  [getClassName('point-cloud-container', 'right-bottom')]: !isEnlargeTopView,
                  [getClassName('point-cloud-container', 'right-bottom-floatLeft')]:
                    isEnlargeTopView,
                })}
              >
                <PointCloud2DView
                  thumbnailWidth={isEnlargeTopView ? 300 : 455}
                  hiedZoom={isEnlargeTopView}
                />
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
