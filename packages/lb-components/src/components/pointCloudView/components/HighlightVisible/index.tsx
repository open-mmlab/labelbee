/**
 * Render Component for highlight.
 */
import React from 'react';
import { EyeFilled, EyeInvisibleFilled, LoadingOutlined } from '@ant-design/icons';
import { getClassName } from '@/utils/dom';

const HighlightVisible = ({
  visible,
  style,
  onClick,
  loading,
}: {
  visible: boolean;
  loading: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
}) => {
  const defaultStyle = {
    background: 'rgba(0, 0, 0, 0.74)',
    color: 'white',
    borderRadius: 2,
    padding: 6,
    fontSize: 16,
  };
  let ShowIcon = visible ? EyeFilled : EyeInvisibleFilled;

  if (loading) {
    ShowIcon = LoadingOutlined;
    Object.assign(defaultStyle, { borderRadius: 100 });
  }

  return (
    <ShowIcon
      className={getClassName('point-cloud-highlight-view')}
      style={{ ...defaultStyle, ...style }}
      onClick={loading ? () => {} : onClick}
    />
  );
};

export default HighlightVisible;
