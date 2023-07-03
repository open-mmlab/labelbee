import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import { prefix } from '@/constant';
import { Spin } from 'antd';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React, { useState, useMemo } from 'react';
import AnnotationOperation from './annotationOperation';
import AnnotationTips from './annotationTips';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import ToolHeader from './toolHeader';
import { getStepConfig } from '@/store/annotation/reducer';

import VideoAnnotate from '@/components/videoAnnotate';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import ToolUtils from '@/utils/ToolUtils';
import PointCloudView from '@/components/pointCloudView';
import { getClassName } from '@/utils/dom';
import { classnames } from '@/utils';
import { LabelBeeContext, LLMContext } from '@/store/ctx';
import { EToolName } from '@/data/enums/ToolType';
import LLMToolView from '@/components/LLMToolView';

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;

const ImageAnnotate: React.FC<AppProps & IProps> = (props) => {
  return (
    <>
      {props.showTips === true && <AnnotationTips path={props.path} tips={props.tips} />}
      <AnnotationOperation {...props} />
      <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
    </>
  );
};

const PointCloudAnnotate: React.FC<AppProps & IProps> = (props) => {
  return (
    <>
      <PointCloudView
        drawLayerSlot={props.drawLayerSlot}
        checkMode={props.checkMode}
        intelligentFit={props.intelligentFit}
      />
      <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
    </>
  );
};

const AnnotatedArea: React.FC<AppProps & IProps> = (props) => {
  const { stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;
  const isVideoTool = ToolUtils.isVideoTool(currentToolName);
  const isPointCloudTool = ToolUtils.isPointCloudTool(currentToolName);

  if (isVideoTool) {
    return <VideoAnnotate {...props} />;
  }

  if (isPointCloudTool) {
    return <PointCloudAnnotate {...props} />;
  }

  return <ImageAnnotate {...props} />;
};

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
            [`${prefix}-LLMCheckContext`]: !!props.checkMode,
          })}
        >
          <LLMToolView checkMode={props.checkMode} setHoverKey={setHoverKey} />
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

const ViewportProviderLayout = (props: AppProps & IProps & { children: any }) => (
  <ViewportProvider>
    <Spin spinning={props.loading}>
      <Layout className={classnames([layoutCls, props.className])} style={props.style?.layout}>
        <header className={`${layoutCls}__header`} style={props.style?.header}>
          <ToolHeader
            header={props?.header}
            headerName={props.headerName}
            goBack={props.goBack}
            exportData={props.exportData}
          />
        </header>
        {props.children}
      </Layout>
    </Spin>
  </ViewportProvider>
);

const MainView: React.FC<AppProps & IProps> = (props) => {
  const siderWidth = props.style?.sider?.width;
  const { stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;
  const isLLMTool = EToolName.LLM === currentToolName;
  if (isLLMTool) {
    return (
      <ViewportProviderLayout {...props}>
        <LLMLayout {...props} />
      </ViewportProviderLayout>
    );
  }

  return (
    <ViewportProviderLayout {...props}>
      <Layout className={getClassName('layout', 'container')}>
        {props?.leftSider}
        <Content className={`${layoutCls}__content`}>
          <AnnotatedArea {...props} />
        </Content>
        <Sider
          className={`${layoutCls}__side`}
          width={siderWidth ?? 240}
          style={props.style?.sider}
        >
          <Sidebar sider={props?.sider} />
        </Sider>
      </Layout>
    </ViewportProviderLayout>
  );
};

const mapStateToProps = ({ annotation }: AppState) => {
  const { imgList, loading } = annotation;
  const imgInfo = imgList[annotation.imgIndex] ?? {};
  return {
    path: imgInfo?.path ?? imgInfo?.url ?? '', // 将当前路径的数据注入
    loading,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(MainView);
