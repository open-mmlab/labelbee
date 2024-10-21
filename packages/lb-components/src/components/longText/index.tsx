/**
 * @file Text exceeds display view more
 * @author lixinghua <lixinghua@sensetime.com>;
 * @date 2023-04-10
 */

import React, { useRef, ReactElement, CSSProperties, useMemo, forwardRef, LegacyRef } from 'react';
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

const TextDom = forwardRef(
  (
    {
      text,
      overflowMaxLines,
      style,
      ...rest
    }: {
      text: string;
      overflowMaxLines: number;
      style?: CSSProperties;
    },
    ref: LegacyRef<HTMLDivElement> | undefined,
  ) => {
    const singleLineStyle = {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
    const linesStyle = {
      display: '-webkit-box',
      WebkitLineClamp: overflowMaxLines,
      WebkitBoxOrient: 'vertical' as 'vertical',
      overflow: 'hidden',
    };

    const initStyle = overflowMaxLines > 1 ? linesStyle : singleLineStyle;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const divStyle = {
      ...initStyle,
      ...(style ?? {}),
    } as CSSProperties;

    return (
      <div style={divStyle} ref={ref} {...rest}>
        {text}
      </div>
    );
  },
);

const LongText = (props: IProps) => {
  const {
    text,
    placement = 'bottom',
    icon = <SearchOutlined />,
    openByText,
    style,
    isToolTips,
    overflowMaxLines = 1,
  } = props;

  const el = useRef<null | HTMLDivElement>(null);
  const size = useSize(el);

  const isOverflow = useMemo(() => {
    if (overflowMaxLines > 1) {
      return el.current && el.current?.clientHeight < el.current?.scrollHeight;
    }
    return el.current && el.current?.clientWidth < el.current?.scrollWidth;
  }, [size]);

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
    // 是否转换为 ToolTips 模式
    if (isToolTips) {
      return (
        <Tooltip {...tipsProps} title={text}>
          <TextDom overflowMaxLines={overflowMaxLines} style={style} ref={el} text={text} />
        </Tooltip>
      );
    }

    return (
      <Popover {...tipsProps}>
        <TextDom overflowMaxLines={overflowMaxLines} style={style} ref={el} text={text} />
      </Popover>
    );
  }

  return (
    <div className={longTextCls} style={style}>
      <TextDom overflowMaxLines={overflowMaxLines} style={style} ref={el} text={text} />

      {isOverflow && (
        <Popover placement={placement} overlayClassName={`${longTextCls}-popover`} content={text}>
          {icon}
        </Popover>
      )}
    </div>
  );
};

export default LongText;
