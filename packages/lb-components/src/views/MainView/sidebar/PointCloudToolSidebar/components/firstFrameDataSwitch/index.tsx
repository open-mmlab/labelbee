import React from 'react';
import { Switch } from 'antd';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

const firstFrameDataSwitch = () => {
  const { t } = useTranslation();
  const ptCtx = React.useContext(PointCloudContext);

  const onChange = (value: boolean) => {
    ptCtx.setOnlyLoadFirstData(value);
  };

  return (
    <div className={styles.switchBox}>
      <div className={styles.switchLabel}>{t('OnlyLoadTheFirstFramePreAnnotation')}</div>
      <Switch defaultChecked={false} checked={ptCtx.onlyLoadFirstData} onChange={onChange} />
    </div>
  );
};

export default firstFrameDataSwitch;
