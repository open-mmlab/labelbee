import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Popover, Tag } from 'antd';
import { PointCloudUtils } from '@labelbee/lb-utils';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { IFileItem } from '@/types/data';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';
import classNames from 'classnames';

import HighlightSvg from '@/assets/annotation/pointCloudTool/highlight.svg';
import HighlightActiveSvg from '@/assets/annotation/pointCloudTool/highlight_a.svg';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isDoubleClick } from '@/utils/audio';

interface ITrackIDItem {
  id: string;
  trackID?: number;
  disabled: boolean;
  selected: boolean;
  isHighlight: boolean;
}

const AnnotatedBox = ({ imgList, imgIndex }: { imgList: IFileItem[]; imgIndex: number }) => {
  const { t } = useTranslation();

  const ptCtx = useContext(PointCloudContext);
  const { pointCloudBoxList } = ptCtx;

  const [showIDs, setShowIds] = useState<ITrackIDItem[]>([]);
  const [onlyShowCurrentIndex, setOnlyShowCurrentIndex] = useState<boolean>(false);

  const highlightHandler = (item: ITrackIDItem) => {
    ptCtx.addHighlightID(item.trackID as number);
  };

  const selectHandler = (item: ITrackIDItem) => {
    ptCtx.addSelectedID(item.id);
  };

  useEffect(() => {
    const newImgList = imgList as Array<{ result: string }>;
    let trackMap = new Map();
    const selectedTrackIDs = ptCtx.selectedIDs.map(
      (v) => ptCtx.pointCloudBoxList.find((box) => box.id === v)?.trackID,
    );
    setShowIds(
      PointCloudUtils.getAllPointCloudResult({
        imgList: newImgList,
        extraBoxList: pointCloudBoxList,
        ignoreIndexList: [imgIndex],
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
          const box = ptCtx.pointCloudBoxList.find((box) => box.trackID === v.trackID);
          return {
            id: box?.id ?? v.id,
            trackID: v.trackID,
            disabled: !box,
            selected: selectedTrackIDs.includes(v.trackID),
            isHighlight: v?.trackID ? ptCtx.highlightIDs.includes(v.trackID) : false,
          };
        }),
    );
  }, [ptCtx.pointCloudBoxList, imgList, ptCtx.selectedIDs, ptCtx.highlightIDs, imgIndex]);

  useEffect(() => {
    const highlightBoxes = ptCtx.pointCloudBoxList.filter(
      (box) => box.trackID && ptCtx.highlightIDs.includes(box.trackID),
    );

    if (highlightBoxes?.length) {
      const needSetSelectedIDs = highlightBoxes.every((box) => !ptCtx.selectedIDs.includes(box.id));
      if (needSetSelectedIDs) {
        const needHighlightSelectedIDs = [...ptCtx.selectedIDs, ...highlightBoxes.map((v) => v.id)];
        ptCtx.setSelectedIDs(needHighlightSelectedIDs);
      }
    }
  }, [imgIndex, ptCtx.highlightIDs, ptCtx.selectedIDs]);

  return (
    <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
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

      <div>
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
                if (isDoubleClick(e as any)) {
                  highlightHandler(item);
                  return;
                }
                if (item.disabled) {
                  return;
                }
                selectHandler(item);
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
