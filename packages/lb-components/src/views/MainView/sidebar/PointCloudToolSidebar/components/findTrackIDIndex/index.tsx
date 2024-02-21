/*
 * @file Provides the ability to find the corresponding frame containing the trackId
 *       Click on the forward and backward arrows to jump to the previous/next page containing the trackId.
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2024年2月18日
 */

import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Input, message } from 'antd';
import { Provider } from 'react-redux';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { PointCloudUtils, i18n } from '@labelbee/lb-utils';
import { IFileItem } from '@/types/data';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import { PageJump } from '@/store/annotation/actionCreators';
import { store } from '@/index';
import ArrowComponent from './arrow';
import { useDebounceFn } from 'ahooks';
interface IProps {
  imgList: IFileItem[];
  imgIndex: number;
  pageJump?: (page: number) => void;
  isPreResult?: boolean;
}

const FindTrackIDIndex = (props: IProps) => {
  const { imgList, imgIndex, pageJump, isPreResult = false } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [list, setList] = useState<number[]>([]);
  const currentIndex = list.findIndex((item) => item === imgIndex);

  const onPressEnter = (e: any) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setList([]);
      return;
    }
    const newTrackID = parseInt(inputValue, 10);

    if (!(newTrackID > 0)) {
      message.error(t('PositiveIntegerCheck'));
      return;
    }
    debounceGetIndexList(newTrackID);
  };

  const jump = (page: number) => {
    if (pageJump) {
      pageJump(page);
      return;
    }
    dispatch(PageJump(page));
  };

  const getIndexList = (trackID: number) => {
    if (trackID) {
      const list = PointCloudUtils.getIndexByTrackID(trackID, imgList, isPreResult);
      setList(list);
      return;
    }
    setList([]);
  };

  const { run: debounceGetIndexList } = useDebounceFn(getIndexList, { wait: 100 });

  useEffect(() => {
    if (list?.length) {
      const nextIndex = list[0];
      if (nextIndex !== imgIndex) {
        jump(nextIndex);
      }
    }
  }, [list]);

  const onPrev = () => {
    if (currentIndex < 0) {
      return;
    }
    jump(list[currentIndex - 1]);
  };

  const onNext = () => {
    if (currentIndex === list.length - 1) {
      return;
    }
    jump(list[currentIndex + 1]);
  };

  return (
    <div className={styles.container}>
      <div>{t('FindTheFrameCorrespondingToTheLabeledFrameId')}</div>
      <div className={styles.content}>
        <Input
          size='small'
          onPressEnter={onPressEnter}
          style={{
            width: 50,
          }}
          allowClear={true}
        />
        <div>
          <ArrowComponent disabled={currentIndex <= 0} onClick={onPrev} type={'left'} />
          <ArrowComponent
            disabled={currentIndex === -1 || currentIndex === list.length - 1}
            onClick={onNext}
            type={'right'}
          />
        </div>
      </div>
    </div>
  );
};

export const FindTrackIDIndexInCheckMode = (props: any) => {
  return (
    <Provider store={store} context={LabelBeeContext}>
      <I18nextProvider i18n={i18n}>
        <FindTrackIDIndex {...props} />
      </I18nextProvider>
    </Provider>
  );
};

export default FindTrackIDIndex;
