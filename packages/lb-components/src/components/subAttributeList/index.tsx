/*
 * @file subAttributeList in pointCloud and audioClip
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @createdate 2024-4-30
 */
import React, { useContext, useState, useEffect } from 'react';
import { Select, message, Input, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import AttributeList from '@/components/attributeList';

import {
  IInputList,
  IDefaultSize,
  EPointCloudSegmentStatus,
  IPointCloudSegmentation,
  EPointCloudPattern,
} from '@labelbee/lb-utils';

interface IProps {
  subAttributeList: IInputList[];
  setSubAttribute: (value: string, subAttribute: string) => void;
  getValue: (subAttribute: IInputList) => undefined | string;
}

const subTitleStyle = {
  margin: '12px 20px 8px',
  fontSize: 14,
  fontWeight: 500,
  wordWrap: 'break-word' as any, // WordWrap Type ?
};

const SubAttributeList = (props: IProps) => {
  const { subAttributeList, setSubAttribute, getValue } = props;
  const { t } = useTranslation();

  return (
    <>
      {subAttributeList.map(
        (subAttribute) =>
          subAttribute?.subSelected && (
            <div style={{ marginTop: 12 }} key={subAttribute.value}>
              <div style={subTitleStyle}>
                {t('SubAttribute')}-{subAttribute.key}
              </div>
              {subAttribute.subSelected?.length < 5 ? (
                <AttributeList
                  list={subAttribute.subSelected.map((v: IInputList) => ({
                    label: v.key,
                    value: v.value,
                  }))}
                  selectedAttribute={getValue(subAttribute)}
                  num='-'
                  forbidColor={true}
                  forbidDefault={true}
                  attributeChanged={(value) => setSubAttribute(subAttribute.value, value)}
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <Select
                  style={{ margin: '0px 21px 17px 16px', width: '87%' }}
                  value={getValue(subAttribute)}
                  placeholder={t('PleaseSelect')}
                  onChange={(value) => setSubAttribute(subAttribute.value, value)}
                  allowClear={true}
                >
                  {subAttribute.subSelected.map((sub: any) => (
                    <Select.Option key={sub.value} value={sub.value}>
                      {sub.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
              <Divider style={{ margin: 0 }} />
            </div>
          ),
      )}
    </>
  );
};

export default SubAttributeList;
