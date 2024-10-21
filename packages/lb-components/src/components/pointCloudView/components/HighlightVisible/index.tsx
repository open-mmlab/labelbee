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
  disabled,
}: {
  visible: boolean;
  loading: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const defaultStyle = {
    background: 'rgba(0, 0, 0, 0.74)',
    color: 'white',
    borderRadius: 2,
    padding: 6,
    fontSize: 16,
  };
  const disabledStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'not-allowed',
  };
  let ShowIcon = visible ? EyeFilled : EyeInvisibleFilled;

  if (loading) {
    ShowIcon = LoadingOutlined;
    Object.assign(defaultStyle, { borderRadius: 100 });
  }

  const allStyle = { ...defaultStyle, ...style };

  if (disabled) {
    Object.assign(allStyle, disabledStyle);
  }

  return (
    <ShowIcon
      disabled={disabled}
      className={getClassName('point-cloud-highlight-view')}
      style={allStyle}
      onClick={loading || disabled ? () => {} : onClick}
    />
  );
};

export default HighlightVisible;
