import React, { useContext, useEffect, useState } from 'react';
import { getClassName } from '@/utils/dom';
import FinishSvg from '@/assets/annotation/pointCloudTool/finish.svg';
import CancelSvg from '@/assets/annotation/pointCloudTool/cancel.svg';
import { PointCloudContext } from './PointCloudContext';
import {
  EPointCloudSegmentFocusMode,
  EPointCloudSegmentStatus,
  IPointCloudSegmentation,
} from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const SegmentInfo: React.FC<{ infoList?: Array<{ key: string; value: string | number }> }> = ({
  infoList,
}) => {
  const { t } = useTranslation();

  if (!infoList) {
    return null;
  }

  return (
    <div className={getClassName('point-cloud-status', 'info')}>
      {infoList.map((v) => (
        <div key={v.key}>
          <span>{t(v.key)}： </span>
          <span>{v.value}</span>
        </div>
      ))}
    </div>
  );
};

const PointCloudSegmentStatus = () => {
  const { t } = useTranslation();
  const { ptSegmentInstance, setDefaultAttribute } = useContext(PointCloudContext);

  const [data, setData] = useState<{
    segmentStatus: EPointCloudSegmentStatus;
    cacheSegData?: IPointCloudSegmentation;
  }>({
    segmentStatus: EPointCloudSegmentStatus.Ready,
  });

  useEffect(() => {
    if (ptSegmentInstance) {
      const updateVisible = (newData: {
        segmentStatus: EPointCloudSegmentStatus;
        cacheSegData: IPointCloudSegmentation;
      }) => {
        setData(newData);
        if (newData.cacheSegData) {
          setDefaultAttribute(newData.cacheSegData.attribute);
        }
      };

      ptSegmentInstance?.on('syncPointCloudStatus', updateVisible);

      return () => {
        ptSegmentInstance?.unbind('syncPointCloudStatus', updateVisible);
      };
    }
  }, [ptSegmentInstance]);

  const status = data.segmentStatus;

  if (status === EPointCloudSegmentStatus.Ready) {
    return null;
  }

  const isCheckStatus = status === EPointCloudSegmentStatus.Check;
  const isEditStatus = status === EPointCloudSegmentStatus.Edit;

  let customButton: React.ReactNode = null;
  const pointsLength = (data.cacheSegData?.points?.length ?? 0) / 3;
  let infoList = [
    {
      key: 'SelectedPoints',
      value: pointsLength,
    },
    {
      key: 'Attribute',
      value: data.cacheSegData?.attribute ?? '',
    },
  ];
  if (isCheckStatus) {
    customButton = (
      <div className={getClassName('point-cloud-status', 'operation')}>
        <span
          className={getClassName('point-cloud-status', 'button')}
          onClick={() => {
            ptSegmentInstance?.emit('updateCheck2Edit');
          }}
        >
          {/* <img className={getClassName('point-cloud-status', 'icon')} src={FinishSvg} /> */}
          {t('EnterEditMode')}
          (Enter)
        </span>
      </div>
    );
  }

  if (isEditStatus) {
    customButton = (
      <div className={getClassName('point-cloud-status', 'operation')}>
        <span
          className={getClassName('point-cloud-status', 'button')}
          onClick={() => {
            ptSegmentInstance?.emit('addStash2Store');
            if (ptSegmentInstance?.store?.segmentFocusMode === EPointCloudSegmentFocusMode.Focus) {
              ptSegmentInstance?.emit('setSegmentFocusMode', EPointCloudSegmentFocusMode.Unfocus);
            }
          }}
        >
          <img className={getClassName('point-cloud-status', 'icon')} src={FinishSvg} />
          {t('Finish')}
        </span>
        <span
          className={getClassName('point-cloud-status', 'button')}
          onClick={() => {
            ptSegmentInstance?.emit('clearStash');
          }}
        >
          <img className={getClassName('point-cloud-status', 'icon')} src={CancelSvg} />
          {t('Cancel')}
        </span>
      </div>
    );
  }

  return (
    <>
      {customButton}
      <SegmentInfo infoList={infoList} />
    </>
  );
};
export default PointCloudSegmentStatus;
