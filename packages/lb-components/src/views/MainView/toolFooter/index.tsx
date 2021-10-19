import React, { useState, useRef, useEffect } from 'react';
import { Divider, Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { AppState } from '@/store';
import { connect, useDispatch } from 'react-redux';
import { getTotalPage } from '@/store/annotation/reducer';
import HiddenTips from './HiddenTips';
import PageNumber from './PageNumber';
import ZoomController from './ZoomController';
import FooterTips from './FooterTips';
import { prefix } from '@/constant';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { IStepInfo } from '@/types/step';

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
  style?: { [key: string]: any };
  stepList: IStepInfo[];
  step: number;
  basicResultList: any[];
  basicIndex: number;
  mode?: 'light' | 'dark'; // 后面通过 context 的形式进行编写
}

export const footerCls = `${prefix}-footer`;

const FooterDivider = () => (
  <Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} />
);

const ToolFooter: React.FC<IProps> = (props: IProps) => {
  const { stepList, step, basicResultList, basicIndex, mode } = props;
  const dispatch = useDispatch();

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

  return (
    <div className={`${footerCls}`} style={props.style}>
      <FooterTips />
      <div style={{ flex: 1 }} />
      <HiddenTips />
      <PageNumber />
      {/* {
        <>
          <span className='progress'>进度{((1 * 100) / 1).toFixed(2)}%</span>
          {<FooterDivider />}
        </>
      } */}

      <div className={`${footerCls}__pagination`}>
        <LeftOutlined className={`${footerCls}__highlight`} onClick={pageBackward} />
        <PageInput imgIndex={props.imgIndex} jumpSkip={pageJump} />/
        <span className={`${footerCls}__pageAll`}>{props.totalPage}</span>
        <RightOutlined className={`${footerCls}__highlight`} onClick={pageForward} />
      </div>

      {hasSourceStep && basicResultList.length > 0 && (
        <>
          <FooterDivider />
          <span>{`第${basicIndex + 1}/${basicResultList.length}分页`}</span>
        </>
      )}

      <FooterDivider />
      <ZoomController mode={mode} />
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
