import React, { useEffect } from 'react';
import { Switch } from 'antd';
import useToolConfigStore from '@/store/toolConfig';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

const firstFrameDataSwitch: React.FC = () => {
  const { t } = useTranslation();
  const { onlyLoadFirstData, setOnlyLoadFirstData } = useToolConfigStore();

  useEffect(() => {
    // After the page rendering is completed, the default value for onlyLoadFirstData is set to false
    setOnlyLoadFirstData(false);
  }, []);

  const onChange = (value: boolean) => {
    setOnlyLoadFirstData(value);
  };

  return (
    <div className={styles.switchBox}>
      <div className={styles.switchLabel}>{t('OnlyLoadTheFirstFramePreAnnotation')}</div>
      <Switch defaultChecked={false} checked={onlyLoadFirstData} onChange={onChange} />
    </div>
  );
};

export default firstFrameDataSwitch;
