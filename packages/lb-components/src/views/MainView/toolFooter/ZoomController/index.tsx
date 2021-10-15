import React from 'react';
import adaptIcon from '@/assets/annotation/common/icon_adapt.svg';
import adaptIconBlack from '@/assets/annotation/common/icon_adapt_black.svg';
import {
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { AppState } from '@/store';
import { ToolInstance } from '@/store/annotation/types';
import { connect } from 'react-redux';
import ZoomLevel from './ZoomLevel';
import { footerCls } from '../index';

interface IProps {
  toolInstance: ToolInstance
  mode?: 'light' | 'dark'
}

const ZoomController: React.FC<IProps> = ({ toolInstance, mode }) => {
  const initialPosition = () => {
    toolInstance.initImgPos();
  };

  let defaultIcon = adaptIcon;
  
  if (mode === 'light') {
    defaultIcon = adaptIconBlack;
  }

  return <div>
    <span className={`${footerCls}__zoomController`}>
      <MinusOutlined
        className={`${footerCls}__highlight`}
        onClick={() => {
          toolInstance.zoomChanged(false);
        }}
      />
      <span className={`${footerCls}__zoomText`} onClick={initialPosition}>
        <img src={defaultIcon} className='adaptIcon' />
        <ZoomLevel />
      </span>
      <PlusOutlined
        className={`${footerCls}__highlight`}
        onClick={() => {
          toolInstance.zoomChanged(true);
        }}
      />
    </span>
  </div>
}

const mapStateToProps = (state: AppState) => ({
  toolInstance: state.annotation.toolInstance,
});

export default connect(mapStateToProps)(ZoomController);
