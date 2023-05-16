import { getClassName } from '@/utils/dom';
import { message, Switch } from 'antd';
// import AddSvg from '@/assets/annotation/pointCloudTool/addSvg.svg';
// import ClearSvg from '@/assets/annotation/pointCloudTool/clearSvg.svg';
import CoverMode from '@/assets/annotation/pointCloudTool/coverMode.svg';
import UnCoverMode from '@/assets/annotation/pointCloudTool/unCoverMode.svg';
import React, { useContext, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudSegmentCoverMode, EPointCloudSegmentMode } from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const PointCloudSegmentToolbar = () => {
  const { t } = useTranslation()
  const { ptSegmentInstance } = useContext(PointCloudContext);
  const [_, reRender] = useState(0);

  const checked = ptSegmentInstance?.store.segmentMode === EPointCloudSegmentMode.Add;
  const coverMode = ptSegmentInstance?.store?.segmentCoverMode

  return (
    <div className={getClassName('point-cloud-toolbar')}>
      {/* <Switch checkedChildren={<img src={AddSvg} />} unCheckedChildren={<img src={ClearSvg} />} /> */}
      <Switch
        checkedChildren='+'
        unCheckedChildren='-'
        checked={checked}
        onChange={(checked) => {
          ptSegmentInstance?.store.setSegmentMode(
            checked ? EPointCloudSegmentMode.Add : EPointCloudSegmentMode.Remove,
          );
          reRender((v) => v + 1);
        }}
      />
      <div style={{ marginLeft: 16 }} onClick={() => {
        ptSegmentInstance?.store.setSegmentCoverMode(coverMode === EPointCloudSegmentCoverMode.Cover ? EPointCloudSegmentCoverMode.Uncover : EPointCloudSegmentCoverMode.Cover)
        message.info({
          content: t(coverMode === EPointCloudSegmentCoverMode.Cover ? 'PointCloudUncoverMode' : 'PointCloudCoverMode'),
          icon: () => null,
        })
        reRender((v) => v + 1)
      }}>
        <img
          src={coverMode === EPointCloudSegmentCoverMode.Cover ? CoverMode : UnCoverMode}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default PointCloudSegmentToolbar;
