/**
 * @file 按住ctrl滑动滚轮缩放、音频截取片段拖到边缘时，需向边缘的方向匀速滚动
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年8月18日
 */
import { useEffect } from 'react';
import { precisionAdd, precisionMinus } from '@/utils/audio';
import { useLatest } from 'ahooks';
import { audioZoomInfo } from '../zoomSlider';

interface IProps {
  /** 提供滚动条的元素 */
  container: Element | null;
  /** 可移动、拖拽的元素 */
  target: Element | null;
  /** 移动到边缘的缓冲宽度 */
  bufferWidth?: number;
  /** 是否正在调整 */
  clipping: boolean;
  /** 音频的缩放 */
  zoom: number;
  /** 音频缩放时调用的方法 */
  zoomHandler: (val: number) => void;
}
/** 音频截取片段拖到边缘时，需向边缘的方向匀速滚动 */
const useAudioScroll = (props: IProps) => {
  const { container, target, bufferWidth = 10, clipping = false, zoom = 1, zoomHandler } = props;
  const containerRef = useLatest(container);
  const zoomRef = useLatest(zoom);

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey && containerRef.current?.contains(e.target as Element)) {
      if (e.deltaY > 0) {
        zoomHandler(precisionAdd(zoomRef.current, audioZoomInfo.ratio));
      } else {
        zoomHandler(precisionMinus(zoomRef.current, audioZoomInfo.ratio));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('wheel', onWheel);
    return () => {
      document.removeEventListener('wheel', onWheel);
    };
  }, []);

  if (container && target && clipping && zoom > 1) {
    const { scrollLeft: containerScrollLeft } = container;

    const {
      right: targetBoundingClientRectRight,
      left: targetBoundingClientRectLeft,
      width: targetBoundingClientRectWidth,
    } = target.getBoundingClientRect();
    const {
      right: containerBoundingClientRectRight,
      left: containerBoundingClientRectLeft,
      width: containerBoundingClientRectWidth,
    } = container.getBoundingClientRect();

    if (targetBoundingClientRectWidth > containerBoundingClientRectWidth) {
      return;
    }

    if (
      containerBoundingClientRectLeft + bufferWidth > targetBoundingClientRectLeft &&
      targetBoundingClientRectLeft > containerBoundingClientRectLeft
    ) {
      window.requestAnimationFrame(() => {
        container.scrollLeft = containerScrollLeft - 20;
      });
    }
    if (
      targetBoundingClientRectRight + bufferWidth > containerBoundingClientRectRight &&
      targetBoundingClientRectRight < containerBoundingClientRectRight
    ) {
      window.requestAnimationFrame(() => {
        container.scrollLeft = containerScrollLeft + 20;
      });
    }
  }
};

export default useAudioScroll;
