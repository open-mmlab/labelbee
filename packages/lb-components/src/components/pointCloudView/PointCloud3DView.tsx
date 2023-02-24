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
import { Switch } from 'antd';
import useSize from '@/hooks/useSize';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';

const pointCloudID = 'LABELBEE-POINTCLOUD';
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

  const setTarget3DView = (perspectiveView: EPerspectiveView) => {
    const box = selectedBox?.info;

    if (box) {
      ptCtx.mainViewInstance?.updateCameraByBox(box, perspectiveView);
    }
  };

  const reset3DView = () => {
    ptCtx.mainViewInstance?.resetCamera();
  };

  /**
   * Listen for data changes.
   */
  useEffect(() => {
    if (ref.current && currentData?.url) {
      let pointCloud = ptCtx.mainViewInstance;
      if (!pointCloud && size.width) {
        const orthographicParams = {
          left: -size.width / 2,
          right: size.width / 2,
          top: size.height / 2,
          bottom: -size.height / 2,
          near: 100,
          far: -100,
        };

        // Need to be showed
        pointCloud = new PointCloud({
          container: ref.current,
          isOrthographicCamera: true,
          orthographicParams,
          config,
        });
        ptCtx.setMainViewInstance(pointCloud);
      }

      if (currentData.result) {
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
  }, [currentData, size]);

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

  const ptCloud3DCtx = useMemo(() => {
    return { reset3DView, setTarget3DView, isActive: !!selectedBox };
  }, [selectedBox]);

  const PointCloud3DTitle = (
    <div>
      <span style={{ marginRight: 8 }}>{t('ShowArrows')}</span>
      <Switch
        size='small'
        checked={showDirection}
        onChange={(showDirection) => {
          setShowDirection(showDirection);
          ptCtx.mainViewInstance?.setShowDirection(showDirection);
        }}
      />
    </div>
  );

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-3d-container')}
      title={t('3DView')}
      toolbar={PointCloud3DTitle}
      style={{
        height:
          currentData.mappingImgList && currentData.mappingImgList?.length > 0 ? '55%' : '100%',
      }}
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
