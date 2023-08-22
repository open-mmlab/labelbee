import React from 'react';
import { ExpandAltOutlined } from '@ant-design/icons';
import { getClassName } from '@/utils/dom';

interface IProps {
  title: string | React.ReactElement | null | undefined;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const TitleButton = ({ title, onClick, style }: IProps) => {
  return (
    <span className={getClassName('point-cloud-container', 'title-button')} style={style}>
      {title}
      {onClick && <ExpandAltOutlined onClick={onClick} style={{ marginLeft: 4 }} />}
    </span>
  );
};
export default TitleButton;
