import React, { useEffect, useState } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { ToolInstance } from '@/store/annotation/types';
import { Divider } from 'antd';

interface IProps {
  toolInstance: ToolInstance;
}

const HiddenTips = (props: IProps) => {
  const { toolInstance } = props;
  const [_, forceRender] = useState(0);
  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('hiddenChange', () => {
        forceRender((s) => s + 1);
      });
    }
  }, [toolInstance]);

  if (!toolInstance) {
    return null;
  }

  const isHidden = toolInstance.isHidden;

  if (isHidden) {
    return <span>标注隐藏中<Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} /></span>;
  }
  
  return null;
};

const mapStateToProps = (state: AppState) => {
  return {
    toolInstance: state.annotation?.toolInstance,
  };
};

export default connect(mapStateToProps)(HiddenTips);
