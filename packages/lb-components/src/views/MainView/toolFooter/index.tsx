import React, { useState, useRef, useEffect } from 'react';
import { Divider, Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { store } from 'src';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { getTotalPage } from '@/store/annotation/reducer';
import HiddenTips from './HiddenTips';
import PageNumber from './PageNumber';
import ZoomController from './ZoomController';
import FooterTips from './FooterTips';
import { prefix } from '@/constant';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';

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

interface IProps {
  totalPage: number;
  imgIndex: number;
  style?: {[key: string]: any}
}

export const footerCls = `${prefix}-footer`;

const ToolFooter: React.FC<IProps> = (props: IProps) => {
  // const windowSize = useContext(viewportContext);
  // const canvasSize = getFormatSize(windowSize);
  const renderDivider = () => (
    <Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} />
  );

  // const width = canvasSize.width;

  const pageBackward = () => {
    store.dispatch(PageBackward());
  };

  const pageForward = () => {
    store.dispatch(PageForward());
  };

  const pageJump = (page: string) => {
    const imgIndex = ~~page - 1;
    store.dispatch(PageJump(imgIndex));
  };

  return (
    <div className={`${footerCls}`} style={props.style}>
      <FooterTips />

      <div style={{ flex: 1 }} />
      <HiddenTips />
      <PageNumber />
      {/* {
        <>
          <span className='progress'>进度{((1 * 100) / 1).toFixed(2)}%</span>
          {renderDivider()}
        </>
      } */}
      <div className={`${footerCls}__pagination`}>
        <LeftOutlined className={`${footerCls}__highlight`} onClick={pageBackward} />
        <PageInput imgIndex={props.imgIndex} jumpSkip={pageJump} />/
        <span className={`${footerCls}__pageAll`}>{props.totalPage}</span>
        <RightOutlined className={`${footerCls}__highlight`} onClick={pageForward} />
      </div>
      {true && (
        <>
          {renderDivider()}
          <ZoomController />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  totalPage: getTotalPage(state.annotation),
  imgIndex: state.annotation.imgIndex,
});

export default connect(mapStateToProps)(ToolFooter);
