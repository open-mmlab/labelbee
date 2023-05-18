import { getClassName } from '@/utils/dom';
import { message, Switch, Tooltip } from 'antd';
// import AddSvg from '@/assets/annotation/pointCloudTool/addSvg.svg';
// import ClearSvg from '@/assets/annotation/pointCloudTool/clearSvg.svg';
import CoverMode from '@/assets/annotation/pointCloudTool/coverMode.svg';
import UnCoverMode from '@/assets/annotation/pointCloudTool/unCoverMode.svg';
import React, { useContext, useEffect, useState } from 'react';
import { HidePointCloudSegmentSvg, FocusModeSvg } from '@/assets/annotation/pointCloudTool/svg'
import { PointCloudContext } from './PointCloudContext';
import {
  EPointCloudSegmentCoverMode,
  EPointCloudSegmentMode,
  EPointCloudSegmentFocusMode,
  EPointCloudSegmentStatus, IPointCloudSegmentation,
} from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const PointCloudSegmentToolbar = () => {
  const { t } = useTranslation();
  const { ptSegmentInstance } = useContext(PointCloudContext);
  const [mode, setMode] = useState(
    ptSegmentInstance?.store?.segmentMode ?? EPointCloudSegmentMode.Add,
  );

  const [coverMode, setCoverMode] = useState(
    ptSegmentInstance?.store?.segmentCoverMode ?? EPointCloudSegmentCoverMode.Cover,
  );

  const [focusMode, setFocusMode] = useState(
    ptSegmentInstance?.store.segmentFocusMode ?? EPointCloudSegmentFocusMode.Unfocus,
  );

  const [hideSegment, setHideSegment] = useState(ptSegmentInstance?.store.hideSegment ?? false)

  const [data, setData] = useState<{
    segmentStatus: EPointCloudSegmentStatus;
    cacheSegData?: IPointCloudSegmentation;
  }>({
    segmentStatus: EPointCloudSegmentStatus.Ready,
  });

  useEffect(() => {
    if (!ptSegmentInstance) {
      return;
    }

    const updateSegmentMode = (mode: EPointCloudSegmentMode) => {
      setMode(mode);
    };
    const updateCoverMode = (coverMode: EPointCloudSegmentCoverMode) => {
      setCoverMode(coverMode);
    };

    const updateFocusMode = (focusMode: EPointCloudSegmentFocusMode) => {
      setFocusMode(focusMode)
    }

    const switchHideSegment = (hideSegment: boolean) => {
      setHideSegment(hideSegment)
    }

    const updateData = (newData: {
      segmentStatus: EPointCloudSegmentStatus;
      cacheSegData: IPointCloudSegmentation;
    }) => {
      setData(newData);
    };

    ptSegmentInstance.on('setSegmentMode', updateSegmentMode);
    ptSegmentInstance.on('setSegmentCoverMode', updateCoverMode);
    ptSegmentInstance.on('setSegmentFocusMode', updateFocusMode);
    ptSegmentInstance.on('switchHideSegment', switchHideSegment);
    ptSegmentInstance.on('syncPointCloudStatus', updateData);
    return () => {
      ptSegmentInstance.unbind('setSegmentMode', updateSegmentMode);
      ptSegmentInstance.unbind('setSegmentCoverMode', updateCoverMode);
      ptSegmentInstance.unbind('setSegmentFocusMode', updateFocusMode);
      ptSegmentInstance.unbind('switchHideSegment', switchHideSegment);
      ptSegmentInstance.unbind('syncPointCloudStatus', updateData);
    };
  }, [ptSegmentInstance]);

  const checked = mode === EPointCloudSegmentMode.Add;
  const focusInvalid = hideSegment === true || !data?.cacheSegData
  const hideInvalid = focusMode === EPointCloudSegmentFocusMode.Focus
  return (
    <div className={getClassName('point-cloud-toolbar')}>
      {/* <Switch checkedChildren={<img src={AddSvg} />} unCheckedChildren={<img src={ClearSvg} />} /> */}
      <Switch
        checkedChildren='+'
        unCheckedChildren='-'
        checked={checked}
        onChange={(checked) => {
          ptSegmentInstance?.emit(
            'setSegmentMode',
            checked ? EPointCloudSegmentMode.Add : EPointCloudSegmentMode.Remove,
          );
        }}
      />
      <div
        className={getClassName('point-cloud-toolbox')}
        onClick={() => {
          ptSegmentInstance?.emit(
            'setSegmentCoverMode',
            coverMode === EPointCloudSegmentCoverMode.Cover
              ? EPointCloudSegmentCoverMode.Uncover
              : EPointCloudSegmentCoverMode.Cover,
          );
          message.info({
            content: t(
              coverMode === EPointCloudSegmentCoverMode.Cover
                ? 'PointCloudUncoverMode'
                : 'PointCloudCoverMode',
            ),
            icon: () => null,
          });
        }}
      >
        <img
          src={coverMode === EPointCloudSegmentCoverMode.Cover ? CoverMode : UnCoverMode}
        />
      </div>
      <Tooltip title={focusInvalid ? t(hideSegment === true ? "PointCloudHideFocusInvalid_hide" : "PointCloudHideFocusInvalid_none") : ''}>
        <div
          className={getClassName('point-cloud-toolbox')}
          onClick={() => {
            if (focusInvalid) return
            ptSegmentInstance?.emit(
              'setSegmentFocusMode',
              focusMode === EPointCloudSegmentFocusMode.Focus
                ? EPointCloudSegmentFocusMode.Unfocus
                : EPointCloudSegmentFocusMode.Focus
            )
            message.success(t(focusMode === EPointCloudSegmentFocusMode.Focus ? 'PointCloudUnfocusMode' : 'PointCloudFocusMode'))
          }}
        >
          <FocusModeSvg
            color={focusInvalid ? '#CCC' : (focusMode === EPointCloudSegmentFocusMode.Focus) ? '#1664FF' : '#FFF' }
          />
        </div>
      </Tooltip>
      <Tooltip title={hideInvalid ? t('PointCloudHideSegmentInvalid') : ''}>
        <div
          className={getClassName('point-cloud-toolbox')}
          onClick={() => {
            if (hideInvalid) return
            ptSegmentInstance?.emit('switchHideSegment', !hideSegment)
            message.success(t(hideSegment === true ? 'PointCloudShowSegment' : 'PointCloudHideSegment'))
          }}
        >
          <HidePointCloudSegmentSvg
            color={hideInvalid ? '#CCC' : hideSegment ? '#1664FF' : '#FFF' }
          />
        </div>
      </Tooltip>
    </div>
  );
};

export default PointCloudSegmentToolbar
