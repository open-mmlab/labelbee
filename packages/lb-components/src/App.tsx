import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { store } from '.';
import { AppState } from './store';
import { InitTaskData } from './store/annotation/actionCreators';
import MainView from '@/views/MainView';
import { IStepInfo } from './types/step';
import { OnSubmit, GetFileData } from './types/data';
import { ToolInstance } from './store/annotation/types';

export interface AppProps {
  exportData?: (data: any[]) => void;
  goBack?: () => void;
  imgList: string[];
  config: string;
  stepList: IStepInfo[];
  step: number;
  onSubmit?: OnSubmit;
  getFileData?: GetFileData;
  headerName?: string;
  initialIndex?: number;
  className?: string;
  toolInstance: ToolInstance;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sider?: React.ReactNode;
  style?: {
    [key: string]: any;
  };
  setToolInstance?: (tool: ToolInstance) => void;
}

const App: React.FC<AppProps> = (props) => {
  const {
    imgList,
    step,
    stepList,
    onSubmit,
    initialIndex = 0,
    toolInstance,
    setToolInstance,
    getFileData
  } = props;
  useEffect(() => {
    store.dispatch(InitTaskData({ imgList, onSubmit, stepList, step, initialIndex, getFileData }));
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
