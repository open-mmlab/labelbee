import React, { useMemo } from 'react';
import AttributeList from '@/components/attributeList';
import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils';
import { EventBus, TagUtils } from '@labelbee/lb-annotation';
import ClipIcon from '@/assets/annotation/audio/clipSmall.svg';
import ClipActiveIcon from '@/assets/annotation/audio/clipASmall.svg';
import DeleteIcon from '@/assets/annotation/audio/delete.svg';
import LoopActiveIcon from '@/assets/annotation/audio/loopA.svg';
import { getAttributeShowText, timeFormat } from '@/utils/audio';
import LongText from '@/components/longText';
import { classnames } from '@/utils';

import styles from './index.module.scss';
import { useTranslation } from 'react-i18next';
import SubAttributeList from '@/components/subAttributeList';

interface IClipSidebarProps {
  /** 截取片段数组 */
  regions: IAudioTimeSlice[];
  updateRegion: (region: IAudioTimeSlice) => void;
  useAudioClipStore: any;
}
/** 开启音频截取后，标注中展示在右侧，包含已截取片段和调整属性操作 */
const ClipSidebar = (props: IClipSidebarProps) => {
  const { regions = [], updateRegion, useAudioClipStore } = props;
  const { audioClipState, setAudioClipState } = useAudioClipStore();
  const { t } = useTranslation();

  const {
    selectedAttribute,
    selectedRegion,
    clipTextConfigurable,
    clipAttributeList,
    clipAttributeConfigurable,
    secondaryAttributeConfigurable,
    subAttributeList,
    clipTextList,
  } = audioClipState;

  const { id: selectedId } = selectedRegion;

  const currentRegion = useMemo(() => {
    return regions.find((item) => item.id === selectedId);
  }, [regions, selectedId]);

  const attributeChanged = (attr: string) => {
    if (regions.length && selectedId) {
      updateRegion({
        ...(currentRegion as IAudioTimeSlice),
        attribute: attr,
      });
    }

    setAudioClipState({
      selectedAttribute: attr,
    });
  };

  const setSubAttribute = (key: string, value: string) => {
    if (regions.length && selectedId) {
      const currentSubAttribute = currentRegion?.subAttribute ?? {};
      updateRegion({
        ...(currentRegion as IAudioTimeSlice),
        subAttribute: { ...currentSubAttribute, [key]: value },
      });
    }
  };

  const list = [
    { label: '无属性', value: '', key: '无属性' },
    ...clipAttributeList.map((i: any) => {
      return { ...i, label: i.key };
    }),
  ];

  // Display attribute and secondary attribute text
  const getAttributeText = (
    attribute: string,
    subAttribute?: {
      [key: string]: string;
    },
  ) => {
    const text = getAttributeShowText(attribute, list);
    const subAttributes = subAttribute
      ? TagUtils.getTagNameList(subAttribute, subAttributeList)
      : [];
    let subAttributeText = '';
    const segmentSymbol = '，\n';
    subAttributes.forEach((i) => {
      subAttributeText += `${i.keyName}：${i.value.join(`、`)}${segmentSymbol}`;
    });
    return `${text}${segmentSymbol}${subAttributeText}`;
  };

  const showClipText = (region: IAudioTimeSlice) => {
    let clipShowText = '';
    if (clipTextConfigurable && clipTextList?.length > 0) {
      clipTextList.forEach((i: ITextConfigItem, index: number) => {
        const segmentSymbol = !clipAttributeConfigurable && index === 0 ? '' : '，';
        clipShowText = clipShowText + `${i.label}：${region[i.key]}${segmentSymbol}`;
      });
    }
    return clipShowText;
  };

  return (
    <div className={styles.clipSidebar}>
      <div className={styles.clipResults}>
        <div className={styles.title}>{t('ClippedAudio')}</div>
        {regions.length > 0 ? (
          <div className={styles.regions}>
            {regions.map((item) => {
              const { id, attribute, text, start, end, subAttribute } = item;
              const showLoop = id === selectedId && selectedRegion.loop;

              const showText = `${
                clipAttributeConfigurable ? getAttributeText(attribute, subAttribute) : ''
              }${showClipText(item)}`;
              return (
                <div
                  className={classnames({
                    [styles.region]: true,
                    [styles.selected]: id === selectedId,
                  })}
                  key={id}
                  onClick={() => {
                    EventBus.emit('setSelectedRegion', { id, playImmediately: true });
                  }}
                >
                  <div className={styles.label}>
                    {showLoop && <img src={LoopActiveIcon} />}
                    <div className={styles.text}>
                      <LongText text={showText} />
                    </div>
                  </div>
                  <div className={styles.time}>
                    <img src={selectedId === id ? ClipActiveIcon : ClipIcon} />
                    {timeFormat(start, 'ss.SSS')} -{timeFormat(end, 'ss.SSS')}
                  </div>
                  <div
                    className={styles.delete}
                    onClick={() => {
                      EventBus.emit('removeRegionById', id);
                    }}
                  >
                    <img src={DeleteIcon} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>{t('NoClippedData')}</div>
        )}
      </div>
      {clipAttributeConfigurable && clipAttributeList?.length > 0 && (
        <div className={styles.attributeList}>
          <AttributeList
            list={list}
            attributeChanged={attributeChanged}
            selectedAttribute={selectedAttribute}
            attributeLockChange={(list: string[]) => {
              setAudioClipState({
                attributeLockList: list,
              });
            }}
          />
          {selectedId && secondaryAttributeConfigurable && (
            <SubAttributeList
              subAttributeList={subAttributeList}
              setSubAttribute={setSubAttribute}
              getValue={(subAttribute) => {
                return currentRegion?.subAttribute?.[subAttribute.value];
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ClipSidebar;
