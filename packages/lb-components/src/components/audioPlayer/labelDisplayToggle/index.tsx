import { Switch } from 'antd';
import React, { useState } from 'react';

import styles from './index.module.scss';

interface IProps {
  EventBus: any
}
const LabelDisplayToggle = (props: IProps) => {
  const { EventBus } = props
  const [visible, setVisible] = useState(true);
  const onChange = (val: boolean) => {
    EventBus.emit('toggleShowLabel', val);
    setVisible(val);
  };

  return (
    <span className={styles.remarkDisplayToggle}>
      <span className={styles.text}>标签对照显示</span>
      <Switch
        checked={visible}
        onChange={onChange}
        size='small'
        style={{ minWidth: 32, backgroundColor: visible ? '#6371ff' : 'rgb(204, 204, 204)' }}
      />
    </span>
  );
};
export default LabelDisplayToggle;
