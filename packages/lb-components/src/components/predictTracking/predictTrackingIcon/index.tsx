import { Button, message } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import icon from '@/assets/predictTracking/icon.svg';
import { useSingleBox } from '@/components/pointCloudView/hooks/useSingleBox';
import { AppState } from '@/store';
import {
  ChangeSave,
  GetBoxesByID,
  SetPointCloudLoading,
  SetPredictResult,
  SetPredictResultVisible,
} from '@/store/annotation/actionCreators';
import { IPointCloudBoxWithIndex } from '@/store/annotation/types';
import { LabelBeeContext, useDispatch } from '@/store/ctx';

import { predict } from '../previewResult/util';
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';

const PredictTrackingIcon = (props: { loading: boolean; predictionResultVisible: boolean }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isPointCloudSegmentationPattern } = useStatus();

  const { loading, predictionResultVisible } = props;
  const { selectedBox } = useSingleBox();

  const handler = async () => {
    if (loading || predictionResultVisible) {
      return;
    }

    const selectedBoxTrackID = selectedBox?.info.trackID;

    if (!selectedBoxTrackID) {
      message.error(t('BeforePredictStarting'));
      return;
    }

    await dispatch(ChangeSave);

    const selectedBoxID = selectedBox?.info.id;

    const boxes: any = await dispatch(GetBoxesByID(selectedBoxTrackID, selectedBoxID));

    if (boxes.length < 2) {
      message.error(t('MarkOnlyOne'));
      return;
    }

    const selectedBoxIDIndex = boxes.findIndex(
      (item: IPointCloudBoxWithIndex) => item.id === selectedBoxID,
    );

    const start = boxes[selectedBoxIDIndex - 1];
    const end = boxes[selectedBoxIDIndex];

    const difference = end.index - start.index;

    if (difference < 2) {
      message.error(t('HaveNoNeed'));
      return;
    }

    if (difference > 8) {
      message.error(t('ThePredictedPointCloud'));
      return;
    }

    message.success(
      t('PredictingDataFrom', {
        startPage: start.index + 1,
        endPage: end.index + 1,
        selectedBoxTrackID,
      }),
    );

    SetPointCloudLoading(dispatch, true);
    const result = predict(start, end);
    SetPredictResult(dispatch, result);
    SetPredictResultVisible(dispatch, true);
  };

  if (isPointCloudSegmentationPattern) {
    return null;
  }

  return (
    <Button
      type='link'
      onClick={handler}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        alignItems: 'center',
      }}
    >
      <img src={icon} style={{ alignSelf: 'center' }} />
      <span style={{ color: '#797979' }}>{t('ComplementaryTracking')}</span>
    </Button>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    loading: state.annotation.loading,
    predictionResultVisible: state.annotation.predictionResultVisible,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  PredictTrackingIcon,
);
