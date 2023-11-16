import { AppProps } from '@/App';
import AnnotationView from '@/components/AnnotationView';
import PointCloudAnnotationView from '@/components/AnnotationView/pointCloudAnnotationView';
import QuestionView from '@/components/LLMToolView/questionView';
import { i18n } from '@labelbee/lb-utils';
import React, { useImperativeHandle, useState, useCallback } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { AnyAction } from 'redux';
import App from './App';
import configureStore from './configureStore';
import { PageBackward, PageForward, PageJump } from './store/annotation/actionCreators';
import { ToolInstance } from './store/annotation/types';
import { VideoTagTool } from '@/components/videoPlayer/TagToolInstanceAdaptorI18nProvider';
import './index.scss';
import { PointCloudProvider } from './components/pointCloudView/PointCloudContext';
import { AppState } from './store';
import { LabelBeeContext } from '@/store/ctx';
import PredictTracking from '@/components/predictTracking';
import LLMToolView from '@/components/LLMToolView';
import SwitchCuboidBoxIn2DView from '@/views/MainView/toolFooter/SwitchCuboidBoxIn2DView';

export const store = configureStore();

const OutputApp = (props: AppProps, ref: any) => {
  const [toolInstance, setToolInstance] = useState<ToolInstance>();
  const storeState = store.getState() as AppState;
  const { skipBeforePageTurning } = storeState?.annotation ?? {};

  const dispatchAction = useCallback(
    (action: AnyAction) => {
      if (skipBeforePageTurning) {
        return skipBeforePageTurning(() => store.dispatch(action));
      }
      store.dispatch(action);
    },
    [skipBeforePageTurning, store.dispatch],
  );

  const pageBackwardActions = useCallback(() => {
    dispatchAction(PageBackward() as unknown as AnyAction);
  }, [dispatchAction]);

  const pageForwardActions = useCallback(() => {
    dispatchAction(PageForward() as unknown as AnyAction);
  }, [dispatchAction]);

  const pageJump = useCallback(
    (page: string) => {
      const imgIndex = ~~page - 1;
      const result = dispatchAction(PageJump(imgIndex) as unknown as AnyAction);
      return !!result;
    },
    [dispatchAction],
  );

  // 暴露给 ref 的一些方法
  useImperativeHandle(
    ref,
    () => {
      return {
        toolInstance,
        annotationEngine: storeState.annotation.annotationEngine,
        pageBackwardActions,
        pageForwardActions,
        pageJump,
        hello: () => alert(`hello labelBee!!!`),
      };
    },
    [toolInstance],
  );

  return (
    <Provider store={store} context={LabelBeeContext}>
      <I18nextProvider i18n={i18n}>
        <PointCloudProvider>
          <App
            {...props}
            setToolInstance={(toolInstance) => {
              setToolInstance(toolInstance);
              props.onLoad?.({ toolInstance });
            }}
          />
        </PointCloudProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default React.forwardRef(OutputApp);

export {
  AnnotationView,
  PointCloudAnnotationView,
  QuestionView,
  LLMToolView,
  i18n,
  VideoTagTool,
  PredictTracking,
  SwitchCuboidBoxIn2DView,
};

export * from './constant';

export * from './typeTem';
