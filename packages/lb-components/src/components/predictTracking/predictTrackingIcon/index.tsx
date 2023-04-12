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
import { LabelBeeContext, useDispatch } from '@/store/ctx';

import { predict } from '../previewResult/util';

const PredictTrackingIcon = (props: { loading: boolean }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { loading } = props;
  const { selectedBox } = useSingleBox();

  const handler = async () => {
    if (loading) {
      return;
    }

    const selectedBoxTrackID = selectedBox?.info.trackID;

    if (!selectedBoxTrackID) {
      message.error(t('BeforePredictStarting'));
      return;
    }

    await dispatch(ChangeSave);

    const boxes: any = await dispatch(GetBoxesByID(selectedBoxTrackID));

    if (boxes.length < 2) {
      message.error(t('BeforePredictStarting'));
      return;
    }

    const start = boxes[boxes.length - 2];
    const end = boxes[boxes.length - 1];

    const difference = end.index - start.index;

    if (difference < 2) {
      message.error(t('BeforePredictStarting'));
      return;
    }

    if (difference > 8) {
      message.error(t('ThePredictedPointCloud'));
      return;
    }

    SetPointCloudLoading(dispatch, true);
    const result = predict(start, end);
    SetPredictResult(dispatch, result);
    SetPredictResultVisible(dispatch, true);
  };

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
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  PredictTrackingIcon,
);
