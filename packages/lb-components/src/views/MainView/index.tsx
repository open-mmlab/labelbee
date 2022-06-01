import { AppProps } from '@/App';
import { ViewportProvider } from '@/components/customResizeHook';
import { prefix } from '@/constant';
import { AppState } from '@/store';
import { Spin } from 'antd';
import { Layout } from 'antd/es';
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import AnnotationOperation from './annotationOperation';
import AnnotationTips from './annotationTips';
import Sidebar from './sidebar';
import ToolFooter from './toolFooter';
import ToolHeader from './toolHeader';

interface IProps {
  path: string;
  loading: boolean;
}

const { Sider, Content } = Layout;

const layoutCls = `${prefix}-layout`;
const MainView: React.FC<AppProps & IProps> = (props) => {
  const showTips = props.showTips ?? false;

  return (
    <ViewportProvider>
      <Spin spinning={props.loading}>
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
              {showTips === true && <AnnotationTips tips={props.path} />}
              <AnnotationOperation {...props} />
              <ToolFooter style={props.style?.footer} mode={props.mode} footer={props?.footer} />
            </Content>
            <Sider className={`${layoutCls}__side`} width='auto' style={props.style?.sider}>
              <Sidebar sider={props?.sider} />
            </Sider>
          </Layout>
        </Layout>
      </Spin>
    </ViewportProvider>
  );
};

const mapStateToProps = ({ annotation }: AppState) => {
  const { imgList, loading } = annotation;
  const imgInfo = imgList[annotation.imgIndex] ?? {};
  return {
    path: imgInfo?.url ?? imgInfo?.path ?? '', // 将当前路径的数据注入
    loading,
  };
};

export default connect(mapStateToProps)(MainView);
