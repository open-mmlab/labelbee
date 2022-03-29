import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import React from 'react';
import AnnotationOperation from './annotationOperation';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import ToolHeader from './toolHeader';

const { Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;
const MainView: React.FC<AppProps> = (props) => {
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
          ,
        </header>
        <Layout>
          {props?.leftSider}
          <Content className={`${layoutCls}__content`}>
            <AnnotationOperation {...props} />
            <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
          </Content>
          <Sider className={`${layoutCls}__side`} width='auto' style={props.style?.sider}>
            <Sidebar sider={props?.sider} />
          </Sider>
        </Layout>
      </Layout>
    </ViewportProvider>
  );
};

export default MainView;
