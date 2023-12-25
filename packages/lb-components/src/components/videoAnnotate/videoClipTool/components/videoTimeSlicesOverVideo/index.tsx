/**
 * @file 视频截取
 * @author lijingchi <lijingchi1@sensetime.com>
 * @createdate 2022-11-08
 */
import { classnames } from '@/utils';
import { MathUtils, AttributeUtils } from '@labelbee/lb-annotation';
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ETimeSliceType, TIME_SLICE_TYPE } from '../../constant';
import styles from './index.module.scss';

const VideoTimeSlicesOverVideo = (props: any) => {
  const { attributeList, result, currentTime, extraStyle } = props;

  const determineIfWithinTime = (i: any) => {
    const { type, start, end } = i;
    let withinTime = false;
    if (type === ETimeSliceType.Time) {
      withinTime = MathUtils.isInRange(currentTime, [start - 0.1, start + 0.1]);
    } else {
      withinTime = end === null || MathUtils.isInRange(currentTime, [start, end]);
    }
    return withinTime;
  };

  const timeSlices: any[] = [];
  const timeSlicesWithinTime: any[] = [];

  result.forEach((slice: any) => {
    const withinTime = determineIfWithinTime(slice);
    const target: any[] = withinTime ? timeSlicesWithinTime : timeSlices;

    target.push(slice);
  });

  const displayTimeSlices = timeSlicesWithinTime
    .sort((a, b) => a.start - b.start)
    .map((i) => ({ ...i, withinTime: true }));

  const children = displayTimeSlices.map((i: any) => (
    <CSSTransition classNames='fade' key={i.id} timeout={500}>
      <div
        className={classnames({
          [styles.timeSliceWrapper]: true,
          [styles.active]: i.withinTime,
        })}
      >
        <div
          className={styles.timeSliceItemAttribute}
          style={{
            textAlign: 'right',
          }}
        >
          <span
            style={{
              backgroundColor: AttributeUtils.getAttributeColor(i.attribute, attributeList),
            }}
          >
            {`${TIME_SLICE_TYPE[i.type]}: ${
              AttributeUtils.getAttributeShowText(i.attribute, attributeList) || '无属性'
            }`}
          </span>
        </div>

        {i.textAttribute && (
          <div className={styles.timeSliceItemText}>{`文本: ${i.textAttribute}`}</div>
        )}
      </div>
    </CSSTransition>
  ));

  return (
    <div className={styles.videoTimeSlices} style={extraStyle}>
      <TransitionGroup className='fade-group'>{children}</TransitionGroup>
    </div>
  );
};

export default VideoTimeSlicesOverVideo;
