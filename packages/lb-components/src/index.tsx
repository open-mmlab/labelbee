import { AppProps } from '@/App';
import AnnotationView from '@/components/AnnotationView';
import PointCloudAnnotationView from '@/components/AnnotationView/pointCloudAnnotationView';
import { i18n } from '@labelbee/lb-utils';
import React, { useImperativeHandle, useState } from 'react';
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

export const store = configureStore();

const OutputApp = (props: AppProps, ref: any) => {
  const [toolInstance, setToolInstance] = useState<ToolInstance>();
  // 暴露给 ref 的一些方法
  useImperativeHandle(
    ref,
    () => {
      return {
        toolInstance,
        annotationEngine: (store.getState() as AppState).annotation.annotationEngine,
        pageBackwardActions: () => store.dispatch(PageBackward() as unknown as AnyAction),
        pageForwardActions: () => store.dispatch(PageForward() as unknown as AnyAction),
        pageJump: (page: string) => {
          const imgIndex = ~~page - 1;
          store.dispatch(PageJump(imgIndex) as unknown as AnyAction);
        },
        hello: () => alert(`hello labelBee!!!`),
      };
    },
    [toolInstance],
  );

  return (
    <Provider store={store} context={LabelBeeContext}>
      <I18nextProvider i18n={i18n}>
        <PointCloudProvider>
          <App {...props} setToolInstance={setToolInstance} />
        </PointCloudProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default React.forwardRef(OutputApp);

export { AnnotationView, PointCloudAnnotationView, i18n, VideoTagTool };

export * from './constant';