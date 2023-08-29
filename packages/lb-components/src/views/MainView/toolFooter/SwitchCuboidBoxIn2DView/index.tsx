import React, { useContext } from 'react';
import { Switch } from 'antd';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';

interface IProps {
  showSwitchCuboidBoxIn2DView: boolean;
}

const SwitchCuboidBoxIn2DView = (props: IProps) => {
  const { showSwitchCuboidBoxIn2DView } = props;
  const { cuboidBoxIn2DView, setCuboidBoxIn2DView } = useContext(PointCloudContext);

  const onChange = (checked: boolean) => {
    setCuboidBoxIn2DView(checked);
  };

  if (!showSwitchCuboidBoxIn2DView) {
    return null;
  }

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
