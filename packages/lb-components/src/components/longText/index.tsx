/**
 * @file Text exceeds display view more
 * @author lixinghua <lixinghua@sensetime.com>;
 * @date 2023-04-10
 */

import React, { useRef, ReactElement, CSSProperties } from 'react';
import { Popover, Tooltip } from 'antd';
import { useSize } from 'ahooks';
import { TooltipPlacement } from 'antd/es/tooltip';
import { prefix } from '@/constant';
import { SearchOutlined } from '@ant-design/icons';

interface IProps {
  text: string;
  placement?: TooltipPlacement; // Popover位置
  icon?: ReactElement | null; // 自定义icon
  openByText?: boolean; // hover文字展开
  style?: CSSProperties;
  isToolTips?: boolean;
  wordCount?: number;
  overflowMaxLines?: number;
}

const longTextCls = `${prefix}-longText`;
const LongText = (props: IProps) => {
  const {
    text,
    placement = 'bottom',
    icon = <SearchOutlined />,
    openByText,
    style,
    isToolTips,
    wordCount,
    overflowMaxLines,
  } = props;

  const el = useRef<null | HTMLDivElement>(null);
  useSize(el);
  const isOverflow = el.current && el.current?.clientWidth < el.current?.scrollWidth;

  if (wordCount || overflowMaxLines) {
    const clampStyles = overflowMaxLines
      ? {
          display: '-webkit-box',
          WebkitLineClamp: overflowMaxLines,
          WebkitBoxOrient: 'vertical' as 'vertical',
          overflow: 'hidden',
        }
      : {};
    const TextDom = (
      <div
        style={{
          whiteSpace: 'pre-wrap',
          ...clampStyles,
          ...style,
        }}
        ref={el}
      >
        {text}
      </div>
    );

    const isOverflowByWordCount = wordCount && text?.length > wordCount;
    const isOverflowByHeight = el.current && el.current?.clientHeight < el.current?.scrollHeight;

    let showText = text;
    if (isOverflowByWordCount) {
      showText = text.slice(0, wordCount);
    }
    if (isOverflowByHeight || isOverflowByWordCount) {
      return (
        <Popover placement={placement} overlayClassName={`${longTextCls}-popover`} content={text}>
          <span style={{ cursor: 'pointer', whiteSpace: 'pre-wrap', ...clampStyles }}>
            {showText}
          </span>
        </Popover>
      );
    }
    return TextDom;
  }

  if (openByText) {
    let tipsProps = {
      placement,
      overlayClassName: `${longTextCls}-popover`,
      content: text,
      // 防止屏幕缩小时Popover会自动展开
      key: `${isOverflow}`,
    };
    if (!isOverflow) {
      Object.assign(tipsProps, { open: false });
    }

    const TextDom = (
      <div className={`${longTextCls}-text`} style={style} ref={el}>
        {text}
      </div>
    );

    // 是否转换为 ToolTips 模式
    if (isToolTips) {
      return (
        <Tooltip {...tipsProps} title={text}>
          {TextDom}
        </Tooltip>
      );
    }

    return <Popover {...tipsProps}>{TextDom}</Popover>;
  }

  return (
    <div className={longTextCls} style={style}>
      <div className={`${longTextCls}-text`} ref={el}>
        {text}
      </div>

      {isOverflow && (
        <Popover placement={placement} overlayClassName={`${longTextCls}-popover`} content={text}>
          {icon}
        </Popover>
      )}
    </div>
  );
};

export default LongText;
