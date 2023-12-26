/**
 * @file 视频截取工具，片段截取时间范围
 * @author lijingchi <lijingchi1@sensetime.com>
 * @createdate 2022-11-07
 */
import { IVideoTimeSlice } from '@labelbee/lb-utils';
import { classnames } from '@/utils';
import { Input, message } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ETimeSliceType, PER_SLICE_CHANGE } from '../../constant';
import styles from './index.module.scss';
import { timeFormat, precisionAdd, precisionMinus } from '@/utils/audio'
import { decimalReserved } from '@/components/videoPlayer/utils'
import { useTranslation } from 'react-i18next';

const TimeInput = ({
  initialVal,
  timeType = '',
  videoPlayer,
  min,
  max,
  updateTime,
  disabled,
}: {
  initialVal: number;
  timeType?: string;
  min?: number;
  max?: number;
  videoPlayer?: any;
  updateTime: (time: number) => void;
  disabled?: boolean;
}) => {
  const [time, setTime] = useState('');
  const { t } = useTranslation()

  const applyTime = () => {
    validateTime(time)
      .then((timeVal) => {
        updateTime(timeVal as number);
      })
      .catch((errMsg) => {
        message.error(errMsg);
        setInitialVal();
      });
  };

  const timeFormat2Val = (str: string) => {
    const [minute, second] = str.split(':');
    return ~~minute * 60 + parseFloat(second);
  };

  const isOutOfRange = (timeVal: number, isClickEvent = false) => {
    if (min !== undefined && timeVal < min) {
      const displayMin = timeFormat(min, 'ss.SS');
      return isClickEvent
        ? `修改时间失败, 修改时间不允许少于${displayMin}`
        : `当前时间格式输入有误, 输入时间不允许少于${displayMin}`;
    }

    if (max !== undefined && timeVal > max) {
      const displayMax = timeFormat(max, 'ss.SS');
      return isClickEvent
        ? `修改时间失败, 修改时间不允许大于${displayMax}`
        : `当前时间格式输入有误, 输入时间不允许大于${displayMax}`;
    }

    const duration = videoPlayer?.duration;

    if (videoPlayer && duration && timeVal > duration) {
      const displayDuration = timeFormat(duration, 'ss.SS');
      return isClickEvent
        ? `修改时间失败, 输入时间不允许大于${displayDuration}`
        : `当前时间格式输入有误, 输入时间不允许大于${displayDuration}`;
    }
  };

  const validateTime = (time: string) => {
    return new Promise((resolve, reject) => {
      if (time.match(/^\d+\:\d\d\.\d\d$/)) {
        const timeVal = timeFormat2Val(time);

        const outOfRange = isOutOfRange(timeVal);
        if (outOfRange) {
          reject(outOfRange);
          return;
        }

        resolve(timeVal);
      } else {
        reject(new Error('当前时间格式输入有误, 时间格式应为xx:xx.xx'));
      }
    });
  };

  const setInitialVal = () => {
    if (_.isNumber(initialVal)) {
      setTime(timeFormat(initialVal, 'ss.SS'));
    }
  };

  const useCurrentTime = () => {
    if (disabled) {
      return;
    }
    if (videoPlayer) {
      const curTime = decimalReserved(videoPlayer?.currentTime, 2);
      const outOfRange = isOutOfRange(curTime, true);
      if (outOfRange) {
        message.error(outOfRange);
        return;
      }
      updateTime(curTime);
    }
  };

  useEffect(() => {
    setInitialVal();
  }, [initialVal]);

  return (
    <div className={styles.inputWrapper}>
      <Input
        placeholder='00:00.00'
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={applyTime}
        onPressEnter={applyTime}
        disabled={disabled}
      />
      <span
        className={classnames({
          [styles.getCurr as string]: true,
          [styles.disabled as string]: disabled ?? false,
        })}
        onClick={useCurrentTime}
      >
        {
          timeType === 'start' ? t('GetStartTime') : t('GetEndTime')
        }
      </span>
    </div>
  );
};

/**
 * 选中的片段进行时间更新的输入模块
 * @returns
 */
const TimeSliceRange = ({
  selectedTimeSlice,
  videoPlayer,
  updateTimeForSelected,
  disabled,
}: {
  selectedTimeSlice?: IVideoTimeSlice;
  videoPlayer?: any;
  updateTimeForSelected: (val: number, key: 'start' | 'end') => void;
  disabled: boolean;
}) => {
  if (!selectedTimeSlice) {
    return null;
  }
  const { t } = useTranslation();
  if (selectedTimeSlice?.type === ETimeSliceType.Period) {
    return (
      <div className={styles.timeSliceInputContainer}>
        <div className={styles.title}>{t('ClipTime')}</div>
        <div className={styles.inputContainer}>
          <TimeInput
            initialVal={selectedTimeSlice.start}
            timeType='start'
            videoPlayer={videoPlayer}
            max={precisionMinus(selectedTimeSlice.end as number, PER_SLICE_CHANGE)}
            updateTime={(val) => {
              updateTimeForSelected(val, 'start');
            }}
            disabled={disabled}
          />
          <span className={styles.spliter} />
          <TimeInput
            initialVal={selectedTimeSlice.end as number}
            timeType='end'
            videoPlayer={videoPlayer}
            min={precisionAdd(selectedTimeSlice.start as number, PER_SLICE_CHANGE)}
            updateTime={(val) => {
              updateTimeForSelected(val, 'end');
            }}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timeSliceInputContainer}>
      <div className={styles.title}>{t('StampTime')}</div>
      <TimeInput
        initialVal={selectedTimeSlice.start as number}
        videoPlayer={videoPlayer}
        updateTime={(val) => {
          updateTimeForSelected(val, 'start');
        }}
      />
    </div>
  );
};

export default TimeSliceRange;
