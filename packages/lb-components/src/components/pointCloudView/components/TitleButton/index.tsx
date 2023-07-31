import React from 'react';
import { ExpandAltOutlined } from '@ant-design/icons';
import { getClassName } from '@/utils/dom';

interface IProps {
  title: string | React.ReactElement | null | undefined;
  onClick?: () => void;
  style?: React.CSSProperties;
  hiedZoom?: boolean; // Hide zoom function
}

const TitleButton = ({ title, onClick, style, hiedZoom }: IProps) => {
  return (
    <span className={getClassName('point-cloud-container', 'title-button')} style={style}>
      {title}
      {!hiedZoom && <ExpandAltOutlined onClick={onClick} style={{ marginLeft: 4 }} />}
    </span>
  );
};
export default TitleButton;
