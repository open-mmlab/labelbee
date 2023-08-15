/**
 * Render Component for highlight.
 */
import React from 'react';
import { EyeFilled, EyeInvisibleFilled, LoadingOutlined } from '@ant-design/icons';

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
    zIndex: 101,
  };
  let ShowIcon = visible ? EyeFilled : EyeInvisibleFilled;

  if (loading) {
    ShowIcon = LoadingOutlined;
    Object.assign(defaultStyle, { borderRadius: 100 });
  }

  return <ShowIcon style={{ ...defaultStyle, ...style }} onClick={loading ? () => {} : onClick} />;
};

export default HighlightVisible;
