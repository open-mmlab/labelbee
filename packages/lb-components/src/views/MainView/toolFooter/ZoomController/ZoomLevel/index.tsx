import React, { useState, useEffect } from 'react';
import { AppState } from '@/store';
import { ToolInstance } from '@/store/annotation/types';
import { connect } from 'react-redux';

interface IProps {
  toolInstance: ToolInstance;
}

const ZoomLevel: React.FC<IProps> = ({ toolInstance }) => {
  const [, forceRender] = useState<number>(0);
  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('renderZoom', () => {
        forceRender((s) => s + 1);
      });
    }
  }, [toolInstance]);

  const zoom = toolInstance?.zoom ?? 1;

  return (
    <span className="zoomValue">
      {(zoom * 100).toFixed(1)}
      %
    </span>
  );
};

const mapStateToProps = (state: AppState) => ({
  toolInstance: state.annotation.toolInstance,
});

export default connect(mapStateToProps)(ZoomLevel);
