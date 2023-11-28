import React, { useState, useRef, useEffect } from 'react';
import { getWebPcm2WavBase64 } from '@/components/audioAnnotate/utils/getWebPcm2Wac';
import _, { debounce, sortBy } from 'lodash';
import { PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import { cKeyCode, cTool, EventBus } from '@labelbee/lb-annotation';
import { IAudioTimeSlice } from '@labelbee/lb-utils'
import { Button } from 'antd';
import InvalidPage from '@/components/invalidPage';
import ImageError from '@/components/imageError';
import { classnames } from '@/utils';
import SpeedController, { EPlayerType } from '@/components/videoPlayer/components/SpeedController';
import WaveSurfer from '@labelbee/wavesurfer';
import Region from '@labelbee/wavesurfer/dist/plugin/wavesurfer.regions.js';
import Cursor from '@labelbee/wavesurfer/dist/plugin/wavesurfer.cursor.js';
import ZoomSlider, { audioZoomInfo } from './zoomSlider';
import LabelDisplayToggle from './labelDisplayToggle';
import ClipRegion from './clipRegion';
import { ISelectedRegion, useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { useDeepCompareEffect, useLatest, useThrottleFn, useUpdate } from 'ahooks';
import useAudioScroll from './useAudioScroll';
import styles from './index.module.scss';
import { getAttributeColor, precisionMinus, isDoubleClick, timeFormat, formatTime, getCanMoveRange, dispatchResizeEvent } from '@/utils/audio';
import ProgressDot from './progressDot';
import ClipTip from './clipTip';
import useSwitchHotkey from './useSwitchHotkey';
import useAudioCombine from './useAudioCombine';
import useAudioSegment from './useAudioSegment';
import CombineTip from './combineTip';
import SegmentTip from './segmentTip';
import ToolFooter from '@/views/MainView/toolFooter';
import { IInputList, RenderFooter } from '@/types/main';
import { decimalReserved } from '@/components/videoPlayer/utils'

const { EToolName } = cTool
const EKeyCode = cKeyCode.default

/** 快进/快退时间 */
const PER_PROGRESS = 0.1;

export interface ISetSelectedRegionParams extends ISelectedRegion {
  /** 是否立即播放截取片段 */
  playImmediately?: boolean;
}

interface IAudioPlayerContext {
  count?: number;
  isEdit: boolean;
  toolName: string;
  imgIndex: number;
}

export const AudioPlayerContext = React.createContext<IAudioPlayerContext>({
  count: 0,
  isEdit: false,
  toolName: EToolName.Empty,
  imgIndex: 0,
});

export const AudioPlayer = ({
  fileData = {},
  onLoaded,
  context,
  invalid,
  height,
  hideError,
  onError,
  updateRegion,
  removeRegion,
  regions = [],
  activeToolPanel,
  clipConfigurable,
  clipTextConfigurable,
  clipAttributeList,
  clipAttributeConfigurable,
  isCheck,
  hoverRegionId,
  footer,
  drawLayerSlot,
}: {
  fileData: any;
  height?: number;
  invalid: boolean;
  onLoaded?: any;
  onError?: () => void;
  context?: IAudioPlayerContext;
  hideError?: boolean;
  /** 截取片段数据:regions变化不会触发更新 */
  regions?: IAudioTimeSlice[];
  /** 更新截取片段，如果传入的id不存在，会新建一个数据 */
  updateRegion?: (region: IAudioTimeSlice) => void;
  /** 根据id删除截取数据 */
  removeRegion?: (id: string) => void;
  /** 当前使用的工具panel，用于判断是否展示批注层 */
  activeToolPanel?: string;
  clipConfigurable: boolean;
  clipTextConfigurable: boolean;
  clipAttributeConfigurable: boolean;
  clipAttributeList: IInputList[];
  /** 是否是查看模式：查看模式需要禁用截取的新建、调整功能 */
  isCheck?: boolean;
  /** 查看模式用到的hoverId */
  hoverRegionId?: string;
  footer?: RenderFooter;
  drawLayerSlot?: any,
}) => {
  const { url, path } = fileData;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [fileError, setFileError] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const waveRef = useRef<any>(null);
  const progressRef = useRef<null | HTMLDivElement>(null);

  const refCurrentTime = useRef(currentTime);
  const setRefCurrentTime = (time: number) => {
    refCurrentTime.current = time;
    setCurrentTime(time);
  };
  // 鼠标移入到进度条上的时间
  const [hoverTime, setHoverTime] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const waveformContainerRef = useRef<null | HTMLDivElement>(null);
  const [edgeAdsorption, setEdgeAdsorption] = useState<{ start?: number; end?: number }>({});
  const { audioClipState, setAudioClipState } = useAudioClipStore();
  const [clipping, setClipping] = useState<boolean>(false);
  // 因为 WaveSurfer 中各种 callback 中的值都不是最新值，需要useLatest或useRef包一下，使用useLatest包裹的不要用（.current=xxx）的方式来改
  const audioClipStateRef = useLatest(audioClipState);
  const edgeAdsorptionRef = useLatest(edgeAdsorption);
  const isPlayingRef = useLatest(isPlaying);
  const regionsRef = useLatest(regions);
  const update = useUpdate();
  const [sortByStartRegions, setSortByStartRegions] = useState<IAudioTimeSlice[]>([]);
  const [regionMap, setRegionMap] = useState<{ [key: string]: IAudioTimeSlice }>({});

  const debounceZoom = debounce(() => {
    EventBus.emit('audioZoom');
  }, 500);

  const zoomHandler = (val: number) => {
    if (val < audioZoomInfo.min || val > audioZoomInfo.max) {
      return;
    }
    setZoom(val);
    dispatchResizeEvent();
    debounceZoom();
  };

  useAudioScroll({
    container: waveformContainerRef.current,
    target: document.querySelector(`[data-id=${audioClipStateRef.current?.selectedRegion?.id}]`),
    clipping,
    zoom,
    zoomHandler,
  });
  // 根据attributeLockList重新生成regions
  const generateRegions = () => {
    let showRegions = regionsRef.current;

    const { attributeLockList } = audioClipStateRef.current;
    if (attributeLockList.length) {
      showRegions = showRegions.filter((item) => attributeLockList.includes(item.attribute));
    }
    clearRegions();
    showRegions.forEach((item) => {
      waveRef.current?.addRegion({
        ...item,
        drag: !isCheck,
        resize: !isCheck,
        color: 'rgba(0, 0, 0, 0)',
      });
    });
    update();
  };
  /**
   * 选中片段:没有id则selectedRegion为空,selectedAttribute需要保留,playImmediately立刻播放片段
   * @param {ISetSelectedRegionParams}
   */
  const setSelectedRegion = (select: ISetSelectedRegionParams) => {
    const { id, loop = true, playImmediately = false } = select;

    if (id) {
      const regionListMap = waveRef.current?.regions?.list ?? {};
      Object.entries(regionListMap).forEach(([, value]: [any, any]) => {
        const { id: itemId } = value;
        if (id === itemId) {
          value.select();
        } else {
          value.cancelSelect();
        }
      });

      setAudioClipState({
        selectedRegion: { id, loop },
        selectedAttribute: regionsRef.current?.find((item) => item.id === id)?.attribute ?? '',
      });

      if (loop && playImmediately) {
        getRegionInstanceById(id)?.playLoop();
      }
    } else {
      setAudioClipState({
        selectedRegion: {},
      });
    }
  };

  const { combineInstance } = useAudioCombine({
    waveRef,
    sortByStartRegions,
    regionMap,
    updateRegion,
    removeRegion,
    generateRegions,
    setSelectedRegion,
  });

  const { segmentInstance, onRegionMouseMove, segmentTimeTip } = useAudioSegment({
    waveRef,
    regionMap,
    updateRegion,
    removeRegion,
    generateRegions,
    setSelectedRegion,
  });

  const clipConfig = {
    clipTextConfigurable,
    clipAttributeList,
    clipAttributeConfigurable,
    clipConfigurable,
  };

  useEffect(() => {
    setAudioClipState({
      selectedAttribute: '',
    });
  }, [clipAttributeConfigurable]);

  useEffect(() => {
    setCursorAttributeColor();
  }, [audioClipState.selectedAttribute]);

  useEffect(() => {
    generateRegions();
  }, [audioClipState.attributeLockList]);

  useDeepCompareEffect(() => {
    setAudioClipState(clipConfig);
    setTimeout(() => {
      initClipConfig();
    });
  }, [clipConfig]);

  useDeepCompareEffect(() => {
    setSortByStartRegions(sortBy(regions, ['start']));
    setRegionMap(
      regions.reduce((prev, current) => {
        const { id } = current;
        return {
          ...prev,
          [id]: current,
        };
      }, {}),
    );
  }, [regions]);

  useEffect(() => {
    if (hoverRegionId) {
      const needLoop = isPlayingRef.current;
      setSelectedRegion({
        id: hoverRegionId,
        loop: needLoop,
        playImmediately: true,
      });
    } else {
      setSelectedRegion({});
    }
  }, [hoverRegionId]);

  const initClipConfig = () => {
    if (audioClipStateRef.current.clipConfigurable) {
      if (!isCheck && waveRef.current) {
        waveRef.current?.enableDragSelection({
          slop: 5,
        });
      }
      generateRegions();
    } else {
      waveRef.current?.disableDragSelection();
      clearRegions();
    }
    setCursorAttributeColor();
  };

  const setCursorAttributeColor = () => {
    let nextColor = '';
    if (audioClipStateRef.current.clipConfigurable) {
      nextColor = getAttributeColor(
        audioClipStateRef.current.selectedAttribute,
        audioClipStateRef.current.clipAttributeList ?? [],
      );
    } else {
      nextColor = 'transparent';
    }

    if (waveRef?.current?.cursor?.cursor) {
      waveRef?.current?.cursor?.setStyle({
        border: `2px dashed ${nextColor}`,
      });
    }
  };

  // 通过id返回region实例、需要注意可以返回undefined
  const getRegionInstanceById = (id: string) => {
    const regionListMap = waveRef.current?.regions?.list ?? {};
    return regionListMap[id];
  };

  const setAudioUrl = () => {
    if (url) {
      const isPcwFile = path?.split('.')?.pop()?.toLowerCase() === 'pcm';

      setFileError(false);
      if (isPcwFile) {
        getWebPcm2WavBase64(url).then((base64) => {
          waveLoadUrl(base64);
        });
      } else {
        waveLoadUrl(url);
      }
    }
  };

  const waveLoadUrl = (url: string) => {
    if (url) {
      setLoading(true);
      setRefCurrentTime(0);
      setDuration(0);
      waveRef?.current?.load(url);
    }
  };

  const clearRegions = () => {
    waveRef.current?.clearRegions();
  };

  // 右键双击、delete按键、点击删除统一调用这个方法
  const removeRegionById = (id: string) => {
    const instance = getRegionInstanceById(id);
    if (instance) {
      setClipping(false);
      instance?.remove();
      removeRegion?.(id);
      setSelectedRegion({});
    }
  };

  const { run: throttleSelectedRegion } = useThrottleFn(setSelectedRegion, {
    wait: 500,
  });

  useSwitchHotkey({
    sortByStartRegions,
    setSelectedRegion,
  });

  const edgeAdsorptionHandler = (instance: any) => {
    const { start: adsorptionStart, end: adsorptionEnd } = edgeAdsorptionRef.current;
    if (adsorptionStart || adsorptionEnd) {
      instance.update(edgeAdsorptionRef.current);
    }
    return instance;
  };
  /**
   * 获取WaveSurfer-region插件中的regions-eventDown事件、生成range放到waveRef.current上
   * @param {'create' | 'resize'} action 新建region还是调整region
   * @param {?string} id action为resize时会传id
   * @param {number} eventDownTime 按下鼠标位置的时间节点
   */
  const getRange = ({
    action,
    id,
    eventDownTime,
  }: {
    action: 'create' | 'resize';
    id?: string;
    eventDownTime: number;
  }) => {
    if (!audioClipStateRef.current.clipConfigurable) {
      return;
    }

    if (id) {
      setSelectedRegion({ id });
    }

    const instance = getRegionInstanceById((id ?? audioClipStateRef.current.selectedRegion?.id) || '');
    // 属性对应的time;
    const sameAttributeTimes: number[] = [];
    const otherRegions =
      action === 'create'
        ? regionsRef.current
        : regionsRef.current?.filter((item) => {
            return item.id !== instance.id;
          });

    otherRegions.forEach((item) => {
      const { start, end, attribute } = item;
      if (attribute === audioClipStateRef.current.selectedAttribute) {
        [start, end].forEach((time) => {
          if (!sameAttributeTimes.includes(time)) {
            sameAttributeTimes.push(time);
          }
        });
      }
    });

    const range = getCanMoveRange(
      sameAttributeTimes.sort((a, b) => a - b),
      eventDownTime,
    );

    waveRef.current.range = range;
  };

  const handleRegionUpdateEnd = (instance: any) => {
    setCursorAttributeColor();
    setTimeout(() => {
      setClipping(false);
    });
    const regionInstance = edgeAdsorptionHandler(instance);
    const { id, start, end } = regionInstance;

    setSelectedRegion({
      id,
      playImmediately: true,
    });

    const regionParam = {
      id,
      start: decimalReserved(start, 3),
      end: decimalReserved(end, 3),
    }
    updateRegion?.(regionParam as IAudioTimeSlice);
    update();
  };

  const initWaveSurfer = () => {
    const wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#999',
      progressColor: '#999',
      height: height || 245,
      normalize: true,
      cursorWidth: 2,
      cursorColor: 'white',
      responsive: 0,
      hideScrollbar: true,
      plugins: [
        Region.create({
          regions,
          dragSelection: {
            slop: 5,
          },
          canMove: false,
        }),
        Cursor.create({
          opacity: 1,
          customStyle: {
            border: `2px dashed transparent`,
          },
        }),
      ],
    });

    const setWaveCurrentTime = () => {
      setRefCurrentTime(waveRef?.current?.getCurrentTime() || 0);
    };

    wavesurfer.on('ready', () => {
      const tmp = waveRef?.current?.getDuration() || 0;
      setDuration(tmp);
      setWaveCurrentTime();
      onLoaded?.({ duration: Math.round(tmp) });
      setLoading(false);
      playPause();
      EventBus.on('setCurrentTimeByPosition', calcPercentage);
      EventBus.on('clearRegions', clearRegions);
      EventBus.on('removeRegionById', removeRegionById);
      EventBus.on('setSelectedRegion', throttleSelectedRegion);
      wavesurfer.on('regions-eventDown', getRange);
      initClipConfig();
    });

    wavesurfer.on('audioprocess', () => {
      setWaveCurrentTime();
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('seek', () => {
      setWaveCurrentTime();
    });

    wavesurfer.on('error', () => {
      setFileError(true);
      onLoaded?.({
        hasError: true,
      });
      onError?.();
    });

    wavesurfer.on('region-created', (instance: any) => {
      const { id, start, end } = instance;
      // 初始化regions也会触发这个事件
      if (regionsRef.current.find((item) => item.id === id)) {
        return;
      }
      const regionItem = {
        id,
        start: decimalReserved(start, 3),
        end: decimalReserved(end, 3),
        attribute: audioClipStateRef.current.selectedAttribute,
        text: '',
      };

      updateRegion?.(regionItem);
    });

    wavesurfer.on('region-updated', (instance: any, eventParams: any) => {
      const action = eventParams?.action;
      setAudioClipState({
        combined: false,
        segment: false,
      });
      if (action === 'resize') {
        waveRef?.current?.cursor?.setStyle({
          borderStyle: `solid`,
        });
      }

      if (action === 'drag') {
        waveRef?.current?.cursor?.setStyle({
          borderColor: `transparent`,
        });
      }

      const adsorption: {
        start?: number;
        end?: number;
      } = {};

      const edges: number[] = [];
      // 时间节点（start、end）对应的x坐标
      const xMapTime: { [key: number]: number } = {};
      const otherRegions = regionsRef.current?.filter((item) => {
        return item.id !== instance.id;
      });
      const listMap = waveRef.current?.regions?.list ?? {};
      otherRegions.forEach((item) => {
        const { element } = listMap[item.id] ?? {};
        const { start, end } = item;
        if (element) {
          const { x: startX, width } = element.getBoundingClientRect?.() || {};
          const endX = startX + width;
          [startX, endX].forEach((xPos, index) => {
            if (!edges.includes(xPos)) {
              edges.push(xPos);
              xMapTime[xPos] = index === 0 ? start : end;
            }
          });
        }
      });
      const { x: currentStartX, width } = instance.element.getBoundingClientRect?.() || {};
      const currentEndX = currentStartX + width;

      edges.forEach((edge) => {
        // 5px内显示自动吸附
        if (Math.abs(precisionMinus(edge, currentStartX)) < 5) {
          adsorption.start = xMapTime[edge];
        }
        if (Math.abs(precisionMinus(edge, currentEndX)) < 5) {
          adsorption.end = xMapTime[edge];
        }
      });

      setEdgeAdsorption(adsorption);
      throttleSelectedRegion({ id: instance.id });
      setClipping(true);
    });

    wavesurfer.on('region-update-end', (instance: any) => {
      handleRegionUpdateEnd(instance);
    });

    wavesurfer.on('region-contextmenu', (instance: any, e: MouseEvent) => {
      if (!isCheck) {
        e.preventDefault();
        e.stopPropagation();
        if (isDoubleClick(e)) {
          removeRegionById(instance.id);
          return;
        }
        setSelectedRegion({ id: instance.id, playImmediately: true });
      }
    });

    wavesurfer.on('region-click', (instance: any, e: any, time: number) => {
      if (!isCheck) {
        e.preventDefault();
        e.stopPropagation();
        if (audioClipStateRef.current.combined) {
          combineInstance(instance);
          return;
        }
        if (audioClipStateRef.current.segment) {
          segmentInstance(instance, time);
          return;
        }
        setSelectedRegion({ id: instance.id, playImmediately: true });
      }
    });
    wavesurfer.on('region-mousemove', onRegionMouseMove);
    waveRef.current = wavesurfer;
  };

  const PlayIcon = isPlaying ? <PauseOutlined /> : <CaretRightOutlined />;
  const getPercentage = (time: number) => {
    return time ? `${parseFloat(((time / duration) * 100).toFixed(4))}%` : '0%';
  };
  const playPercentage = getPercentage(currentTime);

  const hoverPercentage = getPercentage(hoverTime);

  const getWaveRef = () => {
    if (loading) {
      return;
    }

    return waveRef?.current;
  };

  const skipAhead = () => {
    getWaveRef()?.skipForward(PER_PROGRESS);
  };

  const rewind = () => {
    getWaveRef()?.skipBackward(PER_PROGRESS);
  };

  const playPause = () => {
    getWaveRef()?.playPause();
    setSelectedRegion({});
  };

  const keyDownEvents = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case EKeyCode.Right:
        skipAhead();
        break;
      case EKeyCode.Left:
        rewind();
        break;
      case EKeyCode.Space:
        e.preventDefault();
        playPause();
        break;
      case EKeyCode.Delete:
        if (!isCheck) {
          const { id } = audioClipStateRef.current?.selectedRegion || {};
          if (id) {
            removeRegionById(id);
          }
        }

        break;
    }
  };

  const handleDragging = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    calcPercentage(e);
  };

  const throttledHandleDragging = _.throttle(handleDragging, 50);

  // 记录拖动进度条之前的播放状态
  let prePlaying = false;

  const handleMouseUp = () => {
    if (prePlaying) {
      playPause();
      prePlaying = false;
    }
    // @ts-ignore
    document.removeEventListener('mousemove', throttledHandleDragging);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    calcPercentage(e);
    if (isPlaying) {
      prePlaying = true;
      playPause();
    }
    // @ts-ignore
    document.addEventListener('mousemove', throttledHandleDragging);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const reload = () => {
    setAudioUrl();
  };

  useEffect(() => {
    initWaveSurfer();
    return () => {
      waveRef?.current?.destroy();
      waveRef.current = null;
      EventBus.unbindAll('setCurrentTimeByPosition');
      EventBus.unbindAll('clearRegions');
      EventBus.unbindAll('removeRegionById');
      EventBus.unbindAll('setSelectedRegion');
    };
  }, []);

  const setPlaybackRate = (rate: number) => {
    // 调整速度需要暂停一下 不然会有卡顿
    getWaveRef()?.playPause();
    getWaveRef()?.setPlaybackRate(rate);
    getWaveRef()?.playPause();
  };

  useEffect(() => {
    document.addEventListener('keydown', keyDownEvents);
    return () => {
      document.removeEventListener('keydown', keyDownEvents);
    };
  });

  useEffect(() => {
    setSelectedRegion({});
    setAudioUrl();
  }, [url]);

  // 计算播放到鼠标位置的时间
  const calcTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (waveRef?.current && progressRef?.current) {
      const _duration = waveRef?.current?.getDuration() ?? 0;
      const clientRect = progressRef?.current?.getBoundingClientRect();
      const leftPercentage =
        (e.clientX - clientRect.left) / (progressRef?.current?.clientWidth || 0);
      let skipTime = leftPercentage * _duration;
      if (skipTime > _duration) {
        skipTime = _duration;
      }
      return skipTime;
    }
    return 0;
  };

  const calcPercentage = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const skipTime = calcTime(e);
    waveRef?.current?.skip(skipTime - refCurrentTime.current);
    setRefCurrentTime(skipTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setHoverTime(calcTime(e));
  };
  const remainingTime = duration ? Math.max(duration - currentTime, 0) : 0;

  const showRemark =
    context?.toolName !== EToolName.Empty &&
    context?.isEdit !== true &&
    (activeToolPanel === 'remark' || isCheck);

  const audioPlayer = (
    <div className={styles.audioPlayer}>
      {fileError && !hideError && (
        <ImageError
          fileTypeName='音频'
          ignoreOffsetY={true}
          reloadImage={reload}
          backgroundColor='#ffffffbb'
        />
      )}
      <ClipTip getRegionInstanceById={getRegionInstanceById} clipping={clipping} />
      <CombineTip container={waveformContainerRef.current} />
      <SegmentTip segmentTimeTip={segmentTimeTip} />
      <div className={styles.waveformContainer} ref={waveformContainerRef}>
        <div
          id='waveform'
          style={{
            width: `${zoom * 100}%`,
          }}
          className={classnames({
            [styles.waveform]: true,
            'bee-audio-combined': audioClipStateRef.current.combined,
            'bee-audio-clip': audioClipStateRef.current.clipConfigurable,
          })}
        >
          {invalid && <InvalidPage isAudio={true} />}
          <div
            ref={progressRef}
            className={styles.progress}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div
              className={classnames({
                [styles.radioTooltip]: true,
              })}
              style={{ left: playPercentage }}
            >
              {formatTime(currentTime)}
            </div>
            <div
              className={classnames({
                [styles.radioTooltip]: true,
                [styles.mouseTooltip]: true,
              })}
              style={{ left: hoverPercentage }}
            >
              {formatTime(hoverTime)}
            </div>
            <ProgressDot playPercentage={playPercentage} />
          </div>
          {
            showRemark && drawLayerSlot?.({ currentTime, remainingTime, audioPlayer: getWaveRef() })
          }
        </div>
      </div>

      <div className={styles.controlBar}>
        <Button
          type='link'
          icon={PlayIcon}
          onClick={() => {
            playPause();
          }}
          className={classnames({
            [styles.playButton]: true,
            [styles.playButtonDisabled]: loading,
          })}
        />
        <span className={styles.time}>
          {`${timeFormat(currentTime, 'ss.SSS')} / -${timeFormat(
            duration - currentTime,
            'ss.SSS',
          )}`}
        </span>
        <SpeedController
          playerType={EPlayerType.Audio}
          onChange={(rate) => {
            setPlaybackRate(rate);
          }}
        />
        <ZoomSlider
          onChange={(val) => {
            zoomHandler(val);
          }}
          zoom={zoom}
        />
        <LabelDisplayToggle EventBus={EventBus}/>
      </div>
    </div>
  );

  if (context) {
    return (
      <AudioPlayerContext.Provider value={context}>
        {audioPlayer}
        {regions.map((region) => {
          const { id } = region;
          const el = document.querySelector(`[data-id=${id}]`);
          return el ? (
            <ClipRegion
              el={el}
              key={id}
              region={region}
              edgeAdsorption={edgeAdsorption}
              clipping={clipping}
              zoom={zoom}
              instance={getRegionInstanceById(id)}
            />
          ) : null;
        })}

        <ToolFooter footer={footer} />
      </AudioPlayerContext.Provider>
    );
  }
  return audioPlayer;
};
