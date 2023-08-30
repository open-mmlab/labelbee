import React, { useContext } from 'react';
import { Switch } from 'antd';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';

const SwitchCuboidBoxIn2DView = () => {
  const { cuboidBoxIn2DView, setCuboidBoxIn2DView } = useContext(PointCloudContext);

  const onChange = (checked: boolean) => {
    setCuboidBoxIn2DView(checked);
  };

  return (
    <>
      <span
        style={{
          marginRight: 10,
        }}
      >
        图片标注物
      </span>
      <Switch
        checkedChildren='3D框'
        unCheckedChildren='2D框'
        checked={cuboidBoxIn2DView}
        onChange={onChange}
      />
    </>
  );
};

export default SwitchCuboidBoxIn2DView;
