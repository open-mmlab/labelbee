import React, { useState } from 'react';
import { Popover } from 'antd';

type Source = string | React.ReactElement;

const Icon = ({ source }: { source: Source }) => {
  if (typeof source === 'string') {
    return <img src={source} width={14} height={14} style={{ marginRight: 4 }} />;
  }

  return source;
};

const FooterPopover = ({
  hoverIcon,
  icon,
  containerStyle,
  content,
  title,
}: {
  hoverIcon: Source;
  icon: Source;
  containerStyle?: React.CSSProperties;
  content: React.ReactNode;
  title: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayIcon = <Icon source={isOpen ? hoverIcon ?? icon : icon} />;

  return (
    <Popover
      placement='topLeft'
      content={content}
      // @ts-ignore
      onMouseMove={() => {
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsOpen(false);
      }}
      overlayClassName='tool-hotkeys-popover'
      className='tipsBar'
    >
      <div
        className='shortCutTitle'
        onMouseMove={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={containerStyle}
      >
        <a className='svg'>
          {displayIcon}
          {title}
        </a>
      </div>
    </Popover>
  );
};

export default FooterPopover;
