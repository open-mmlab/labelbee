import { Switch } from 'antd';
import React, { FC, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';

export enum SwitchCuboidBoxIn2DViewStateMode {
  isHidden,
  is2d,
  is3d,
}

interface SwitchCuboidBoxIn2DViewProps {
  onChange?: (stateMode: SwitchCuboidBoxIn2DViewStateMode) => void;
}

const SwitchCuboidBoxIn2DView: FC<SwitchCuboidBoxIn2DViewProps> = (props) => {
  const { cuboidBoxIn2DView, setCuboidBoxIn2DView } = useContext(PointCloudContext);
  const { t } = useTranslation();

  const { isPointCloudSegmentationPattern } = useStatus();

  const onChange = (checked: boolean) => {
    setCuboidBoxIn2DView(checked);
  };

  const propOnChange = props.onChange;

  // Notify the external content what is the latest status
  useEffect(() => {
    if (!propOnChange) {
      return;
    }

    // Hidden component, refer the belowing `if (isPointCloudSegmentationPattern) { ... }`
    if (isPointCloudSegmentationPattern) {
      propOnChange(SwitchCuboidBoxIn2DViewStateMode.isHidden)
    } else {
      propOnChange(cuboidBoxIn2DView ? SwitchCuboidBoxIn2DViewStateMode.is3d : SwitchCuboidBoxIn2DViewStateMode.is2d);
    }
  }, [isPointCloudSegmentationPattern, cuboidBoxIn2DView, propOnChange]);

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
