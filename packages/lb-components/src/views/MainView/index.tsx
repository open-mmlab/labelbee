import React from 'react';
import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import ToolHeader from './toolHeader';
import AnnotationOperation from './annotationOperation';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import { prefix } from '@/constant';
import { getNewNode } from '@/utils';
import { Layout } from 'antd';

const { Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;
const MainView: React.FC<AppProps> = (props) => {
  return (
    <ViewportProvider>
      <Layout className={`${layoutCls} ${props.className}`} style={props.style?.layout}>
        <header className={`${layoutCls}__header`} style={props.style?.header}>
          {getNewNode(
            props.header,
            <ToolHeader
              headerName={props.headerName}
              goBack={props.goBack}
              exportData={props.exportData}
            />,
          )}
        </header>
        <Layout>
          <Content className={`${layoutCls}__content`}>
            <AnnotationOperation {...props} />
            {getNewNode(props.footer, <ToolFooter style={props.style?.footer} />)}
          </Content>
          <Sider className={`${layoutCls}__side`} width='auto' style={props.style?.sider}>
            {getNewNode(props.sider, <Sidebar />)}
          </Sider>
        </Layout>
      </Layout>
    </ViewportProvider>
  );
};

export default MainView;
