import React, { useEffect, useState } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { GraphToolInstance } from '@/store/annotation/types';
import { Divider } from 'antd';

interface IProps {
  toolInstance: GraphToolInstance;
}

const PageNumber = (props: IProps) => {
  const { toolInstance } = props;
  const [_, forceRender] = useState(0);
  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('updatePageNumber', () => {
        forceRender((s) => s + 1);
      });
    }
  }, [toolInstance]);

  if (!toolInstance) {
    return null;
  }

  const count = toolInstance?.currentPageResult?.length;
  if (count >= 0) {
    return <span>本页件数: {count}<Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} /></span>;
  }
  
  return null;
};

const mapStateToProps = (state: AppState) => {
  return {
    toolInstance: state.annotation?.toolInstance,
  };
};

export default connect(mapStateToProps)(PageNumber);
