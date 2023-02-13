import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Popover } from 'antd';
import React, { useContext, useState } from 'react';
import { stepConfigSelector } from '@/store/annotation/selectors';
import { useSelector } from '@/store/ctx';
import { IPointCloudConfig } from '@labelbee/lb-utils';
import {
  CaretDownFilled,
  DeleteOutlined,
  EyeFilled,
  EyeInvisibleFilled,
  PushpinFilled,
} from '@ant-design/icons';
import { IInputList } from '@/types/main';
import { useHistory } from '@/components/pointCloudView/hooks/useHistory';
import { getClassName } from '@/utils/dom';

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

  const [expanded, setExpanded] = useState(false);

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
      <div className={getClassName('annotated-attribute', 'item')}>
        {isHidden ? (
          <EyeInvisibleFilled onClick={onVisibleChange} />
        ) : (
          <EyeFilled onClick={onVisibleChange} />
        )}
        <CaretDownFilled
          rotate={expanded ? 270 : 0}
          onClick={() => {
            setExpanded(!expanded);
          }}
        />
        <span className={getClassName('annotated-attribute', 'item', 'text')}>{attribute.key}</span>

        <DeleteOutlined onClick={() => deleteGraphByAttr(attribute.value)} />
      </div>
      {pointCloudListForSpecAttribute.map((box) => {
        return (
          <div key={getBoxID(box)} style={{ paddingLeft: 54 }}>
            {`${getBoxID(box)}.${attribute.key}`}
          </div>
        );
      })}
    </>
  );
};

export const AnnotatedAttributesPanel = () => {
  const stepConfig: IPointCloudConfig = useSelector(stepConfigSelector);
  const { attrPanelLayout, setAttrPanelLayout } = useContext(PointCloudContext);

  return (
    <div className={getClassName('annotated-attribute')}>
      {attrPanelLayout ? (
        <div className={getClassName('annotated-attribute', 'text')}>
          <span>标注结果</span>
          <span
            className={getClassName('annotated-attribute', 'pin')}
            onClick={() => {
              setAttrPanelLayout('');
            }}
          >
            <PushpinFilled />
            取消固定
          </span>
        </div>
      ) : (
        <div className={getClassName('annotated-attribute', 'text')}>
          <span
            onClick={() => {
              setAttrPanelLayout('left');
            }}
            className={getClassName('annotated-attribute', 'pin')}
          >
            <PushpinFilled />
            固定在左侧
          </span>
          <span
            onClick={() => {
              setAttrPanelLayout('right');
            }}
            className={getClassName('annotated-attribute', 'pin')}
          >
            <PushpinFilled />
            固定在右侧
          </span>
        </div>
      )}

      <div>
        {stepConfig.attributeList.map((i) => (
          <AnnotatedAttributesItem attribute={i} key={i.value} />
        ))}
      </div>
    </div>
  );
};

export const AnnotatedAttributesPanelFixedLeft = () => {
  const { attrPanelLayout } = useContext(PointCloudContext);
  if (attrPanelLayout === 'left') {
    return <AnnotatedAttributesPanel />;
  }

  return null;
};

export const AnnotatedAttributesPanelFixedRight = () => {
  const { attrPanelLayout } = useContext(PointCloudContext);

  if (attrPanelLayout === 'right') {
    return <AnnotatedAttributesPanel />;
  }
  return null;
};

export const AnnotatedAttributesIcon = () => {
  const { attrPanelLayout } = useContext(PointCloudContext);

  if (attrPanelLayout) {
    return null;
  }

  return (
    <Popover
      placement='topLeft'
      content={<AnnotatedAttributesPanel />}
      overlayClassName={getClassName('annotated-attribute', 'popover')}
    >
      <span>图片列表</span>
    </Popover>
  );
};
