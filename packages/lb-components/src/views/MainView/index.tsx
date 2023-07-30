import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import { prefix } from '@/constant';
import { Spin } from 'antd';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React from 'react';
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
import PreviewResult from '@/components/predictTracking/previewResult';
import { LabelBeeContext } from '@/store/ctx';
import { EToolName } from '@/data/enums/ToolType';
import LLMLayout from './LLMLayout';
import AudioAnnotate from '@/components/audioAnnotate'

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

const ViewportProviderLayout = (props: AppProps & IProps & { children: any }) => {
  const { stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;
  return (
    <ViewportProvider>
      <Spin spinning={props.loading}>
        <Layout className={classnames([layoutCls, props.className])} style={props.style?.layout}>
          <header className={`${layoutCls}__header`} style={props.style?.header}>
            <ToolHeader
              header={props?.header}
              headerName={props.headerName}
              goBack={props.goBack}
              exportData={props.exportData}
              hasLangNode={EToolName.LLM !== currentToolName}
              hasHeaderOption={EToolName.LLM !== currentToolName}
              hasPredictTrackingIcon={EToolName.LLM !== currentToolName}
            />
          </header>
          {props.children}
        </Layout>
      </Spin>
    </ViewportProvider>
  );
};

const MainView: React.FC<AppProps & IProps> = (props) => {
  const siderWidth = props.style?.sider?.width;
  const { stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;
  const isLLMTool = EToolName.LLM === currentToolName;
  const isAudioTool = ToolUtils.isAudioTool(currentToolName);
  if (isLLMTool) {
    return (
      <ViewportProviderLayout {...props}>
        <LLMLayout {...props} />
      </ViewportProviderLayout>
    );
  }

  if (isAudioTool) {
    return <ViewportProviderLayout {...props}>
      <AudioAnnotate {...props} />
    </ViewportProviderLayout>
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
        <PreviewResult />
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
