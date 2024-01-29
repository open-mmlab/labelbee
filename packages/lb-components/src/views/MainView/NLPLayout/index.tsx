import { AppProps } from '@/App';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React, { useState, useMemo } from 'react';
import Sidebar from '../sidebar';
import ToolFooter from '../toolFooter';
import { getClassName } from '@/utils/dom';
import { classnames } from '@/utils';
import { NLPContext } from '@/store/ctx';
import NLPToolView from '@/components/NLPToolView';

interface IProps {
  path: string;
  loading: boolean;
  remarkLayer?: any;
  remark?: any;
}

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

const NLPLayout: React.FC<AppProps & IProps> = (props) => {
  const [highlightKey, setHighlightKey] = useState('');

  return (
    <Layout className={getClassName('layout', 'container')}>
      <NLPContext.Provider
        value={useMemo(() => {
          return {
            highlightKey,
            setHighlightKey,
          };
        }, [highlightKey])}
      >
        {props?.leftSider}
        <Content
          className={classnames({
            [`${layoutCls}__content`]: true,
            [`${prefix}-NLPLayout`]: true,
          })}
        >
          <NLPToolView
            checkMode={props.checkMode}
            showTips={props.showTips}
            tips={props.tips}
            remarkLayer={props?.remarkLayer}
            remark={props?.remark}
          />
          <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
        </Content>

        <Sider className={`${layoutCls}__side`} width={400} style={{ position: 'relative' }}>
          <Sidebar sider={props?.sider} checkMode={props?.checkMode} />
          {props.drawLayerSlot?.({})}
        </Sider>
      </NLPContext.Provider>
    </Layout>
  );
};

export default NLPLayout;
