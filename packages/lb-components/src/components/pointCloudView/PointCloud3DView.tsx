/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import { getClassName } from '@/utils/dom';
import { PointCloud } from '@labelbee/lb-annotation';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
const pointCloudID = 'LABELBEE-POINTCLOUD';
import { PointCloudContext } from './PointCloudContext';

let pointCloudMain: any; // TODO

const PointCloud3DContext = React.createContext<{
  isActive: boolean;
  setTarget3DView: (perspectiveView: EPerspectiveView) => void;
  reset3DView: () => void;
}>({
  isActive: false,
  setTarget3DView: () => {},
  reset3DView: () => {},
});

const PointCloudViewIcon = ({
  perspectiveView,
}: {
  perspectiveView: keyof typeof EPerspectiveView;
}) => {
  const { isActive, setTarget3DView } = useContext(PointCloud3DContext);

  const getTaget3DViewClassname = (position: string) => {
    return classNames({
      [getClassName('point-cloud-3d-view', position)]: true,
      active: isActive,
    });
  };

  return (
    <span
      onClick={() => {
        setTarget3DView(EPerspectiveView[perspectiveView]);
      }}
      className={getTaget3DViewClassname(perspectiveView.toLocaleLowerCase())}
    />
  );
};

const PointCloud3DSideBar = () => {
  const { reset3DView } = useContext(PointCloud3DContext);
  return (
    <div className={getClassName('point-cloud-3d-sidebar')}>
      <PointCloudViewIcon perspectiveView='Top' />
      <PointCloudViewIcon perspectiveView='Front' />
      <PointCloudViewIcon perspectiveView='Left' />
      <PointCloudViewIcon perspectiveView='Back' />
      <PointCloudViewIcon perspectiveView='Right' />
      <PointCloudViewIcon perspectiveView='LFT' />
      <PointCloudViewIcon perspectiveView='RBT' />
      <PointCloudViewIcon perspectiveView='LFT' />
      <span
        onClick={() => {
          reset3DView();
        }}
        className={getClassName('point-cloud-3d-view', 'reset')}
      />
    </div>
  );
};

const PointCloud3D = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pointCloudRef = useRef<PointCloud>();
  const { selectedID, pointCloudBoxList } = useContext(PointCloudContext);

  const hasSelectedBox = selectedID;

  const setTarget3DView = (perspectiveView: EPerspectiveView) => {
    const box = hasSelectedBox
      ? pointCloudBoxList.find((i: IPointCloudBox) => i.id === selectedID)
      : undefined;

    if (box) {
      pointCloudRef.current?.updateCameraByBox(box, perspectiveView);
    }
  };

  const reset3DView = () => {
    pointCloudRef.current?.resetCamera();
  };

  useEffect(() => {
    if (ref.current) {
      pointCloudRef.current = new PointCloud({
        container: ref.current,
        backgroundColor: '#4c4c4c',
      });
      pointCloudRef.current.loadPCDFile('http://10.53.25.142:8001/10837/1/total.pcd');
      pointCloudMain = pointCloudRef.current;
    }
  }, []);

  /**
   *  Observe selectedID and reset camera to target top-view
   */
  useEffect(() => {
    if (selectedID) {
      setTarget3DView(EPerspectiveView.Top);
    }
  }, [selectedID]);

  const ptCloud3DCtx = useMemo(() => {
    return { reset3DView, setTarget3DView, isActive: !!selectedID };
  }, [selectedID]);

  return (
    <PointCloudContainer className={getClassName('point-cloud-3d-container')} title='3D视图'>
      <div className={getClassName('point-cloud-3d-content')}>
        <PointCloud3DContext.Provider value={ptCloud3DCtx}>
          <PointCloud3DSideBar />
        </PointCloud3DContext.Provider>
        <div className={getClassName('point-cloud-3d-view')} id={pointCloudID} ref={ref} />
      </div>
    </PointCloudContainer>
  );
};

export default PointCloud3D;

export { pointCloudMain };
