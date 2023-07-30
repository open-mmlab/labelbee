import { useEventListener, useMemoizedFn } from 'ahooks';
import { cKeyCode } from '@labelbee/lb-annotation';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { ISetSelectedRegionParams } from '..';
import { IAudioTimeSlice } from '@labelbee/lb-utils'

const EKeyCode = cKeyCode.default
interface IProps {
  sortByStartRegions?: IAudioTimeSlice[];
  /**
   * 选中片段:没有id则selectedRegion为空,selectedAttribute需要保留,playImmediately立刻播放片段
   * @param {ISetSelectedRegionParams}
   */
  setSelectedRegion: (params: ISetSelectedRegionParams) => void;
}

const useSwitchHotkey = (props: IProps) => {
  const { sortByStartRegions = [], setSelectedRegion } = props;
  const { audioClipState } = useAudioClipStore();
  const { selectedRegion, clipConfigurable } = audioClipState;

  const handler = useMemoizedFn((action: 'prev' | 'next') => {
    const { id } = selectedRegion;
    let nextIndex = 0;
    const len = sortByStartRegions.length;
    if (id) {
      const currentIndex = sortByStartRegions.findIndex((item) => item.id === id);
      if (action === 'prev') {
        if (currentIndex === 0) {
          nextIndex = len - 1;
        } else {
          nextIndex = currentIndex - 1;
        }
      }
      if (action === 'next') {
        if (currentIndex === len - 1) {
          nextIndex = 0;
        } else {
          nextIndex = currentIndex + 1;
        }
      }
    }

    setSelectedRegion?.({
      id: sortByStartRegions[nextIndex]?.id,
      playImmediately: true,
    });
  });

  const keyDownEvents = (e: KeyboardEvent) => {
    if (!clipConfigurable || sortByStartRegions.length === 0) {
      return;
    }
    switch (e.keyCode) {
      case EKeyCode.W:
        handler('prev');
        break;
      case EKeyCode.S:
        handler('next');
        break;
    }
  };
  useEventListener('keydown', keyDownEvents);
};

export default useSwitchHotkey;
