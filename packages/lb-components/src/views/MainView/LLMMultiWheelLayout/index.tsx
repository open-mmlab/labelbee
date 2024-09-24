import { AppProps } from '@/App';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React, { useState, useMemo } from 'react';
import Sidebar from '../sidebar';
import ToolFooter from '../toolFooter';
import { getClassName } from '@/utils/dom';
import { classnames } from '@/utils';
import { LLMContext, LLMMultiWheelContext } from '@/store/ctx';
import LLMToolView from '@/components/LLMToolView';
import { IModelAPIAnswer, IAnswerList } from '@/components/LLMToolView/types';
import useLLMMultiWheelStore from '@/store/LLMMultiWheel';
import { ToggleDataFormatType } from '@/components/LLMToolView/questionView/components/header';
import LLMMultiWheelView from '@/components/LLMMultiWheelView';

export const LLMMultiWheelViewCls = `${prefix}-LLMMultiWheelView`;

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

const LLMMultiWheelLayout: React.FC<AppProps & IProps> = (props) => {
  const { dataFormatType, setDataFormatType } = useLLMMultiWheelStore();

  return (
    <Layout className={getClassName('layout', 'container')}>
      {props?.leftSider}
      <Content
        className={classnames({
          [`${layoutCls}__content`]: true,
          [`${prefix}-LLMLayout`]: true,
        })}
      >
        <div className={`${LLMMultiWheelViewCls}`}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <ToggleDataFormatType
              dataFormatType={dataFormatType}
              setDataFormatType={setDataFormatType}
            />
          </div>

          <LLMMultiWheelView />
        </div>

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
