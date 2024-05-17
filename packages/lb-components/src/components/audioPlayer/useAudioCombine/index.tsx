/**
 * @file 音频合并功能
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月16日
 */

import { message as SenseMessage } from 'antd';
import { cKeyCode } from '@labelbee/lb-annotation';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { useEventListener, useMemoizedFn } from 'ahooks';
import { useEffect } from 'react';
import { IAudioTimeSlice } from '@labelbee/lb-utils';
import { ISetSelectedRegionParams } from '..';
import { cloneDeep } from 'lodash';

const EKeyCode = cKeyCode.default;

interface IProps {
  /** WaveSurfer */
  waveRef: any;
  sortByStartRegions: IAudioTimeSlice[];
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

/** 音频区间合并功能 */
const useAudioCombine = (props: IProps) => {
  const {
    waveRef,
    sortByStartRegions,
    regionMap,
    updateRegion,
    removeRegion,
    generateRegions,
    setSelectedRegion,
  } = props;
  const { audioClipState, setAudioClipState } = useAudioClipStore();
  const { selectedRegion, clipConfigurable, combined, clipTextList } =
    audioClipState;
  const { id } = selectedRegion;

  const combineTextByConfig = (
    region: IAudioTimeSlice,
    current: IAudioTimeSlice,
    target: IAudioTimeSlice,
  ) => {
    const newRegion = cloneDeep(region);
    // If the merged text is not empty, it needs to be wrapped.
    clipTextList.forEach((i, index) => {
      const curText = current[i.key];
      const targetText = target[i.key];
      const inCludeEmpty = [curText, targetText].includes('');
      const showText = inCludeEmpty
        ? `${curText}${targetText}`
        : `${curText}
${targetText}`;
      // index === 0: Compatible with old data
      if (index === 0) {
        Object.assign(newRegion, { text: showText });
      } else {
        Object.assign(newRegion, { [i.key]: showText });
      }
    });
    return newRegion;
  };

  const combineInstance = useMemoizedFn((instance) => {
    if (!id) {
      return;
    }
    const current = regionMap[id];
    const target = regionMap[instance.id];
    if (current.attribute !== target.attribute) {
      SenseMessage.info('请选择相邻同属性片段');
      return;
    }
    const sameAttributeRegions = sortByStartRegions.filter(
      (item) => item.attribute === current.attribute,
    );
    const currentIndex = sameAttributeRegions.findIndex((item) => item.id === id);
    const targetIndex = sameAttributeRegions.findIndex((item) => item.id === instance.id);

    if (Math.abs(currentIndex - targetIndex) !== 1) {
      SenseMessage.info('请选择相邻同属性片段');
      return;
    }
    const times: number[] = [];
    const timeAttr: ['start', 'end'] = ['start', 'end'];
    timeAttr.forEach((item) => {
      times.push(current[item]);
      times.push(target[item]);
    });
    const start = Math.min(...times);
    const end = Math.max(...times);

    const region: IAudioTimeSlice = {
      id: waveRef.current?.util.getId('combined_'),
      start,
      end,
      attribute: current.attribute,
      // 如果合并的text都不为空、需要换行
      text: [current.text, target.text].includes('')
        ? `${current.text}${target.text}`
        : `${current.text}
        ${target.text}`,
      subAttribute: target.subAttribute ?? {},
    };
    const newRegion = combineTextByConfig(region, current, target);

    updateRegion?.(newRegion);
    removeRegion?.(id);
    removeRegion?.(target.id);
    generateRegions();
    setAudioClipState({
      combined: false,
    });
    setSelectedRegion({
      id: newRegion.id,
      playImmediately: true,
    });
  });

  const keyDownEvents = useMemoizedFn((e: KeyboardEvent) => {
    if (!clipConfigurable) {
      return;
    }

    if (e.altKey && e.keyCode === EKeyCode.Z) {
      if (!id) {
        SenseMessage.info('请先选择需要合并的区间');
        return;
      }
      setAudioClipState({
        combined: true,
        segment: false,
      });
    }
  });

  useEffect(() => {
    if (combined) {
      setAudioClipState({
        combined: false,
      });
    }
  }, [id]);

  useEventListener('keydown', keyDownEvents);

  return {
    combineInstance,
  };
};

export default useAudioCombine;
