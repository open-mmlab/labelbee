/*
 * @file LLM tool indicator determine
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */
import React from 'react';
import { prefix } from '@/constant';
import { Radio } from 'antd';
import { useTranslation } from 'react-i18next';

interface IProps {
  title: string;
  selectValue?: number;
  isDisableAll?: boolean;
  unpdateValue: (changeValue: boolean) => void;
}

const DetermineGroup = (props: IProps) => {
  const { title, selectValue, isDisableAll, unpdateValue } = props;
  const { t } = useTranslation();
  return (
    <div className={`${prefix}-LLMSidebar-contentBox`}>
      <span style={{ width: '160px' }}>{title}</span>
      <Radio.Group
        value={selectValue}
        onChange={(e) => unpdateValue(e.target.value)}
        disabled={isDisableAll}
      >
        <Radio value={true} key={1}>
          {t('Yes')}
        </Radio>
        <Radio value={false} key={2}>
          {t('No')}
        </Radio>
      </Radio.Group>
    </div>
  );
};

export default DetermineGroup;
