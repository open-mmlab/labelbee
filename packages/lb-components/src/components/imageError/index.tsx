import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface IProps {
  width?: number;
  height?: number;
  reloadImage: () => void;
  hideSetInvalidTips?: boolean;
  /** 忽略顶部的偏移，如: 多边形的容器已经计算好高度（容器不包含顶部标注提示语部分） */
  ignoreOffsetY?: boolean;
  layerStyle?: React.CSSProperties;
  backgroundColor?: string;
  fileTypeName?: string;
}

const showTips = true
const ImageError = (props: IProps) => {
  const {
    width,
    height,
    reloadImage,
    hideSetInvalidTips,
    ignoreOffsetY,
    backgroundColor,
    fileTypeName = '图片',
  } = props;

  const top = showTips && !ignoreOffsetY ? 40 : 0;

  const layerStyle: React.CSSProperties = props.layerStyle || {
    position: 'absolute',
    left: 0,
    top,
    cursor: 'initial',
    zIndex: 22,
    fontSize: 12,
  };
  if (width && height) {
    Object.assign(layerStyle, { width, height });
  } else {
    Object.assign(layerStyle, { bottom: 0, right: 0 });
  }

  if (backgroundColor) {
    Object.assign(layerStyle, { backgroundColor });
  }

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div style={layerStyle}>
      <div style={buttonStyle}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <Button type='primary' shape='circle' icon={<ReloadOutlined />} onClick={reloadImage} />
        </div>
        <div>
          {`${fileTypeName}加载失败, 请重新加载${
            hideSetInvalidTips ? '' : ` 或 将${fileTypeName}标为无效`
          }`}
        </div>
      </div>
    </div>
  );
};

export default ImageError;
