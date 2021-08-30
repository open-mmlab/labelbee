import React, { useState, useEffect } from 'react';
import adaptIcon from '@/assets/annotation/common/icon_adapt.svg';
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
}

const ZoomController: React.FC<IProps> = ({ toolInstance }) => {
  const initialPosition = () => {
    toolInstance.initImgPos();
  };

  const zoom = toolInstance?.zoom ?? 1;

  return <div>
    <span className={`${footerCls}__zoomController`}>
      <MinusOutlined
        className={`${footerCls}__highlight`}
        onClick={() => {
          toolInstance.zoomChanged(false);
        }}
      />
      <span className={`${footerCls}__zoomText`} onClick={initialPosition}>
        <img src={adaptIcon} className='adaptIcon' />
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
