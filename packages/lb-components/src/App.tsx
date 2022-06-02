import MainView from '@/views/MainView';
import { i18n } from '@labelbee/lb-utils';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { store } from '.';
import { AppState } from './store';
import { ANNOTATION_ACTIONS } from './store/Actions';
import { InitTaskData, loadImgList } from './store/annotation/actionCreators';
import { LoadImageAndFileData } from './store/annotation/reducer';
import { ToolInstance } from './store/annotation/types';
import {
  GetFileData,
  OnSave,
  OnSubmit,
  IFileItem,
  OnPageChange,
  OnStepChange,
  LoadFileList,
} from './types/data';
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
  imgList?: IFileItem[];
  config: string;
  stepList: IStepInfo[];
  step: number;
  onSubmit?: OnSubmit;
  onSave?: OnSave;
  onPageChange?: OnPageChange;
  onStepChange?: OnStepChange;
  getFileData?: GetFileData;
  pageSize: number;
  loadFileList?: LoadFileList;
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
  showTips?: boolean; // 是否展示 tips
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
    step = 1,
    stepList,
    onSubmit,
    onSave,
    onPageChange,
    onStepChange,
    initialIndex = 0,
    toolInstance,
    setToolInstance,
    getFileData,
    pageSize = 10,
    loadFileList,
    defaultLang = 'cn',
  } = props;

  useEffect(() => {
    store.dispatch(
      InitTaskData({
        onSubmit,
        stepList,
        step,
        getFileData,
        pageSize,
        loadFileList,
        onSave,
        onPageChange,
        onStepChange,
      }),
    );

    initImgList();
    // 初始化国际化语言
    i18n.changeLanguage(defaultLang);
  }, []);

  useEffect(() => {
    setToolInstance?.(toolInstance);
  }, [toolInstance]);

  // 初始化imgList 优先以loadFileList方式加载数据
  const initImgList = () => {
    if (loadFileList) {
      loadImgList(store.dispatch, store.getState, initialIndex, true).then((isSuccess) => {
        if (isSuccess) {
          store.dispatch(LoadImageAndFileData(initialIndex));
        }
      });
    } else if (imgList && imgList.length > 0) {
      store.dispatch({
        type: ANNOTATION_ACTIONS.UPDATE_IMG_LIST,
        payload: {
          imgList,
        },
      });
      store.dispatch(LoadImageAndFileData(initialIndex));
    }
  };

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
