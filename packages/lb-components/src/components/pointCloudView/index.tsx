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
import React from 'react';
import PointCloud3DView from './PointCloud3DView';
import PointCloudBackView from './PointCloudBackView';
import PointCloudTopView from './PointCloudTopView';
import PointCloudSideView from './PointCloudSideView';
import PointCloud2DView from './PointCloud2DView';
import PointCloudListener from './PointCloudListener';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { IFileItem } from '@/types/data';
import { LabelBeeContext } from '@/store/ctx';
import {
  AnnotatedAttributesPanelFixedLeft,
  AnnotatedAttributesPanelFixedRight,
} from '@/views/MainView/toolFooter/AnnotatedAttributes';
import { TDrawLayerSlot } from '@/types/main';

interface IProps {
  imgList: IFileItem[];
  drawLayerSlot?: TDrawLayerSlot;
  checkMode?: boolean;
}

const PointCloudView: React.FC<IProps> = ({ imgList, drawLayerSlot, checkMode }) => {
  if (imgList.length === 0) {
    return null;
  }

  return (
    <>
      <PointCloudListener checkMode={checkMode} />
      <div className={getClassName('point-cloud-layout')} onContextMenu={(e) => e.preventDefault()}>
        <div className={getClassName('point-cloud-wrapper')}>
          <AnnotatedAttributesPanelFixedLeft />

          <div className={getClassName('point-cloud-content')}>
            <div className={getClassName('point-cloud-container', 'left')}>
              <PointCloud2DView />
              <PointCloud3DView />
            </div>

            <div className={getClassName('point-cloud-container', 'right')}>
              <PointCloudTopView drawLayerSlot={drawLayerSlot} checkMode={checkMode} />
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

const mapStateToProps = (state: AppState) => ({
  imgList: state.annotation.imgList,
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(PointCloudView);
