import React from 'react';
import { ExpandAltOutlined } from '@ant-design/icons';
import { getClassName } from '@/utils/dom';

interface IProps {
  title: string | React.ReactElement | null;
  onClick: () => void;
  style?: any;
}

const TitleButton = ({ title, onClick, style }: IProps) => {
  return (
    <span className={getClassName('point-cloud-container', 'title-button')} style={style}>
      {title}
      <ExpandAltOutlined onClick={onClick} style={{ marginLeft: 4 }} />
    </span>
  );
};
export default TitleButton;
