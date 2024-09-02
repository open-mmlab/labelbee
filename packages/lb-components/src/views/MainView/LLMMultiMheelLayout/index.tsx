import { AppProps } from '@/App';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React, { useState, useMemo } from 'react';
import Sidebar from '../sidebar';
import ToolFooter from '../toolFooter';
import { getClassName } from '@/utils/dom';
import { classnames } from '@/utils';
import { LLMMultiMheelContext } from '@/store/ctx';
import LLMToolView from '@/components/LLMToolView';
import { IModelAPIAnswer, IAnswerList } from '@/components/LLMToolView/types';

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

const LLMMultiMheelLayout: React.FC<AppProps & IProps> = (props) => {
  const [hoverKey, setHoverKey] = useState(-1);
  const [modelAPIResponse, setModelAPIResponse] = useState<IModelAPIAnswer[]>([]);
  const [newAnswerList, setNewAnswerList] = useState<IAnswerList[]>([]);

  return (
    <Layout className={getClassName('layout', 'container')}>
      <LLMMultiMheelContext.Provider
        value={useMemo(() => {
          return {
            hoverKey,
            setHoverKey,
            selectKey,
            setSelectKey,
          };
        }, [hoverKey, modelAPIResponse, newAnswerList])}
      >
        {props?.leftSider}
        <Content
          className={classnames({
            [`${layoutCls}__content`]: true,
            [`${prefix}-LLMLayout`]: true,
          })}
        >
          {/* <LLMToolView
            checkMode={props.checkMode}
            showTips={props.showTips}
            tips={props.tips}
            drawLayerSlot={props.drawLayerSlot}
          /> */}
          <div>多轮的内容</div>
          <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
        </Content>
        <Sider className={`${layoutCls}__side`} width={600} style={{ position: 'relative' }}>
          <Sidebar sider={props?.sider} checkMode={props?.checkMode} />
          {props.drawLayerSlot?.({})}
        </Sider>
      </LLMMultiMheelContext.Provider>
    </Layout>
  );
};

export default LLMMultiMheelLayout;
