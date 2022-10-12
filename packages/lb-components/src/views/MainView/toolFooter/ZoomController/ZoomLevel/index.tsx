import React, { useEffect } from 'react';
import { AppState } from '@/store';
import { ToolInstance } from '@/store/annotation/types';
import { connect } from 'react-redux';
import useSafeState from '@/hooks/useSafeSate';
import { LabelBeeContext } from '@/store/ctx';

interface IProps {
  toolInstance: ToolInstance;
  zoom?: number;
}

const ZoomLevel: React.FC<IProps> = ({ toolInstance, zoom: basicZoom }) => {
  const [, forceRender] = useSafeState<number>(0);
  useEffect(() => {
    const renderZoom = () => {
      forceRender((s) => s + 1);
    };

    if (toolInstance) {
      // 这里会有内存泄漏的问题  useSafeState 用这个解决下
      toolInstance.on('renderZoom', renderZoom);
    }
    return () => {
      if (toolInstance) {
        toolInstance.unbind('renderZoom', renderZoom);
      }
    };
  }, [toolInstance]);

  const zoom = basicZoom ?? toolInstance?.zoom ?? 1;

  return <span className='zoomValue'>{(zoom * 100).toFixed(1)}%</span>;
};

const mapStateToProps = (state: AppState) => ({
  toolInstance: state.annotation.toolInstance,
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(ZoomLevel);
