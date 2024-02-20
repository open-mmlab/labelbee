/*
 * @file Show all trackIDs in current frame
 * Selected effects page flip will clear
 * Highlighted effect page will not clear
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2024年2月18日
 */

import React, { useState, useEffect } from 'react';
import { Checkbox, Popover, Tag } from 'antd';
import { PointCloudUtils, i18n } from '@labelbee/lb-utils';
import { IPointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { IFileItem } from '@/types/data';
import { useTranslation, I18nextProvider } from 'react-i18next';
import styles from './index.module.scss';
import classNames from 'classnames';

import HighlightSvg from '@/assets/annotation/pointCloudTool/highlight.svg';
import HighlightActiveSvg from '@/assets/annotation/pointCloudTool/highlight_a.svg';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isDoubleClick } from '@/utils/audio';

import useAnnotatedBoxStore from '@/store/annotatedBox';

interface ITrackIDItem {
  id: string;
  trackID?: number;
  disabled: boolean;
  selected: boolean;
  isHighlight: boolean;
}
interface IAnnotatedBoxProps {
  imgList: IFileItem[];
  imgIndex: number;
  isPreResult: boolean;
}

const AnnotatedBox = (props: IAnnotatedBoxProps) => {
  const state = useAnnotatedBoxStore();
  const ptCtx = state.ptCtx as IPointCloudContext;

  const addHighlightID = (item: ITrackIDItem) => {
    ptCtx?.addHighlightID?.(item.trackID as number);
  };

  const addSelectedID = (item: ITrackIDItem) => {
    ptCtx?.addSelectedID?.(item.id);
  };

  const setSelectedIDs = (ids: string[]) => {
    ptCtx?.setSelectedIDs?.(ids);
  };

  const annotatedBoxProps = {
    ...props,
    pointCloudBoxList: state.pointCloudBoxList,
    highlightIDs: state.highlightIDs,
    selectedIDs: state.selectedIDs,
    addHighlightID,
    addSelectedID,
    setSelectedIDs,
  };

  return (
    <I18nextProvider i18n={i18n}>
      <AnnotatedBoxIDs {...annotatedBoxProps} />
    </I18nextProvider>
  );
};

interface IAnnotatedBoxIDsProps {
  imgList: IFileItem[];
  imgIndex: number;
  isPreResult: boolean;
  highlightIDs: number[];
  selectedIDs: string[];
  pointCloudBoxList: any[];
  addHighlightID: (item: ITrackIDItem) => void;
  addSelectedID: (item: ITrackIDItem) => void;
  setSelectedIDs: (ids: string[]) => void;
}

const AnnotatedBoxIDs = (props: IAnnotatedBoxIDsProps) => {
  const {
    imgList,
    imgIndex,
    isPreResult,
    highlightIDs,
    selectedIDs,
    pointCloudBoxList,
    addHighlightID,
    addSelectedID,
    setSelectedIDs,
  } = props;
  const { t } = useTranslation();

  const [showIDs, setShowIds] = useState<ITrackIDItem[]>([]);
  const [onlyShowCurrentIndex, setOnlyShowCurrentIndex] = useState<boolean>(false);

  useEffect(() => {
    const newImgList = imgList as Array<{ result: string }>;
    let trackMap = new Map();
    const selectedTrackIDs = selectedIDs.map(
      (v) => pointCloudBoxList.find((box) => box.id === v)?.trackID,
    );
    setShowIds(
      PointCloudUtils.getAllPointCloudResult({
        imgList: newImgList,
        extraBoxList: pointCloudBoxList,
        ignoreIndexList: [imgIndex],
        isPreResult,
      })
        .filter((v) => {
          if (!v.trackID) {
            return false;
          }

          if (trackMap.get(v.trackID)) {
            return false;
          }
          trackMap.set(v.trackID, true);
          return true;
        })
        .sort((a, b) => {
          const aTrackID = a?.trackID ?? 0;
          const bTrackID = b?.trackID ?? 0;

          return aTrackID - bTrackID;
        })
        .map((v) => {
          const box = pointCloudBoxList.find((box) => box.trackID === v.trackID);
          return {
            id: box?.id ?? v.id,
            trackID: v.trackID,
            disabled: !box,
            selected: selectedTrackIDs.includes(v.trackID),
            isHighlight: v?.trackID ? highlightIDs.includes(v.trackID) : false,
          };
        }),
    );
  }, [pointCloudBoxList, imgList, selectedIDs, highlightIDs, imgIndex]);

  useEffect(() => {
    const highlightBoxes = pointCloudBoxList.filter(
      (box) => box.trackID && highlightIDs.includes(box.trackID),
    );

    if (highlightBoxes?.length) {
      const needSetSelectedIDs = highlightBoxes.every((box) => !selectedIDs.includes(box.id));
      if (needSetSelectedIDs) {
        const needHighlightSelectedIDs = [...selectedIDs, ...highlightBoxes.map((v) => v.id)];
        setSelectedIDs(needHighlightSelectedIDs);
      }
    }
  }, [imgIndex, highlightIDs, selectedIDs]);

  return (
    <div className={styles.annotatedBox}>
      <div style={{ marginBottom: 16 }}>
        {t('AllTrackIDs')}
        <Popover
          placement='topRight'
          content={
            <>
              <div>{t('ClickOnTheIdToHighlightTheMarkupBox')}</div>
              <div>{t('DoubleClickOnTheIdToContinuouslyHighlightBoxesAcrossFrames')}</div>
            </>
          }
        >
          <QuestionCircleOutlined style={{ marginLeft: 8 }} />
        </Popover>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16,
          justifyContent: 'flex-end',
        }}
      >
        <Checkbox
          checked={onlyShowCurrentIndex}
          onChange={(e) => setOnlyShowCurrentIndex(e.target.checked)}
        >
          {t('OnlyCurrentFrame')}
        </Checkbox>
      </div>

      <div
        style={{
          userSelect: 'none',
        }}
      >
        {showIDs.map((item) => {
          if (item.disabled && onlyShowCurrentIndex) {
            return null;
          }
          return (
            <Tag
              key={item.trackID}
              className={classNames({
                [styles.tag]: true,
                [styles.disabled]: item.disabled,
                [styles.selected]: item.selected,
                [styles.highlight]: item.isHighlight,
              })}
              style={{
                marginBottom: 8,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.disabled) {
                  return;
                }
                if (isDoubleClick(e as any)) {
                  addHighlightID(item);
                  return;
                }
                addSelectedID(item);
              }}
            >
              {item.isHighlight && (
                <img
                  src={item.disabled ? HighlightSvg : HighlightActiveSvg}
                  className={styles.highlight}
                />
              )}

              {item.trackID}
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export default AnnotatedBox;
