import { timeFormat } from '@/utils/audio';
import { AttributeUtils, MathUtils } from '@labelbee/lb-annotation';
import { IVideoTimeSlice } from '@labelbee/lb-utils';
import { EnvironmentFilled } from '@ant-design/icons';
import React, { useRef, useMemo, useContext } from 'react';
import ResizableSnippet from '../resizableSnippet';
import { ETimeSliceType, EClipStatus } from '../../constant';
import ToolTipForClip from '../ToolTipForClip';
import styles from './index.module.scss';
import { decimalReserved, hashCode } from '@/components/videoPlayer/utils'
import { VideoClipToolContext } from '../../VideoClipToolContext'
import { VideoPlayerCtx } from '@/components/videoPlayer'
import { useTranslation } from 'react-i18next';

interface IProps {
  currentTime: number;
  onTrackResize: any;
  readonly: boolean;
  onTrackResizeStart: () => void;
}

/** 视频片段的显示内容 */
export const getDisplayContent = (i: any, attributeList: any) => {
  const { t } = useTranslation();
  const { attribute, textAttribute } = i;
  const attr = AttributeUtils.getAttributeShowText(attribute, attributeList) || t('NoAttribute');
  return [attr, textAttribute ? `${t('textTool')}: ${textAttribute}` : ''].filter((i) => i).join('，');
};

/**
 * 为片段排序, 使同一轨道上没有重叠片段
 * @param resultArray
 */
const sortTrack = (resultArray: IVideoTimeSlice[], selectedTrackID?: string) => {
  const array: any[] = (resultArray || []).filter((i) => i).map(() => []);
  let selectedTrackArray: IVideoTimeSlice | undefined;
  resultArray.forEach((i: any) => {
    if (i.id !== selectedTrackID) {
      const index = array.findIndex((j) => {
        const start = i.start;
        const end = i.end;
        return j.every((sJ: any) => {
          const range1 = [sJ.start, sJ.end];
          const range2 = [start, end];
          return (
            !MathUtils.isInRange(start, range1) &&
            !MathUtils.isInRange(end, range1) &&
            !MathUtils.isInRange(sJ.start, range2) &&
            !MathUtils.isInRange(sJ.end, range2)
          );
        });
      });
      if (index > -1) {
        array[index].push(i);
      }
    }
  });

  const result = fillArrayLen(array.filter((i) => i.length > 0));

  if (selectedTrackArray) {
    return [[selectedTrackArray]].concat(result);
  }

  return result?.map((i) => ({
    data: i,
    id: hashCode(i
      ?.map((d: any) => d.id)
      .join('_')),
  }));
};

/**
 * 填充数组长度
 * @param result
 * @param minLen
 */
const fillArrayLen = (result: any[], minLen = 2) => {
  let resultArray = result;
  if (resultArray.length - minLen < 0) {
    resultArray = resultArray.concat(
      Array.from({
        length: minLen - resultArray.length,
      }),
    );
  }
  return resultArray;
};

const VideoTrack = (props: IProps) => {
  const {
    currentTime,
    readonly,
    onTrackResizeStart,
  } = props;

  const { result, selectedAttribute: attribute, attributeList, selectedID: selectedTrack, clipStatus, contextToCancel } = useContext(VideoClipToolContext);
  const { duration: total } = useContext(VideoPlayerCtx)

  const containerRef = useRef<HTMLDivElement>(null);

  const left = currentTime / total;

  const toPercentage = (v: number, reservedNum = 4) => {
    return `${decimalReserved((v * 100), reservedNum)}%`;
  };

  const trackActiveStyle = (i: IVideoTimeSlice) => {
    if (i) {
      const attributeColor = AttributeUtils.getAttributeColor(i.attribute, attributeList);
      const diffTime = Math.max((i.end || currentTime) - i.start, 0) / total;
      const styles: any = {
        backgroundColor: attributeColor,
        left: toPercentage(i.start / total, 2),
        width: toPercentage(i.end ? Math.max(diffTime, 0.001) : diffTime, 2),
        position: 'absolute',
        borderRadius: 5,
      };
      const typeIsTime = i.type === ETimeSliceType.Time;
      if (typeIsTime) {
        delete styles.width;
        delete styles.backgroundColor;
        styles.top = '50%';
        styles.transform = 'translate(-50%)';
        styles.color = attributeColor;
      }
      return styles;
    }

    return {};
  };

  const attributeColor = AttributeUtils.getAttributeColor(attribute, attributeList);
  const containerWidth = containerRef.current?.clientWidth || 0;

  const transformX = decimalReserved(Math.max(containerWidth * left, 0), 0);

  const transformXForFlag = decimalReserved(Math.min(transformX, Math.floor(containerWidth - 68)), 0);

  const renderTracks = (i: IVideoTimeSlice) => {
    if (i) {
      if (i.type === ETimeSliceType.Time) {
        return (
          <ToolTipForClip
            slot={<EnvironmentFilled style={trackActiveStyle(i)} />}
            item={{ ...i, end: i.end === null ? currentTime : i.end }}
            attributeList={attributeList}
          />
        );
      } else {
        return (
          <ResizableSnippet
            track={i}
            currentTime={currentTime}
            style={trackActiveStyle(i)}
            onResize={(direction: any, changedPercentage: number) =>
              props.onTrackResize(i.id, direction, changedPercentage)
            }
            onTrackResizeStart={onTrackResizeStart}
            onClipping={clipStatus === EClipStatus.Clipping}
            isSelected={i.id === selectedTrack}
            readonly={readonly}
            attributeList={attributeList}
          />
        );
      }
    }
  };

  const displayTracks = useMemo(() => {
    const array = sortTrack(result, selectedTrack);
    return array?.map((i: any, index: number) => (
      <div className={styles.track} key={i?.id || index}>
        {i.data?.map((j: IVideoTimeSlice) => renderTracks(j))}
      </div>
    ));
  }, [result, selectedTrack, total, JSON.stringify(attributeList)]);

  const activeTrack = useMemo(() => {
    const selectedTrackData = result.find((i) => i?.id === selectedTrack);

    return selectedTrack && selectedTrackData ? (
      <div className={styles.track} key={selectedTrackData?.id}>
        {renderTracks(selectedTrackData)}
      </div>
    ) : null;
  }, [result, selectedTrack, total, currentTime, JSON.stringify(attributeList)]);

  return (
    <div
      className={styles.videoTrackContainer}
      ref={containerRef}
      onContextMenu={contextToCancel}
    >
      <div className={styles.timeTrack} />
      <div className={styles.videoTrack}>
        {activeTrack}
        {displayTracks}
      </div>
      <div
        className={styles.timeline}
        style={{
          transform: `translate3d(${transformX}px, 0px, 0px)`,
          backgroundColor: attributeColor,
        }}
      />
      <div
        className={styles.displayTime}
        style={{
          backgroundColor: attributeColor,
          transform: `translateX(${transformXForFlag}px, 0px, 0px)`,
        }}
      >
        {timeFormat(currentTime)}
      </div>
    </div>
  );
};

export default VideoTrack;
