/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import { getClassName } from '@/utils/dom';
import { PointCloud } from '@labelbee/lb-annotation';
import {
  EPerspectiveView,
  IPointCloudBox,
  PointCloudUtils,
  toolStyleConverter,
} from '@labelbee/lb-utils';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import { PointCloudContext } from './PointCloudContext';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { connect } from 'react-redux';
import { jsonParser } from '@/utils';
import { useSingleBox } from './hooks/useSingleBox';
import { useSphere } from './hooks/useSphere';
import { Switch, Tooltip } from 'antd';
import useSize from '@/hooks/useSize';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import PointCloudSizeSlider from './components/PointCloudSizeSlider';
import TitleButton from './components/TitleButton';

const pointCloudID = 'LABELBEE-POINTCLOUD';
const PointCloud3DContext = React.createContext<{
  isActive: boolean;
  setTarget3DView: (perspectiveView: EPerspectiveView) => void;
  reset3DView: () => void;
  followTopView: () => void;
}>({
  isActive: false,
  setTarget3DView: () => {},
  reset3DView: () => {},
  followTopView: () => {},
});

const PointCloudViewIcon = ({
  perspectiveView,
}: {
  perspectiveView: keyof typeof EPerspectiveView;
}) => {
  const { isActive, setTarget3DView } = useContext(PointCloud3DContext);

  const getTarget3DViewClassName = (position: string) => {
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
      className={getTarget3DViewClassName(perspectiveView.toLocaleLowerCase())}
    />
  );
};

const PointCloud3DSideBar = () => {
  const { reset3DView, followTopView } = useContext(PointCloud3DContext);
  const { t } = useTranslation();
  return (
    <div className={getClassName('point-cloud-3d-sidebar')}>
      <PointCloudViewIcon perspectiveView='Top' />
      <PointCloudViewIcon perspectiveView='Front' />
      <PointCloudViewIcon perspectiveView='Left' />
      <PointCloudViewIcon perspectiveView='Back' />
      <PointCloudViewIcon perspectiveView='Right' />
      <PointCloudViewIcon perspectiveView='LFT' />
      <PointCloudViewIcon perspectiveView='RBT' />

      <Tooltip title={t('CameraFollowTopView')}>
        <span
          onClick={() => {
            followTopView();
          }}
          className={getClassName('point-cloud-3d-view', 'followTop')}
        />
      </Tooltip>

      <span
        onClick={() => {
          reset3DView();
        }}
        className={getClassName('point-cloud-3d-view', 'reset')}
      />
    </div>
  );
};

const PointCloud3D: React.FC<IA2MapStateProps> = ({ currentData, config }) => {
  const ptCtx = useContext(PointCloudContext);
  const [showDirection, setShowDirection] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const { initPointCloud3d } = usePointCloudViews();
  const size = useSize(ref);
  const { t } = useTranslation();
  useEffect(() => {
    if (!ptCtx.mainViewInstance) {
      return;
    }
    initPointCloud3d?.(size);
  }, [size]);
  const { selectedBox } = useSingleBox();
  const { selectedSphere } = useSphere();

  const setTarget3DView = (perspectiveView: EPerspectiveView) => {
    const box = selectedBox?.info;

    if (box) {
      // Business Logic: If the updated view is top, need to sync with topView Direction in 3dView.
      const topViewVector = { ...box.center };
      topViewVector.x = topViewVector.x - 0.01;
      topViewVector.z = 1000; // The position of camera needs to be set to a higher;
      const isTopView = perspectiveView === EPerspectiveView.Top;

      ptCtx.mainViewInstance?.updateCameraByBox(
        box,
        perspectiveView,
        isTopView ? topViewVector : undefined,
      );
    }
    if (selectedSphere) {
      ptCtx.mainViewInstance?.updateCameraBySphere(selectedSphere, perspectiveView);
    }
  };

  const reset3DView = () => {
    ptCtx.mainViewInstance?.resetCamera();
  };

  const followTopView = () => {
    const topViewCamera = ptCtx.topViewInstance?.pointCloudInstance.camera;
    if (topViewCamera) {
      ptCtx.mainViewInstance?.applyCameraTarget(topViewCamera);
    }
  };

  useEffect(() => {
    if (ref.current && currentData?.url) {
      let pointCloud = ptCtx.mainViewInstance;
      // Just for Init.
      if (!pointCloud && size.width) {
        // Need to be showed
        pointCloud = new PointCloud({
          container: ref.current,
          isOrthographicCamera: true,
          orthographicParams: PointCloudUtils.getDefaultOrthographicParams(size),
          config,
        });
        ptCtx.setMainViewInstance(pointCloud);
      }
    }
  }, [size, currentData]);

  /**
   * Listen for data changes.
   */
  useEffect(() => {
    if (ref.current && currentData?.url) {
      if (currentData.result && ptCtx.mainViewInstance) {
        let pointCloud = ptCtx.mainViewInstance;
        const boxParamsList = PointCloudUtils.getBoxParamsFromResultList(currentData.result);

        // Add Init Box
        boxParamsList.forEach((v: IPointCloudBox) => {
          const hex = toolStyleConverter.getColorFromConfig(
            { attribute: v.attribute },
            { ...config, attributeConfigurable: true },
            {},
          )?.hex;

          pointCloud?.generateBox(v, hex);
        });

        ptCtx.setPointCloudResult(boxParamsList);
        ptCtx.setPointCloudValid(jsonParser(currentData.result)?.valid);
      }
    }
  }, [currentData, ptCtx.mainViewInstance]);

  /**
   *  Observe selectedID and reset camera to target top-view
   */
  useEffect(() => {
    if (selectedBox) {
      setTarget3DView(EPerspectiveView.Top);

      /**
       * 3DView's zoom synchronizes with topView' zoom.
       */
      const zoom = ptCtx.topViewInstance?.pointCloudInstance?.camera.zoom ?? 1;
      ptCtx.mainViewInstance?.updateCameraZoom(zoom);
    }
  }, [selectedBox]);

  useEffect(() => {
    if (selectedSphere) {
      setTarget3DView(EPerspectiveView.Top);

      /**
       * 3DView's zoom synchronizes with topView' zoom.
       */
      const zoom = ptCtx.topViewInstance?.pointCloudInstance?.camera.zoom ?? 1;
      ptCtx.mainViewInstance?.updateCameraZoom(zoom);
    }
  }, [selectedSphere]);

  const ptCloud3DCtx = useMemo(() => {
    return { reset3DView, setTarget3DView, isActive: !!selectedBox, followTopView };
  }, [selectedBox, ptCtx.mainViewInstance]);

  const PointCloud3DTitle = (
    <>
      <PointCloudSizeSlider
        onChange={(v: number) => {
          ptCtx.mainViewInstance?.updatePointSize({ customSize: v });
        }}
      />
      <span style={{ marginRight: 8 }}>{t('ShowArrows')}</span>
      <Switch
        size='small'
        checked={showDirection}
        onChange={(showDirection) => {
          setShowDirection(showDirection);
          ptCtx.mainViewInstance?.setShowDirection(showDirection);
        }}
      />
    </>
  );

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-3d-container')}
      title={<TitleButton title={t('3DView')} onClick={() => {}} />}
      toolbar={PointCloud3DTitle}
    >
      <div className={getClassName('point-cloud-3d-content')}>
        <PointCloud3DContext.Provider value={ptCloud3DCtx}>
          <PointCloud3DSideBar />
        </PointCloud3DContext.Provider>
        <div className={getClassName('point-cloud-3d-view')} id={pointCloudID} ref={ref} />
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(PointCloud3D);
