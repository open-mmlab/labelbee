import React, { useEffect } from 'react';
import { Switch, Tooltip } from 'antd';
import useToolConfigStore from '@/store/toolConfig';
import { useTranslation } from 'react-i18next';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const selectBoxVisibleSwitch: React.FC = () => {
  const { t } = useTranslation();
  const { selectBoxVisibleSwitch, setSelectBoxVisibleSwitch } = useToolConfigStore();

  useEffect(() => {
    // After the page rendering is completed, the default value for selectBoxVisibleSwitch is set to false
    setSelectBoxVisibleSwitch(false);
  }, []);

  const onChange = (value: boolean) => {
    setSelectBoxVisibleSwitch(value);
  };

  return (
    <div className={styles.switchBox}>
      <div className={styles.switchLeft}>
        <div className={styles.switchTitle}>{t('SelectBoxToDisplayIndependently')}</div>
        <Tooltip
          placement='top'
          title={<div style={{ width: '210px' }}>{t('SelectBoxSwitchTips')}</div>}
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </div>
      <Switch defaultChecked={false} checked={selectBoxVisibleSwitch} onChange={onChange} />
    </div>
  );
};

export default selectBoxVisibleSwitch;
