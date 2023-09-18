import { Switch } from 'antd';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';

const SwitchCuboidBoxIn2DView = () => {
  const { cuboidBoxIn2DView, setCuboidBoxIn2DView } = useContext(PointCloudContext);
  const { t } = useTranslation();

  const { isPointCloudSegmentationPattern } = useStatus();

  const onChange = (checked: boolean) => {
    setCuboidBoxIn2DView(checked);
  };

  if (isPointCloudSegmentationPattern) {
    return null;
  }

  return (
    <>
      <span
        style={{
          marginRight: 10,
        }}
      >
        {t('ImageLabels')}
      </span>
      <Switch
        checkedChildren={t('3DRect')}
        unCheckedChildren={t('2DRect')}
        checked={cuboidBoxIn2DView}
        onChange={onChange}
      />
    </>
  );
};

export default SwitchCuboidBoxIn2DView;
