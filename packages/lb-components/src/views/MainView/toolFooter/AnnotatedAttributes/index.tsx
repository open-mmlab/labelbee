import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Popover } from 'antd';
import React, { useContext } from 'react';
import { stepConfigSelector } from '@/store/annotation/selectors';
import { useSelector } from '@/store/ctx';
import { IPointCloudConfig } from '@labelbee/lb-utils';
import { CaretDownFilled, DeleteOutlined, EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { IInputList } from '@/types/main';

const AnnotatedAttributesItem = ({ attribute }: { attribute: IInputList }) => {
  const pointCloudCtx = useContext(PointCloudContext);
  const { pointCloudBoxList, hideAttributes, toggleAttributesVisible } = pointCloudCtx;

  const pointCloudListForSpecAttribute = pointCloudBoxList.filter(
    (i) => i.attribute === attribute.value,
  );

  const onVisibleChange = () => {
    toggleAttributesVisible(attribute.value);
  };

  const isHidden = hideAttributes.includes(attribute.value);

  return (
    <>
      {isHidden ? (
        <EyeInvisibleFilled onClick={onVisibleChange} />
      ) : (
        <EyeFilled onClick={onVisibleChange} />
      )}
      <CaretDownFilled />
      {attribute.key}
      <DeleteOutlined />
      {pointCloudListForSpecAttribute.map((box) => {
        return (
          <div key={box.trackID}>
            {box.trackID}
            {attribute.key}
          </div>
        );
      })}
    </>
  );
};

export const AnnotatedAttributesPanel = () => {
  const stepConfig: IPointCloudConfig = useSelector(stepConfigSelector);

  return (
    <div>
      <div>
        <span>固定在左侧</span>
        <span>固定在右侧</span>
      </div>

      <div>
        {stepConfig.attributeList.map((i) => (
          <div key={i.key} style={{ width: 300 }}>
            <AnnotatedAttributesItem attribute={i} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnnotatedAttributesIcon = () => {
  return (
    <Popover placement='topLeft' content={<AnnotatedAttributesPanel />}>
      <span>图片列表</span>
    </Popover>
  );
};
