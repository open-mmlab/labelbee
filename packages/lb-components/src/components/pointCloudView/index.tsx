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

interface IProps {
  imgList: IFileItem[];
}

const PointCloudView: React.FC<IProps> = ({ imgList }) => {
  if (imgList.length === 0) {
    return null;
  }

  return (
    <>
      <PointCloudListener />
      <div className={getClassName('point-cloud-layout')} onContextMenu={(e) => e.preventDefault()}>
        <div className={getClassName('point-cloud-wrapper')}>
          <div className={getClassName('point-cloud-container', 'left')}>
            <PointCloud2DView />
            <PointCloud3DView />
          </div>

          <div className={getClassName('point-cloud-container', 'right')}>
            <PointCloudTopView />
            <div className={getClassName('point-cloud-container', 'right-bottom')}>
              <PointCloudSideView />
              <PointCloudBackView />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: AppState) => ({
  imgList: state.annotation.imgList,
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(PointCloudView);
