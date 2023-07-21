/*
 * @file LLM tool indicator determine
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */
import React from 'react';
import { prefix } from '@/constant';
import { Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import LongText from '@/components/longText';

interface IProps {
  title: string;
  selectValue?: boolean;
  isDisableAll?: boolean;
  updateValue: (changeValue: boolean) => void;
}

const DetermineGroup = (props: IProps) => {
  const { title, selectValue, isDisableAll, updateValue } = props;

  const { t } = useTranslation();
  return (
    <div className={`${prefix}-LLMSidebar-contentBox`}>
      <span style={{ width: '160px' }}>
        <LongText text={title} openByText={true} />
      </span>
      <Radio.Group
        value={selectValue}
        onChange={(e) => updateValue(e.target.value)}
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
