import { getClassName } from '@/utils/dom';
import { Switch } from 'antd';
// import AddSvg from '@/assets/annotation/pointCloudTool/addSvg.svg';
// import ClearSvg from '@/assets/annotation/pointCloudTool/clearSvg.svg';
import React, { useContext, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { EPointCloudSegmentMode } from '@labelbee/lb-utils';

const PointCloudSegmentToolbar = () => {
  const { ptSegmentInstance } = useContext(PointCloudContext);
  const [_, reRender] = useState(0);

  const checked = ptSegmentInstance?.store.segmentMode === EPointCloudSegmentMode.Add;
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
    </div>
  );
};

export default PointCloudSegmentToolbar;
