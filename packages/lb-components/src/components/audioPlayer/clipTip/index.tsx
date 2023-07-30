/**
 * @file 音频截取时，初始点的时间点显示
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月1日
 */

import React, { useEffect, useRef } from 'react';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { IAudioTimeSlice } from '@labelbee/lb-utils'
import { timeFormat } from '@/utils/audio'

import styles from '.././index.module.scss';

interface IProps {
  /**  通过id返回region实例、需要注意可以返回undefined */
  getRegionInstanceById: (id: string) => IAudioTimeSlice;
  /** 是否正在截取 */
  clipping: boolean;
}

const ClipTip = (props: IProps) => {
  const ref = useRef<Element | null>(null);
  const { getRegionInstanceById, clipping } = props;
  const { audioClipState } = useAudioClipStore();
  const { selectedRegion } = audioClipState;
  const { id } = selectedRegion;
  const { start, end } = getRegionInstanceById?.(id ?? '') ?? {};

  useEffect(() => {
    ref.current = document.querySelector(`[data-id=${id}]`);
  }, [id]);

  // 下面任意一个值为false都不展示、start 可以为 0
  if ([id, clipping, start, end].some((item) => !item && item !== 0)) {
    return null;
  }

  const clientRectLeft = ref.current?.getBoundingClientRect()?.left ?? 0;

  return (
    <div
      className={styles.tips}
      style={{
        left: clientRectLeft,
        top: 75,
      }}
    >
      {timeFormat(start, 'ss.SSS')} - {timeFormat(end, 'ss.SSS')}
    </div>
  );
};
export default ClipTip;
