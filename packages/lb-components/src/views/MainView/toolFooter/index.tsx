import { prefix } from '@/constant';
import { AppState } from '@/store';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { getTotalPage } from '@/store/annotation/reducer';
import { Footer } from '@/types/main';
import { IStepInfo } from '@/types/step';
import { Divider, Input } from 'antd/es';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import FooterTips from './FooterTips';
import HiddenTips from './HiddenTips';
import PageNumber from './PageNumber';
import ZoomController from './ZoomController';
import { Pagination } from './Pagination';

interface IPageProps {
  jumpSkip: Function;
  imgIndex: number;
}

export const PageInput = (props: IPageProps) => {
  const { jumpSkip, imgIndex } = props;
  const [newIndex, setIndex] = useState(imgIndex);
  const inputEl = useRef(null);

  useEffect(() => {
    setIndex(imgIndex + 1);
  }, [imgIndex]);

  const newHandleJump = (e: any) => {
    const reg = /^\d*$/;
    if (reg.test(e.target.value)) {
      setIndex(e.target.value);
    }
  };

  const newJumpSkip = (e: any) => {
    if (e.keyCode === 13) {
      jumpSkip(e.target.value);
      // inputEl?.current?.blur();
    }
  };

  return (
    <Input
      className='pageInput'
      ref={inputEl}
      onChange={newHandleJump}
      value={newIndex}
      onKeyDown={newJumpSkip}
    />
  );
};

export type FooterTheme = 'light' | 'dark';

interface IProps {
  totalPage: number;
  imgIndex: number;
  style?: { [key: string]: any };
  stepList: IStepInfo[];
  step: number;
  basicResultList: any[];
  basicIndex: number;
  mode?: FooterTheme; // 后面通过 context 的形式进行编写
  footer?: Footer;
}

export const footerCls = `${prefix}-footer`;

const FooterDivider = () => (
  <Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} />
);

const ToolFooter: React.FC<IProps> = (props: IProps) => {
  const { stepList, step, basicResultList, basicIndex, mode = 'light', footer } = props;
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const stepInfo = stepList[step - 1] ?? {};

  const pageBackward = () => {
    dispatch(PageBackward());
  };

  const pageForward = () => {
    dispatch(PageForward());
  };

  const pageJump = (page: string) => {
    const imgIndex = ~~page - 1;
    dispatch(PageJump(imgIndex));
  };

  const hasSourceStep = !!stepInfo.dataSourceStep;

  const footerTips = <FooterTips />;

  const hiddenTips = <HiddenTips />;

  const pageNumber = <PageNumber />;

  const pagination = (
    <Pagination
      imgIndex={props.imgIndex}
      totalPage={props.totalPage}
      pageJump={pageJump}
      pageBackward={pageBackward}
      pageForward={pageForward}
      footerCls={footerCls}
    />
  );

  const zoomController = <ZoomController mode={mode} />;

  const curItems = (
    <span>{t('curItems', { current: basicIndex + 1, total: basicResultList.length })}</span>
  );

  const footerDivider = <FooterDivider />;

  if (footer) {
    if (typeof footer === 'function') {
      return (
        <div className={`${footerCls}`} style={props.style}>
          {footer({
            footerTips,
            hiddenTips,
            pageNumber,
            pagination,
            zoomController,
            curItems,
            footerDivider,
          })}
        </div>
      );
    } else {
      return footer;
    }
  }

  return (
    <div className={`${footerCls}`} style={props.style}>
      {footerTips}
      <div style={{ flex: 1 }} />
      {hiddenTips}
      {pageNumber}
      {pagination}
      {hasSourceStep && basicResultList.length > 0 && (
        <>
          {footerDivider}
          {curItems}
        </>
      )}
      {footerDivider}
      {zoomController}
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  totalPage: getTotalPage(state.annotation),
  imgIndex: state.annotation.imgIndex,
  stepList: state.annotation.stepList,
  step: state.annotation.step,
  basicIndex: state.annotation.basicIndex,
  basicResultList: state.annotation.basicResultList,
});

export default connect(mapStateToProps)(ToolFooter);
