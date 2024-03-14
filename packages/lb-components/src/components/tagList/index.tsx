/*
 * @file Used for tools to add label selections (Single selection or multiple selection)
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-02-22
 */
import React from 'react';
import { Col, Row, Tag, Radio } from 'antd';
import { IInputList, ISelectedTags, ITagListProps } from './types';
import styles from './index.module.scss';
import LongText from '@/components/longText';
import classNames from 'classnames';

const { CheckableTag } = Tag;

interface IChangeValue {
  key: string;
  tag: string;
  checked: boolean;
  isRadio?: boolean;
}

interface ICheckBoxList {
  selectedTags: ISelectedTags;
  handleChange: (value: IChangeValue) => void;
  tagItem: IInputList;
  disabeledAll?: boolean;
}

const CheckBoxList = ({ tagItem, selectedTags, handleChange, disabeledAll }: ICheckBoxList) => {
  const disabled = disabeledAll;
  const { isMulti, subSelected = [], value } = tagItem;
  const subSelectKey = value;
  if (isMulti) {
    return (
      <>
        {subSelected.map((tag: { key: string; value: string; isDefault: boolean }) => (
          <CheckableTag
            key={tag?.value}
            checked={selectedTags[subSelectKey]?.includes(tag?.value)}
            onChange={(checked: boolean) => {
              if (disabled) {
                return;
              }
              handleChange({ key: subSelectKey, tag: tag?.value, checked });
            }}
            className={classNames({
              [`${styles.disabled}`]: disabled,
              [`${styles.active}`]: disabled && selectedTags[subSelectKey]?.includes(tag?.value),
            })}
          >
            <span className={styles.tagItem}>
              <LongText text={tag?.key} openByText={true} />
            </span>
          </CheckableTag>
        ))}
      </>
    );
  }

  return (
    <Radio.Group
      onChange={(e) => {
        handleChange({
          key: subSelectKey,
          tag: e.target.value,
          checked: e.target.checked,
          isRadio: true,
        });
      }}
      value={selectedTags[subSelectKey]?.[0]}
    >
      {subSelected.map((tag) => (
        <Radio value={tag?.value} key={tag?.value} disabled={disabled}>
          <span className={styles.tagItem}>
            <LongText text={tag?.key} openByText={true} />
          </span>
        </Radio>
      ))}
    </Radio.Group>
  );
};

const TagList = (props: ITagListProps) => {
  const { selectedTags, updateValue, disabeledAll, inputList = [] } = props;

  const handleChange = (changeValue: IChangeValue) => {
    const { key, checked, tag, isRadio } = changeValue;
    let subSelectList = selectedTags[key] || [];
    if (isRadio) {
      subSelectList = [];
    }
    if (checked) {
      if (subSelectList?.includes(tag)) {
        return;
      }

      subSelectList.push(tag);
    } else if (!checked && subSelectList?.includes(tag)) {
      subSelectList = subSelectList.filter((t) => t !== tag);
    }
    const value = {
      key,
      value: subSelectList,
    };
    updateValue(value);
  };

  if (inputList?.length > 0) {
    return (
      <div className={styles.tagList}>
        {inputList.map((i, index) => {
          return (
            <Row key={index} className={styles.content}>
              <Col span={4} className={styles.left}>
                {i?.key}
              </Col>

              <Col span={20} className={styles.right}>
                <CheckBoxList
                  selectedTags={selectedTags}
                  handleChange={handleChange}
                  tagItem={i}
                  disabeledAll={disabeledAll}
                />
              </Col>
            </Row>
          );
        })}
      </div>
    );
  }
  return null;
};
export default TagList;
