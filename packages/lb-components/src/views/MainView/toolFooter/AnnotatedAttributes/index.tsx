import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Modal } from 'antd';
import React, { useContext, useState } from 'react';
import { stepConfigSelector } from '@/store/annotation/selectors';
import { useSelector } from '@/store/ctx';
import { i18n, IPointCloudConfig } from '@labelbee/lb-utils';
import {
  CaretDownFilled,
  DeleteOutlined,
  EyeFilled,
  EyeInvisibleFilled,
  PushpinFilled,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { IInputList } from '@/types/main';
import { useHistory } from '@/components/pointCloudView/hooks/useHistory';
import { getClassName } from '@/utils/dom';
import StepUtils from '@/utils/StepUtils';
import { EPointCloudName } from '@labelbee/lb-annotation';
import { useTranslation } from 'react-i18next';
import FooterPopover from '../FooterPopover';

const AnnotatedAttributesItem = ({ attribute }: { attribute: IInputList }) => {
  const pointCloudCtx = useContext(PointCloudContext);
  const { t } = useTranslation();
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

  const getBoxKey = ({ trackID, order }: { trackID?: number; order?: number }) => {
    return trackID ? `trackID_${trackID}` : `order_${order}`;
  };

  const deleteGraphByAttr = (attribute: string) => {
    if (pointCloudListForSpecAttribute.length === 0) {
      return;
    }

    const newPolygonList = polygonList.filter((i) => attribute !== i.attribute);
    const newPointCloudList = pointCloudBoxList.filter((i) => attribute !== i.attribute);

    reRender(newPointCloudList, newPolygonList);

    setPolygonList(newPolygonList);
    setPointCloudResult(newPointCloudList);

    pushHistoryWithList({ pointCloudBoxList: newPointCloudList, polygonList: newPolygonList });
  };

  const onDeleteGraphByAttr = (attribute: IInputList) => {
    Modal.confirm({
      content: i18n.t('onDeleteGraphByAttr', { attribute: attribute.key }),
      onOk: () => {
        deleteGraphByAttr(attribute.value);
      },
      okText: i18n.t('Confirm'),
      cancelText: i18n.t('Cancel'),
    });
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
          rotate={expanded ? 0 : 270}
          onClick={() => {
            setExpanded(!expanded);
          }}
        />
        <span className={getClassName('annotated-attribute', 'item', 'text')}>{attribute.key}</span>

        <DeleteOutlined onClick={() => onDeleteGraphByAttr(attribute)} />
      </div>
      {console.log(pointCloudListForSpecAttribute)}
      {expanded &&
        (pointCloudListForSpecAttribute.length > 0 ? (
          pointCloudListForSpecAttribute.map((box) => {
            return (
              <div key={getBoxKey(box)} style={{ paddingLeft: 54 }}>
                {`${getBoxID(box)}.${attribute.key}`}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center' }}>{t('NoData')}</div>
        ))}
    </>
  );
};

export const AnnotatedAttributesPanel = () => {
  const stepConfig: IPointCloudConfig = useSelector(stepConfigSelector);
  const { attrPanelLayout, setAttrPanelLayout } = useContext(PointCloudContext);
  const { t } = useTranslation();
  console.log('stepConfig', 998);
  return (
    <div className={getClassName('annotated-attribute')}>
      {attrPanelLayout ? (
        <div className={getClassName('annotated-attribute', 'text')}>
          <span>{t('AnnotatedResult')}</span>
          <span
            className={getClassName('annotated-attribute', 'pin')}
            onClick={() => {
              setAttrPanelLayout('');
            }}
          >
            <PushpinFilled />
            {t('CancelFixed')}
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
            {t('FixedOnLeft')}
          </span>
          <span
            onClick={() => {
              setAttrPanelLayout('right');
            }}
            className={getClassName('annotated-attribute', 'pin')}
          >
            <PushpinFilled />
            {t('FixedOnRight')}
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
  const { t } = useTranslation();
  const stepInfo = useSelector((state) =>
    // @ts-ignore
    StepUtils.getCurrentStepInfo(state?.annotation?.step, state.annotation?.stepList),
  );

  if (stepInfo?.tool !== EPointCloudName.PointCloud) {
    return null;
  }

  if (attrPanelLayout) {
    return null;
  }

  return (
    <FooterPopover
      hoverIcon={<UnorderedListOutlined style={{ marginRight: 4 }} />}
      icon={<UnorderedListOutlined style={{ marginRight: 4 }} />}
      title={t('AnnotatedList')}
      content={<AnnotatedAttributesPanel />}
    />
  );
};
