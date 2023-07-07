import { AppProps } from '@/App';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React, { useState, useMemo } from 'react';
import Sidebar from '../sidebar';
import ToolFooter from '../toolFooter';
import { getClassName } from '@/utils/dom';
import { classnames } from '@/utils';
import { LLMContext } from '@/store/ctx';
import LLMToolView from '@/components/LLMToolView';

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

const LLMLayout: React.FC<AppProps & IProps> = (props) => {
  const siderWidth = props.style?.sider?.width;
  const [hoverKey, setHoverKey] = useState(-1);
  return (
    <Layout className={getClassName('layout', 'container')}>
      <LLMContext.Provider
        value={useMemo(() => {
          return { hoverKey, setHoverKey };
        }, [hoverKey])}
      >
        {props?.leftSider}
        <Content
          className={classnames({
            [`${layoutCls}__content`]: true,
            [`${prefix}-LLMLayout`]: true,
            [`${prefix}-LLMCheckContext`]: !!props.checkMode,
          })}
        >
          <LLMToolView checkMode={props.checkMode} showTips={props.showTips} tips={props.tips} />
          <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
        </Content>

        {props?.sider && (
          <Sider
            className={`${layoutCls}__side`}
            width={siderWidth ?? 240}
            style={props.style?.sider}
          >
            <Sidebar sider={props?.sider} />
          </Sider>
        )}
      </LLMContext.Provider>
    </Layout>
  );
};

export default LLMLayout;
