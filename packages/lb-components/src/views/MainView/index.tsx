import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import { prefix } from '@/constant';
import { AppState } from '@/store';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import AnnotationOperation from './annotationOperation';
import AnnotationTips from './annotationTips';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import ToolHeader from './toolHeader';
import { getStepConfig } from '@/store/annotation/reducer';
import { cTool } from '@labelbee/lb-annotation';

import VideoAnnotate from '@/components/videoAnnotate';

const { EVideoToolName } = cTool;

interface IProps {
  path: string;
}

const { Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;

const ImageAnnotate: React.FC<AppProps & IProps> = (props) => {
  return (
    <>
      {props.showTips === true && <AnnotationTips tips={props.path} />}
      <AnnotationOperation {...props} />
      <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
    </>
  );
};

const AnnotatedArea: React.FC<AppProps & IProps> = (props) => {
  const { stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;
  const isVideoTool = Object.values(EVideoToolName).includes(currentToolName);
  if (isVideoTool) {
    return <VideoAnnotate {...props} />;
  }

  return <ImageAnnotate {...props} />;
};

const MainView: React.FC<AppProps & IProps> = (props) => {
  return (
    <ViewportProvider>
      <Layout className={`${layoutCls} ${props.className}`} style={props.style?.layout}>
        <header className={`${layoutCls}__header`} style={props.style?.header}>
          <ToolHeader
            header={props?.header}
            headerName={props.headerName}
            goBack={props.goBack}
            exportData={props.exportData}
          />
        </header>
        <Layout>
          {props?.leftSider}
          <Content className={`${layoutCls}__content`}>
            <AnnotatedArea {...props} />
          </Content>
          <Sider className={`${layoutCls}__side`} width='auto' style={props.style?.sider}>
            <Sidebar sider={props?.sider} />
          </Sider>
        </Layout>
      </Layout>
    </ViewportProvider>
  );
};

const mapStateToProps = ({ annotation }: AppState) => {
  const imgInfo = annotation.imgList[annotation.imgIndex] ?? {};
  return {
    path: imgInfo?.url ?? imgInfo?.path ?? '', // 将当前路径的数据注入
  };
};

export default connect(mapStateToProps)(MainView);
