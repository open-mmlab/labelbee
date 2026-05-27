/**
 * @file 视频截取工具右侧标注结果展示
 * @author lijingchi <lijingchi1@sensetime.com>
 * @createdate 2022-11-08
 */
import { timeFormat } from '@/utils/audio';
import { IVideoTimeSlice } from '@labelbee/lb-utils';
import { classnames } from '@/utils';
import { EnvironmentFilled, ScissorOutlined, CloseCircleFilled } from '@ant-design/icons';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EClipStatus, ETimeSliceType, TIME_SLICE_TYPE } from '../../constant';
import TimeSliceRange from '../timeSliceRange';
import ToolTipForClip from '../ToolTipForClip';
import { getDisplayContent } from '../videoTrack';
import styles from './index.module.scss';
import { decimalReserved } from '@/components/videoPlayer/utils'
import { LabelBeeContext } from '@/store/ctx';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

/**
 * 片段类型ICON
 * @returns
 */
const TimeSliceIcon = ({ type }: { type: number }) => {
  return type === ETimeSliceType.Time ? <EnvironmentFilled /> : <ScissorOutlined rotate={270} />;
};

/**
 * 标注列表无数据
 * @returns
 */
const EmptyVideoClipAnnotatedList = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.noContent}>
      <div>{t('NoClippedData')}</div>
      <div>
        <span className={styles.hotkey}>X</span>{t('ClipSlice')}
      </div>
      <div>
        <span className={styles.hotkey}>E</span>{t('TimeStamp')}
      </div>
    </div>
  );
};

/**
 * 标注列表包裹组件，无内容时渲染 EmptyVideoClipAnnotatedList
 * @returns
 */
const VideoClipAnnotatedListWrapper = ({
  children,
  scrollRef,
}: {
  children: any;
  scrollRef?: React.Ref<HTMLDivElement>;
}) => {
  const isEmpty = children.length === 0;

  return (
    <div
      ref={scrollRef}
      className={classnames({
        [styles.empty]: isEmpty,
        [styles.timeSliceListContent]: true,
      })}
    >
      {isEmpty ? <EmptyVideoClipAnnotatedList /> : children}
    </div>
  );
};

const VideoClipAnnotatedItem = ({
  timeSliceProps,
  index,
  exportContext,
  onItemClick,
}: {
  timeSliceProps: IVideoTimeSlice;
  index: number;
  exportContext: any;
  onItemClick: (timeSliceProps: IVideoTimeSlice) => void;
}) => {
  const { selectedID, attributeList, removeTimeSlice } = exportContext;

  return (
    <div
      key={index}
      className={classnames({
        [styles.timeSliceItem]: true,
        [styles.timeSliceItemActivated]: timeSliceProps.id === selectedID,
      })}
      onClick={() => {
        onItemClick(timeSliceProps);
      }}
    >
      <ToolTipForClip
        slot={
          <div className={styles.timeSliceItemContent}>
            <div className={styles.textOverflow}>
              {`${index + 1}、【${TIME_SLICE_TYPE[timeSliceProps.type]}】 ${getDisplayContent(
                timeSliceProps,
                attributeList,
              )}`}
            </div>

            <div
              className={classnames({
                [styles.textOverflow]: true,
              })}
            >
              <TimeSliceIcon type={timeSliceProps.type} />

              <span style={{ marginLeft: 10 }}>
                {`${timeFormat(timeSliceProps.start, 'ss:SS')} ${
                  timeSliceProps.end && timeSliceProps.type === ETimeSliceType.Period
                    ? '~ ' +
                      timeFormat(timeSliceProps.end, 'ss:SS') +
                      ', ' +
                    decimalReserved(timeSliceProps.end - timeSliceProps.start, 2) +
                      's'
                    : ''
                }`}
              </span>
            </div>
          </div>
        }
        item={timeSliceProps}
        attributeList={attributeList}
      />
      <CloseCircleFilled
        className={styles.timeSliceItemDeleteIcon}
        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.stopPropagation();
          removeTimeSlice(timeSliceProps);
        }}
      />
    </div>
  );
};

const VideoClipAnnotatedList = (props: { toolInstance: any }) => {
  const { toolInstance } = props
  const { selectedID, result, videoPlayer, clipStatus, updateSelectedSliceTimeProperty } = toolInstance?.exportContext || {}

  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const skipScrollRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('changeClipSidebar', (index: number) => {
        forceRender((s) => s + 1);
      });
    }
    return () => {
      toolInstance?.unbindAll?.('changeClipSidebar');
    };
  }, [toolInstance]);

  const selectedTimeSlice = result?.find((i: any) => i.id === selectedID);
  const resultList = useMemo(
    () =>
      [...(result?.filter((i: IVideoTimeSlice) => i.end !== null) ?? [])].sort(
        (a, b) => a.start - b.start,
      ),
    [result, _],
  );
  const handleItemClick = (timeSliceProps: IVideoTimeSlice) => {
    skipScrollRef.current = true;
    toolInstance.exportContext.onSelectedTimeSlice(timeSliceProps);
  };

  useLayoutEffect(() => {
    if (!selectedID || !listRef.current) {
      return;
    }
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    const index = resultList.findIndex((i: IVideoTimeSlice) => i.id === selectedID);
    if (index >= 0) {
      listRef.current.children[index]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedID, _, resultList]);

  if (!toolInstance?.exportContext) {
    return null
  }
  return (
    <div>
      <div className={styles.timeSliceListHeader}>{t('AnnotatedList')}</div>
      <VideoClipAnnotatedListWrapper scrollRef={listRef}>
        {resultList?.map((timeSliceProps: IVideoTimeSlice, index: number) => (
          <VideoClipAnnotatedItem
            timeSliceProps={timeSliceProps}
            index={index}
            key={timeSliceProps.id}
            exportContext={toolInstance?.exportContext || {}}
            onItemClick={handleItemClick}
          />
        ))}
      </VideoClipAnnotatedListWrapper>

      <TimeSliceRange
        selectedTimeSlice={selectedTimeSlice}
        videoPlayer={videoPlayer}
        updateTimeForSelected={updateSelectedSliceTimeProperty}
        disabled={clipStatus === EClipStatus.Clipping}
      />
    </div>
  );
};

const mapStateToProps = ({ annotation }: AppState) => {
  const { toolInstance } = annotation;
  return {
    toolInstance,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(VideoClipAnnotatedList);
