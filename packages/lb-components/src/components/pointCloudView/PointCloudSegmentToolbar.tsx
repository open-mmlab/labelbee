import { getClassName } from '@/utils/dom';
import { message, Switch } from 'antd';
// import AddSvg from '@/assets/annotation/pointCloudTool/addSvg.svg';
// import ClearSvg from '@/assets/annotation/pointCloudTool/clearSvg.svg';
import CoverMode from '@/assets/annotation/pointCloudTool/coverMode.svg';
import UnCoverMode from '@/assets/annotation/pointCloudTool/unCoverMode.svg';
import React, { useContext, useEffect, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudSegmentCoverMode, EPointCloudSegmentMode } from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const PointCloudSegmentToolbar = () => {
  const { t } = useTranslation();
  const { ptSegmentInstance } = useContext(PointCloudContext);
  const [mode, setMode] = useState(
    ptSegmentInstance?.store.segmentMode ?? EPointCloudSegmentMode.Add,
  );

  const [coverMode, setCoverMode] = useState(
    ptSegmentInstance?.store.segmentCoverMode ?? EPointCloudSegmentCoverMode.Cover,
  );

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

    ptSegmentInstance.on('setSegmentMode', updateSegmentMode);
    ptSegmentInstance.on('setSegmentCoverMode', updateCoverMode);
    return () => {
      ptSegmentInstance.unbind('setSegmentMode', updateSegmentMode);
      ptSegmentInstance.unbind('setSegmentCoverMode', updateCoverMode);
    };
  }, [ptSegmentInstance]);

  const checked = mode === EPointCloudSegmentMode.Add;
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
        style={{ marginLeft: 16 }}
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
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default PointCloudSegmentToolbar;
