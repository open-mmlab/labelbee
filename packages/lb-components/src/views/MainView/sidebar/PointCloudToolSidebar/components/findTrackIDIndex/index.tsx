import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Input, message } from 'antd';
import { Provider } from 'react-redux';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { PointCloudUtils, i18n } from '@labelbee/lb-utils';
import { IFileItem } from '@/types/data';
import classNames from 'classnames';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import { PageJump } from '@/store/annotation/actionCreators';
import { store } from '@/index';

interface IProps {
  imgList: IFileItem[];
  imgIndex: number;
  pageJump?: (page: number) => void;
}

const FindTrackIDIndex = (props: IProps) => {
  const { imgList, imgIndex, pageJump } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [trackID, setTrackID] = useState(0);
  const [list, setList] = useState<number[]>([]);
  const currentIndex = list.findIndex((item) => item === imgIndex);

  const onPressEnter = (e: any) => {
    const inputValue = e.target.value;
    const newTrackID = parseInt(inputValue, 10);

    if (!(newTrackID > 0)) {
      message.error(t('PositiveIntegerCheck'));
      return;
    }
    setTrackID(newTrackID);
  };

  const jump = (page: number) => {
    if (pageJump) {
      pageJump(page);
      return;
    }
    dispatch(PageJump(page));
  };

  useEffect(() => {
    if (trackID) {
      const list = PointCloudUtils.getIndexByTrackID(trackID, imgList);
      if (list?.length) {
        setList(list);
      }
    }
  }, [trackID, imgIndex]);

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
      <div>查找标注框ID对应帧</div>
      <div className={styles.content}>
        <Input
          size='small'
          onPressEnter={onPressEnter}
          style={{
            width: 50,
          }}
        />
        <div>
          {currentIndex > -1 && (
            <span
              style={{
                marginRight: 4,
              }}
            >
              帧: {currentIndex + 1}
            </span>
          )}
          <li
            className={classNames({
              'ant-pagination-disabled': currentIndex <= 0,
              'ant-pagination-prev': true,
            })}
            onClick={onPrev}
          >
            <button className='ant-pagination-item-link' type='button'>
              <span role='img' aria-label='left' className='anticon anticon-left'>
                <svg
                  viewBox='64 64 896 896'
                  focusable='false'
                  data-icon='left'
                  width='1em'
                  height='1em'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path d='M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z' />
                </svg>
              </span>
            </button>
          </li>
          <li
            className={classNames({
              'ant-pagination-disabled': currentIndex === -1 || currentIndex === list.length - 1,
              'ant-pagination-next': true,
            })}
            onClick={onNext}
          >
            <button className='ant-pagination-item-link' type='button'>
              <span role='img' className='anticon anticon-right'>
                <svg
                  viewBox='64 64 896 896'
                  focusable='false'
                  data-icon='right'
                  width='1em'
                  height='1em'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path d='M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z' />
                </svg>
              </span>
            </button>
          </li>
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
