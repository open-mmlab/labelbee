import React from 'react';

interface IProps {
  width?: number;
  height?: number;
  isVideo?: boolean;
  isAudio?: boolean;
}

const InvalidPage = (props: IProps) => {
  const { width, height, isVideo, isAudio } = props;
  const media = isVideo ? '视频' : isAudio ? '音频' : '图片';
  const topStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    background: 'rgba(255, 87, 34, 1)',
    overflow: 'hidden',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 30,
    opacity: 0.7,
    zIndex: 10,
    cursor: 'initial',
  };

  if (width && height) {
    Object.assign(topStyle, { width, height });
  } else {
    Object.assign(topStyle, { bottom: 0, right: 0 });
  }

  return <div style={topStyle}>{`无效${media}，请跳过`}</div>;
};

export default InvalidPage;
