/*
 * @file subAttributeList in pointCloud and audioClip
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @createdate 2024-4-30
 */
import React from 'react';
import { Select, Divider, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import AttributeList from '@/components/attributeList';

import { IInputList } from '@labelbee/lb-utils';

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

  const setSubAttributeValue = (value: string, subAttribute: string | string[]) => {
    if (Array.isArray(subAttribute)) {
      setSubAttribute(value, subAttribute.join(';'));
      return;
    }
    setSubAttribute(value, subAttribute);
  };

  const getInputValue = (subAttribute: IInputList) => {
    const value = getValue(subAttribute);

    if (subAttribute?.isMulti) {
      return value ? value?.split(';') : [];
    }

    return value;
  };

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
                subAttribute?.isMulti ? (
                  <Checkbox.Group
                    style={{
                      padding: `0px 20px 16px 16px`,
                    }}
                    options={subAttribute.subSelected.map((v: IInputList) => ({
                      label: v.key,
                      value: v.value,
                    }))}
                    value={getInputValue(subAttribute) as string[]}
                    onChange={(value) =>
                      setSubAttributeValue(subAttribute.value, value as string[])
                    }
                  />
                ) : (
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
                )
              ) : (
                <Select
                  style={{ margin: '0px 20px 16px 16px', width: '87%' }}
                  mode={subAttribute?.isMulti ? 'multiple' : undefined}
                  value={getInputValue(subAttribute)}
                  placeholder={t('PleaseSelect')}
                  onChange={(value) => setSubAttributeValue(subAttribute.value, value)}
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
