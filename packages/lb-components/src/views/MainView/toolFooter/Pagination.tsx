import { getClassName } from '@/utils/dom';
import {
  LeftOutlined,
  RightOutlined,
  StepForwardFilled,
  StepBackwardFilled,
} from '@ant-design/icons';
import { Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface IPageIconProps {
  isVideo?: boolean;
  iconProps: {
    onClick: () => void;
    className: string;
  };
}

interface IPaginationProps {
  // current file page
  imgIndex: number;
  // number of total files
  totalPage: number;
  // redirect to target page
  pageJump: (page: string) => void;
  // to next page
  pageForward: () => void;
  // to prev page
  pageBackward: () => void;
  // footer classname
  footerCls: string;
  // whether file is video
  isVideo?: boolean;
}

interface IPageProps {
  jumpSkip: Function;
  imgIndex: number;
}

/**
 * page input for changing current page or file index
 * @param props
 * @returns
 */
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
    }
  };

  return (
    <Input
      className={getClassName('page-input')}
      ref={inputEl}
      onChange={newHandleJump}
      value={newIndex}
      onKeyDown={newJumpSkip}
    />
  );
};

/**
 * Next page icon
 * @param props
 * @returns
 */
const NextPage: React.FC<IPageIconProps> = (props) =>
  props.isVideo ? (
    <StepForwardFilled {...props.iconProps} />
  ) : (
    <RightOutlined {...props.iconProps} />
  );

/**
 * Prev page icon
 * @param props
 * @returns
 */
const PrevPage: React.FC<IPageIconProps> = (props) =>
  props.isVideo ? (
    <StepBackwardFilled {...props.iconProps} />
  ) : (
    <LeftOutlined {...props.iconProps} />
  );

export const Pagination: React.FC<IPaginationProps> = ({
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
      <PrevPage
        isVideo={isVideo}
        iconProps={{
          className: `${footerCls}__highlight`,
          onClick: pageBackward,
        }}
      />
      <PageInput imgIndex={imgIndex} jumpSkip={pageJump} />/
      <span className={`${footerCls}__pageAll`}>{totalPage}</span>
      <NextPage
        isVideo={isVideo}
        iconProps={{
          className: `${footerCls}__highlight`,
          onClick: pageForward,
        }}
      />
    </div>
  );
};
