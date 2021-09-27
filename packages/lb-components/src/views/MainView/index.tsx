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

const { Header, Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;
const MainView: React.FC<AppProps> = (props) => {
  return (
    <ViewportProvider>
      <Layout className={`${layoutCls} ${props.className}`} style={props.style}>
        {
          getNewNode(props.header,
            <Header className={`${layoutCls}__header`}>
              <ToolHeader
                headerName={props.headerName}
                goBack={props.goBack}
                exportData={props.exportData}
              />
            </Header>
          )
        }
        <Layout>
          <Content className={`${layoutCls}__content`}>
            <AnnotationOperation {...props} />
            {getNewNode(props.footer, <ToolFooter />)}
          </Content>
          {
            getNewNode(props.sider,
              <Sider className={`${layoutCls}__side`} width='auto'>
                <Sidebar/>
              </Sider>)
          }
        </Layout>
      </Layout>
    </ViewportProvider>
  );
};

export default MainView;
