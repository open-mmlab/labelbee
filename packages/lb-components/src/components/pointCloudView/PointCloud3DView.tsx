/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import { getClassName } from '@/utils/dom';
import { PointCloud } from '@labelbee/lb-annotation';
import { EPerspectiveView, IBoxParams } from '@labelbee/lb-utils';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
const pointCloudID = 'LABELBEE-POINTCLOUD';

let pointCloudMain: any; // TODO

const PointCloud3D = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pointCloudRef = useRef<PointCloud>();

  const box: IBoxParams = {
    center: { x: 13, y: -1, z: 1 },
    volume: { depth: 2, width: 5, height: 2 },
    rotation: Math.PI / 6,
  };

  const hasSelectedBox = !!box;

  const setTarget3DView = (perspectiveView: EPerspectiveView) => {
    if (box) {
      pointCloudRef.current?.updateCameraByBox(box, perspectiveView);
    }
  };

  const reset3DView = () => {
    pointCloudRef.current?.resetCamera();
  };

  const getTaget3DViewClassname = (position: string) => {
    return classNames({
      [getClassName('point-cloud-3d-view', position)]: true,
      active: hasSelectedBox,
    });
  };

  useEffect(() => {
    if (ref.current) {
      pointCloudRef.current = new PointCloud({ container: ref.current });
      pointCloudRef.current.loadPCDFile('http://10.53.25.142:8001/1/000001.pcd');
      pointCloudMain = pointCloudRef.current;
    }
  }, []);

  return (
    <PointCloudContainer className={getClassName('point-cloud-3d-container')} title='3D视图'>
      <div className={getClassName('point-cloud-3d-content')}>
        <div className={getClassName('point-cloud-3d-sidebar')}>
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.Top);
            }}
            className={getTaget3DViewClassname('top')}
          />
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.Front);
            }}
            className={getTaget3DViewClassname('front')}
          />
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.Left);
            }}
            className={getTaget3DViewClassname('left')}
          />
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.Back);
            }}
            className={getTaget3DViewClassname('back')}
          />
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.Right);
            }}
            className={getTaget3DViewClassname('right')}
          />

          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.LFT);
            }}
            className={getTaget3DViewClassname('front-isometric')}
          />
          <span
            onClick={() => {
              setTarget3DView(EPerspectiveView.RBT);
            }}
            className={getTaget3DViewClassname('back-isometric')}
          />
          <span
            onClick={() => {
              reset3DView();
            }}
            className={getClassName('point-cloud-3d-view', 'reset')}
          />
        </div>

        <div className={getClassName('point-cloud-3d-view')} id={pointCloudID} ref={ref} />
      </div>
    </PointCloudContainer>
  );
};

export default PointCloud3D;

export { pointCloudMain };
