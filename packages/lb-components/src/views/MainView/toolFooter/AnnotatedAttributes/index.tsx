import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Popover } from 'antd';
import React, { useContext } from 'react';
import { stepConfigSelector } from '@/store/annotation/selectors';
import { useSelector } from '@/store/ctx';
import { IPointCloudConfig } from '@labelbee/lb-utils';
import { CaretDownFilled, DeleteOutlined, EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { IInputList } from '@/types/main';
import { useHistory } from '@/components/pointCloudView/hooks/useHistory';

const AnnotatedAttributesItem = ({ attribute }: { attribute: IInputList }) => {
  const pointCloudCtx = useContext(PointCloudContext);
  const {
    pointCloudBoxList,
    hideAttributes,
    toggleAttributesVisible,
    polygonList,
    setPolygonList,
    setPointCloudResult,
    reRender,
  } = pointCloudCtx;

  const { pushHistoryWithList } = useHistory();

  const pointCloudListForSpecAttribute = [...pointCloudBoxList, ...polygonList].filter(
    (i) => i.attribute === attribute.value,
  );

  const onVisibleChange = () => {
    toggleAttributesVisible(attribute.value);
  };

  const isHidden = hideAttributes.includes(attribute.value);

  const getBoxID = ({ trackID, order }: { trackID?: number; order?: number }) => {
    return trackID ? trackID : order;
  };

  const deleteGraphByAttr = (attribute: string) => {
    if (pointCloudListForSpecAttribute.length === 0) {
      return;
    }

    const newPolygonList = polygonList.filter((i) => attribute !== i.attribute);
    const newPointCloudList = pointCloudBoxList.filter((i) => attribute !== i.attribute);
    setPolygonList(newPolygonList);
    setPointCloudResult(newPointCloudList);

    reRender(newPointCloudList, newPolygonList);

    pushHistoryWithList({ pointCloudBoxList: newPointCloudList, polygonList: newPolygonList });
  };

  return (
    <>
      {isHidden ? (
        <EyeInvisibleFilled onClick={onVisibleChange} />
      ) : (
        <EyeFilled onClick={onVisibleChange} />
      )}
      <CaretDownFilled />
      {attribute.key}
      <DeleteOutlined onClick={() => deleteGraphByAttr(attribute.value)} />
      {pointCloudListForSpecAttribute.map((box) => {
        return (
          <div key={getBoxID(box)}>
            {getBoxID(box)}
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
