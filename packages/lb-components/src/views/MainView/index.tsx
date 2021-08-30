import React from 'react';
import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import ToolHeader from './toolHeader';
import AnnotationOperation from './annotationOperation';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import { prefix } from '@/constant'
import { getNewNode } from '@/utils';
import { Layout } from 'antd';

const { Header, Footer, Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;
const MainView: React.FC<AppProps> = (props) => {
  return (
    <ViewportProvider>
      <Layout className={`${layoutCls} ${props.className}`}>
        <Header className={`${layoutCls}__header`}>
          {
            getNewNode(props.header, <ToolHeader headerName={props.headerName} goBack={props.goBack} exportData={props.exportData} />)
          }
        </Header>
        <Layout>
          <Content>
            <AnnotationOperation {...props} />
          </Content>
          <Sider className={`${layoutCls}__side`} width='auto'>
            {
              getNewNode(props.sider, <Sidebar />)
            }
          </Sider>
        </Layout>
        <Footer className={`${layoutCls}__footer`}>
          {
            getNewNode(props.footer, <ToolFooter />)
          }
        </Footer>
      </Layout>
    </ViewportProvider>
  );
};

export default MainView;
