/**
 * @file 音频分割功能
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月16日
 */

import { useEffect, useRef } from 'react';
import { message as SenseMessage } from 'antd';
import { TagUtils, cKeyCode } from '@labelbee/lb-annotation';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { useEventListener, useMemoizedFn } from 'ahooks';
import { ISetSelectedRegionParams } from '..';
import { IAudioTimeSlice } from '@labelbee/lb-utils';
import DataTransform from '@/components/audioAnnotate/utils/dataTransform';
const EKeyCode = cKeyCode.default;

interface IProps {
  /** WaveSurfer */
  waveRef: any;
  regionMap: { [key: string]: IAudioTimeSlice };
  /** 更新截取片段，如果传入的id不存在，会新建一个数据 */
  updateRegion?: (region: IAudioTimeSlice) => void;
  /** 根据id删除截取数据 */
  removeRegion?: (id: string) => void;
  generateRegions: () => void;
  /**
   * 选中片段:没有id则selectedRegion为空,selectedAttribute需要保留,playImmediately立刻播放片段
   * @param {ISetSelectedRegionParams}
   */
  setSelectedRegion: (params: ISetSelectedRegionParams) => void;
}

/** 音频区间分割功能 */
const useAudioSegment = (props: IProps) => {
  const { waveRef, regionMap, updateRegion, removeRegion, generateRegions, setSelectedRegion } =
    props;

  const { audioClipState, setAudioClipState } = useAudioClipStore();
  const { selectedRegion, clipConfigurable, segment, clipTextList, subAttributeList } =
    audioClipState;
  const { id } = selectedRegion;
  const segmentTimeTip = useRef<null | number>(null);
  const mouseEvent = useRef<null | MouseEvent>(null);

  useEffect(() => {
    if (mouseEvent.current && waveRef.current && segment && id) {
      const time = waveRef.current?.regions?.util?.getRegionSnapToGridValue?.(
        waveRef.current?.drawer.handleEvent(mouseEvent.current) * waveRef.current?.getDuration(),
      );
      const current = regionMap[id] ?? {};
      const { start, end } = current;
      if (time > start && time < end) {
        segmentTimeTip.current = time;
        return;
      }
    }
    segmentTimeTip.current = null;
  }, [mouseEvent.current, segment]);

  const segmentInstance = useMemoizedFn((instance, time) => {
    if (!id || id !== instance.id) {
      SenseMessage.info('请点击所选区间');
      return;
    }
    const current = regionMap[id];
    const newData = DataTransform.getClipTextByConfig(current, clipTextList);
    const targetLeft = {
      ...newData,
      id: waveRef.current?.util.getId('segment_'),
      end: time,
      subAttribute: current.subAttribute ?? {},
    };
    const clearText = DataTransform.getClipTextByConfig(current, clipTextList, true);
    const targetRight = {
      ...clearText,
      id: waveRef.current?.util.getId('segment_'),
      start: time,
      subAttribute: TagUtils.getDefaultResultByConfig(subAttributeList ?? []),
    };

    updateRegion?.(targetLeft);
    updateRegion?.(targetRight);
    removeRegion?.(id);
    generateRegions();
    setAudioClipState({
      segment: false,
    });
    setSelectedRegion({
      id: targetLeft.id,
      playImmediately: true,
    });
  });

  const keyDownEvents = useMemoizedFn((e: KeyboardEvent) => {
    if (!clipConfigurable) {
      return;
    }

    if (e.altKey && e.keyCode === EKeyCode.X) {
      if (!id) {
        SenseMessage.info('请先选择需要分割的区间');
        return;
      }
      setAudioClipState({
        segment: true,
        combined: false,
      });
    }
  });

  const onRegionMouseMove = useMemoizedFn((instance, e) => {
    mouseEvent.current = e;
  });

  useEventListener('keydown', keyDownEvents);

  useEffect(() => {
    if (segment) {
      setAudioClipState({
        segment: false,
      });
    }
  }, [id]);

  return {
    segmentInstance,
    onRegionMouseMove,
    segmentTimeTip: segmentTimeTip.current,
  };
};

export default useAudioSegment;
