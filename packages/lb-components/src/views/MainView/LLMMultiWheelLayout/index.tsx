import { AppProps } from '@/App';
import LLMMultiWheelView from '@/components/LLMMultiWheelView';
import { prefix } from '@/constant';
import { classnames } from '@/utils';
import { getClassName } from '@/utils/dom';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React from 'react';
import Sidebar from '../sidebar';
import ToolFooter from '../toolFooter';

export const LLMMultiWheelViewCls = `${prefix}-LLMMultiWheelView`;

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

const LLMMultiWheelLayout: React.FC<AppProps & IProps> = (props) => {
  return (
    <Layout className={getClassName('layout', 'container')}>
      {props?.leftSider}
      <Content
        className={classnames({
          [`${layoutCls}__content`]: true,
          [`${prefix}-LLMLayout`]: true,
        })}
      >
        <LLMMultiWheelView
          showTips={props.showTips}
          tips={props.tips}
          drawLayerSlot={props.drawLayerSlot}
        />
        <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
      </Content>
      <Sider className={`${layoutCls}__side`} width={600} style={{ position: 'relative' }}>
        <Sidebar sider={props?.sider} checkMode={props?.checkMode} />
        {props.drawLayerSlot?.({})}
      </Sider>
    </Layout>
  );
};

export default LLMMultiWheelLayout;
