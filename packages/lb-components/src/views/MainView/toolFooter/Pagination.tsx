import {
  LeftOutlined,
  RightOutlined,
  StepForwardFilled,
  StepBackwardFilled,
} from '@ant-design/icons';
import React from 'react';
import { PageInput } from './index';

interface IPageIconProps {
  isVideo?: boolean;
  iconProps: {
    onClick: () => void;
    className: string;
  };
}

interface IPagination {
  // 当前文件的页码
  imgIndex: number;
  // 文件总数
  totalPage: number;
  // 跳到对应的页码
  pageJump: (page: string) => void;
  // 向后翻页
  pageForward: () => void;
  // 向前翻页
  pageBackward: () => void;
  footerCls: string;
  // 文件是否为视频
  isVideo?: boolean;
}

const Forward: React.FC<IPageIconProps> = (props) =>
  props.isVideo ? (
    <StepForwardFilled {...props.iconProps} />
  ) : (
    <RightOutlined {...props.iconProps} />
  );
const Back: React.FC<IPageIconProps> = (props) =>
  props.isVideo ? (
    <StepBackwardFilled {...props.iconProps} />
  ) : (
    <LeftOutlined {...props.iconProps} />
  );

export const Pagination: React.FC<IPagination> = ({
  pageBackward,
  imgIndex,
  pageJump,
  totalPage,
  pageForward,
  isVideo,
  footerCls,
}) => {
  return (
    <div className={`${footerCls}__pagination`}>
      <Back
        isVideo={isVideo}
        iconProps={{
          className: `${footerCls}__highlight`,
          onClick: pageBackward,
        }}
      />
      <PageInput imgIndex={imgIndex} jumpSkip={pageJump} />/
      <span className={`${footerCls}__pageAll`}>{totalPage}</span>
      <Forward
        isVideo={isVideo}
        iconProps={{
          className: `${footerCls}__highlight`,
          onClick: pageForward,
        }}
      />
    </div>
  );
};
