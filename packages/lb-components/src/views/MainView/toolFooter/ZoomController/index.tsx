import React from 'react';
import adaptIcon from '@/assets/annotation/common/icon_adapt.svg';
import adaptIconBlack from '@/assets/annotation/common/icon_adapt_black.svg';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { AppState } from '@/store';
import { ToolInstance } from '@/store/annotation/types';
import { connect } from 'react-redux';
import ZoomLevel from './ZoomLevel';
import { footerCls, FooterTheme } from '../index';
import { LabelBeeContext } from '@/store/ctx';

interface IZoomControllerProps {
  mode?: FooterTheme;
  initialPosition?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
  zoom?: number; // Allow to show zoom directly
}

export const ZoomController: React.FC<IZoomControllerProps> = ({
  mode,
  initialPosition,
  zoomOut,
  zoomIn,
  zoom,
}) => {
  const defaultIcon = mode === 'light' ? adaptIcon : adaptIconBlack;
  return (
    <div>
      <span className={`${footerCls}__zoomController`}>
        <MinusOutlined
          className={`${footerCls}__highlight`}
          onClick={() => {
            zoomOut?.();
          }}
        />
        <span
          className={`${footerCls}__zoomText`}
          onClick={() => {
            initialPosition?.();
          }}
        >
          <img src={defaultIcon} className='adaptIcon' />
          <ZoomLevel zoom={zoom} />
        </span>
        <PlusOutlined
          className={`${footerCls}__highlight`}
          onClick={() => {
            zoomIn?.();
          }}
        />
      </span>
    </div>
  );
};

const ZoomControllerWithToolInstance: React.FC<{
  toolInstance: ToolInstance;
  mode: FooterTheme;
}> = ({ toolInstance }) => {
  const initialPosition = () => {
    toolInstance.initImgPos();
  };

  const zoomOut = () => {
    toolInstance.zoomChanged(false);
  };

  const zoomIn = () => {
    toolInstance.zoomChanged(true);
  };

  return <ZoomController initialPosition={initialPosition} zoomIn={zoomIn} zoomOut={zoomOut} />;
};

export default connect(
  (state: AppState) => ({
    toolInstance: state.annotation.toolInstance,
  }),
  null,
  null,
  { context: LabelBeeContext },
)(ZoomControllerWithToolInstance);
