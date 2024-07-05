import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import {
  getAttributeColor,
  getAttributeFontColor,
  getAttributeShowText,
  updateColorOpacity,
} from '@/utils/audio';
import LoopIcon from '@/assets/annotation/audio/loop.svg';
import { Typography } from 'antd';
import { useClickAway } from 'ahooks';
import { classnames } from '@/utils';
import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils';

import styles from './index.module.scss';
import { useTranslation } from 'react-i18next';

interface IProps {
  /** 挂载到目标元素 */
  el: Element;
  /** 截取片段数据 */
  region: IAudioTimeSlice;
  /** 是否正在截取 */
  clipping: boolean;
  /** 边缘吸附对象 */
  edgeAdsorption: {
    start?: number;
    end?: number;
  };
  /** 音频的缩放 */
  zoom: number;
  /** WaveSurfer region 实例 */
  instance?: any;
}

const { Paragraph } = Typography;
/** 展示在音频图上的截取片段 */
const ClipRegion = (props: IProps) => {
  const { t } = useTranslation();
  const { audioClipState, setAudioClipState } = useAudioClipStore();
  const {
    clipAttributeList,
    clipAttributeConfigurable,
    clipTextConfigurable,
    selectedRegion,
    clipTextList,
  } = audioClipState;

  const ref = useRef(null);
  const { el, region, edgeAdsorption, clipping, instance } = props;
  const { attribute = '', text = '', id, start, end } = region;

  const { id: selectedId } = selectedRegion;
  const attributeColor = getAttributeColor(attribute, clipAttributeList);

  const textStyle = {
    color: getAttributeFontColor(attribute, clipAttributeList),
    backgroundColor: attributeColor,
  };

  const style: any = {
    border: `2px solid ${attributeColor}`,
  };

  if (id === selectedId) {
    style.backgroundColor = updateColorOpacity(attributeColor, 0.6);
    style.borderLeft = `2px solid ${attributeColor}`;
    style.borderRight = `2px solid ${attributeColor}`;
  } else {
    instance?.setLoop(false);
    style.borderLeft = `2px solid ${attributeColor}`;
    style.borderRight = `2px solid ${attributeColor}`;
    if (clipping) {
      const values = Object.values(edgeAdsorption);
      if (values.includes(start)) {
        style.borderLeft = `3px dashed #fff`;
      }

      if (values.includes(end)) {
        style.borderRight = `3px dashed #fff`;
      }
    }
  }

  useClickAway(
    () => {
      // 选中时右键任意处放开选中
      if (id === selectedId) {
        setAudioClipState({
          selectedRegion: {},
        });
      }
    },
    ref,
    ['contextmenu'],
  );

  const showLoop = id === selectedId && selectedRegion.loop;

  const dom = (
    <div
      style={style}
      ref={ref}
      className={classnames({
        [styles.container]: true,
      })}
    >
      {showLoop && (
        <div className={styles.loop}>
          <img src={LoopIcon} />
        </div>
      )}
      {clipAttributeConfigurable && (
        <div>
          <div style={textStyle} className={styles.attribute}>
            {getAttributeShowText(attribute, [{ value: '', key: '无属性' }, ...clipAttributeList])}
          </div>
        </div>
      )}

      {clipTextConfigurable &&
        clipTextList?.map((i: ITextConfigItem, index: number) => (
          <Paragraph ellipsis={{ rows: 2 }} className={styles.text} style={textStyle} key={index}>
            {i?.label ?? t('textTool')}:{region[i?.key] ?? ''}
          </Paragraph>
        ))}
    </div>
  );

  return <>{ReactDOM.createPortal(dom, el)}</>;
};

export default ClipRegion;
