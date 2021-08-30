import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { store } from '.';
import { AppState } from './store';
import {
  UpdateImgList,
  SetTaskConfig,
  UpdateOnSubmit,
  UpdateGetFileData,
} from './store/annotation/actionCreators';
import MainView from '@/views/MainView';
import { IStepInfo } from './types/step';
import { ANNOTATION_ACTIONS } from './store/Actions';
import { loadFileData } from './store/annotation/reducer';
import { OnSubmit, GetFileData } from './types/data';
import { ToolInstance } from './store/annotation/types';

export interface AppProps {
  exportData: (data: string) => void;
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
  setToolInstance?: (tool: ToolInstance) => void
}

const App: React.FC<AppProps> = (props) => {
  const { imgList, step, stepList, onSubmit, getFileData, initialIndex = 0, toolInstance, setToolInstance } = props;
  useEffect(() => {
    if (onSubmit) {
      store.dispatch(UpdateOnSubmit(onSubmit));
    }

    if (getFileData) {
      store.dispatch(UpdateGetFileData(getFileData));
    }

    store.dispatch(UpdateImgList(imgList));
    store.dispatch(SetTaskConfig({ stepList, step }));
    store.dispatch({
      type: ANNOTATION_ACTIONS.INIT_TOOL,
    });
    store.dispatch(loadFileData(initialIndex));
  }, []);

  useEffect(() => {
    setToolInstance?.(toolInstance)
  }, [toolInstance])

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
