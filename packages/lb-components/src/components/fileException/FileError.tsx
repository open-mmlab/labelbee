import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd/es';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface IFileErrorProps {
  width?: number;
  height?: number;
  reloadImage: () => void;
  hideSetInvalidTips?: boolean;
  /** 忽略顶部的偏移，如: 多边形的容器已经计算好高度（容器不包含顶部标注提示语部分） */
  ignoreOffsetY?: boolean;
  layerStyle?: React.CSSProperties;
  backgroundColor: string;
  fileType?: string;
  isError?: boolean;
}

const FileError = (props: IFileErrorProps) => {
  const {
    width,
    height,
    reloadImage,
    hideSetInvalidTips,
    ignoreOffsetY,
    backgroundColor,
    fileType = 'image',
  } = props;

  const { t } = useTranslation();

  const top = !ignoreOffsetY ? 40 : 0;

  const layerStyle: React.CSSProperties = props.layerStyle || {
    position: 'absolute',
    left: 0,
    top,
    cursor: 'initial',
    zIndex: 20,
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
          {`${t(`${fileType}ErrorAndReload`)}${hideSetInvalidTips ? '' : t('orMaskAsInvalid')}`}
        </div>
      </div>
    </div>
  );
};

export default FileError;
