import React from 'react';
import { getClassName } from '@/utils/dom';
import { Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface IProps {
  onChange: (checked: boolean) => void;
  defaultChecked: boolean;
  loading: boolean;
}

const PointCloudDynamicHighlightSwitch = ({ onChange, defaultChecked, loading }: IProps) => {
  const { t } = useTranslation();
  return (
    <span className={getClassName('point-cloud-container', 'switch-container')}>
      <span className={getClassName('point-cloud-container', 'switch-container', 'label')}>
      {t('HighlightedInsideRect')}
      </span>
      <span className={getClassName('point-cloud-container', 'switch-container', 'switch')}>
        <Switch
          onChange={onChange}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked={defaultChecked}
          loading={loading}
        />
      </span>
    </span>
  );
};

export default PointCloudDynamicHighlightSwitch;
