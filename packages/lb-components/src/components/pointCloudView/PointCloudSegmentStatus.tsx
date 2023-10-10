import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { getClassName } from '@/utils/dom';
import FinishSvg from '@/assets/annotation/pointCloudTool/finish.svg';
import CancelSvg from '@/assets/annotation/pointCloudTool/cancel.svg';
import { PointCloudContext } from './PointCloudContext';
import {
  EPointCloudSegmentFocusMode,
  EPointCloudSegmentStatus,
  IPointCloudConfig,
  IPointCloudSegmentation,
  PointCloudUtils,
} from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const SegmentInfo: React.FC<{ infoList?: Array<{ key: string; value: ReactNode }> }> = ({
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

const PointCloudSegmentStatus = (props: { config: IPointCloudConfig }) => {
  const { config } = props;
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

      const updateHoverData = ({
        segmentData,
        currentSegmentStatus,
      }: {
        segmentData?: IPointCloudSegmentation;
        currentSegmentStatus: EPointCloudSegmentStatus;
      }) => {
        // Just run in ready.
        if (currentSegmentStatus !== EPointCloudSegmentStatus.Ready) {
          return;
        }

        if (!segmentData) {
          setData({
            segmentStatus: EPointCloudSegmentStatus.Ready,
          });
          return;
        }
        setData({
          segmentStatus: EPointCloudSegmentStatus.Hover,
          cacheSegData: segmentData,
        });
      };

      ptSegmentInstance?.on('syncPointCloudStatus', updateVisible);
      ptSegmentInstance?.on('hoverSegmentInstance', updateHoverData);

      return () => {
        ptSegmentInstance?.unbind('syncPointCloudStatus', updateVisible);
        ptSegmentInstance?.unbind('hoverSegmentInstance', updateHoverData);
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
  const infoList: Array<{ key: string; value: ReactNode }> = [
    {
      key: 'SelectedPoints',
      value: pointsLength,
    },
    {
      key: 'Attribute',
      value:
        config.attributeList.find((item) => item.value === data.cacheSegData?.attribute)?.key ?? '',
    },
  ];

  if (Object.keys(data.cacheSegData?.subAttribute || {}).length > 0) {
    infoList.push({
      key: 'SubAttribute',
      value: PointCloudUtils.getSubAttributeName(data.cacheSegData?.subAttribute || {}, config).map(
        (item) => {
          return (
            <div key={item.label}>
              {item.label} - {item.value}
            </div>
          );
        },
      ),
    });
  }

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
            if (ptSegmentInstance?.store?.segmentFocusMode === EPointCloudSegmentFocusMode.Focus) {
              ptSegmentInstance?.emit('setSegmentFocusMode', EPointCloudSegmentFocusMode.Unfocus);
            }
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
