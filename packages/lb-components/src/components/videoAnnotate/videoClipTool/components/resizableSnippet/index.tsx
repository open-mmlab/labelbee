import { Resizable, ResizeCallback } from 're-resizable';
import React, { useState } from 'react';
import ToolTipForClip from '../ToolTipForClip';
import { getDisplayContent } from '../videoTrack';
import styles from './index.module.scss';
import { decimalReserved } from '@/components/videoPlayer/utils'

interface IProps {
  track: any;
  currentTime: number;
  attributeList: any[];
  readonly: boolean;
  onClipping: boolean;
  onTrackResizeStart: () => void;
  onResize: (direction: any, changedPercentage: number) => void;
  style: React.CSSProperties;
  isSelected?: boolean;
}

const TRACK_HEIGHT = 45;

const ResizableSnippet = (props: IProps) => {
  const { track, currentTime, attributeList, readonly, onClipping, onTrackResizeStart } = props;
  const { start, end } = track;
  const endTime = end || currentTime;
  const [cacheDelta, setCacheDelta] = useState({ width: 0, height: 0 });
  const onResize: ResizeCallback = (
    event,
    direction,
    refToElement,
    delta,
  ) => {
    const diffWidth = delta.width - cacheDelta.width;
    const changedPercentage = diffWidth / (refToElement.parentNode as any)?.clientWidth;
    setCacheDelta(delta);
    props.onResize(direction, changedPercentage);
  };

  const onResizeStart = () => {
    setCacheDelta({ width: 0, height: 0 });
    onTrackResizeStart?.();
  };

  const warperStyles = {
    transform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 12,
    ...props.style,
  };

  const resizableDirection = {
    top: false,
    right: true,
    left: true,
    bottom: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false,
  };

  const timeSlice = (
    <div style={{ margin: '10px 5px' }}>
      <div className={styles.textOverflow}>
        {`${decimalReserved(Math.max((endTime - start), 1), 0)}s`}
      </div>
      <div className={styles.textOverflow}>{getDisplayContent(track, attributeList)}</div>
    </div>
  );

  let slot;

  if (onClipping || readonly || !props.isSelected) {
    const styles = { ...warperStyles, height: TRACK_HEIGHT };
    if (props.isSelected && currentTime - start < 0) {
      styles.width = 100;
      styles.backgroundColor = 'transparent';
    }

    slot = <div style={styles}>{timeSlice}</div>;
  } else {
    slot = (
      <Resizable
        size={{
          width: props.style.width ?? 0,
          height: TRACK_HEIGHT,
        }}
        minWidth={1}
        onResize={onResize}
        onResizeStart={onResizeStart}
        enable={resizableDirection}
        style={warperStyles}
      >
        {timeSlice}
      </Resizable>
    );
  }

  return (
    <ToolTipForClip
      slot={slot}
      item={{ ...track, end: track.end === null ? currentTime : track.end }}
      attributeList={attributeList}
    />
  );
};

export default ResizableSnippet;
