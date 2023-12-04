import styles from './index.module.scss';
import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const syntheticEventStopPagination = (e: React.KeyboardEvent<HTMLInputElement>) => {
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};
/** 标签搜索框 */
const LabelFilterInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Input
      className={styles.filterInput}
      prefix={
        <SearchOutlined
          style={{
            marginRight: 5,
            color: '#999',
          }}
        />
      }
      onKeyDown={(e) => {
        syntheticEventStopPagination(e);
      }}
      allowClear={true}
      placeholder={t('SearchTag')}
      value={value}
      onChange={onChange}
    />
  );
};

export default LabelFilterInput;
