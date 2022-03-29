import MainView from '@/views/MainView';
import { i18n } from '@labelbee/lb-utils';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { store } from '.';
import { AppState } from './store';
import { InitTaskData } from './store/annotation/actionCreators';
import { ToolInstance } from './store/annotation/types';
import { GetFileData, OnSave, OnSubmit, IFileItem } from './types/data';
import { Footer, Header, Sider } from './types/main';
import { IStepInfo } from './types/step';

interface IAnnotationStyle {
  strokeColor: string;
  fillColor: string;
  textColor: string;
  toolColor: any;
}

export interface AppProps {
  exportData?: (data: any[]) => void;
  goBack?: () => void;
  imgList: IFileItem[];
  config: string;
  stepList: IStepInfo[];
  step: number;
  onSubmit?: OnSubmit;
  onSave?: OnSave;
  getFileData?: GetFileData;
  headerName?: string;
  initialIndex?: number;
  className?: string;
  toolInstance: ToolInstance;
  header?: Header;
  footer?: Footer;
  sider?: Sider;
  style?: {
    layout?: { [key: string]: any };
    header?: { [key: string]: any };
    sider?: { [key: string]: any };
    footer?: { [key: string]: any };
  };
  setToolInstance?: (tool: ToolInstance) => void;
  mode?: 'light' | 'dark'; // 临时需求应用于 toolFooter 的操作
  defaultLang: 'en' | 'cn'; // 国际化设置
  leftSider?: () => React.ReactNode | React.ReactNode;

  // 标注信息扩展的功能
  dataInjectionAtCreation: (annotationData: any) => {};
  // 渲染增强
  renderEnhance: {
    staticRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
    selectedRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
    creatingRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
  };
}

const App: React.FC<AppProps> = (props) => {
  const {
    imgList,
    step,
    stepList,
    onSubmit,
    onSave,
    initialIndex = 0,
    toolInstance,
    setToolInstance,
    getFileData,
    defaultLang = 'cn',
  } = props;
  useEffect(() => {
    store.dispatch(
      InitTaskData({ imgList, onSubmit, stepList, step, initialIndex, getFileData, onSave }),
    );

    // 初始化国际化语言
    i18n.changeLanguage(defaultLang);
  }, []);

  useEffect(() => {
    setToolInstance?.(toolInstance);
  }, [toolInstance]);

  return (
    <div>
      <MainView {...props} />
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  toolInstance: state.annotation.toolInstance,
});

export default connect(mapStateToProps)(App);
