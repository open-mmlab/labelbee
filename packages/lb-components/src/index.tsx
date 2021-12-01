import React, { useImperativeHandle, useState } from 'react';
import { Provider } from 'react-redux';
import { AnyAction } from 'redux';
import configureStore from './configureStore';
import { ToolInstance } from './store/annotation/types';
import App from './App';
import { PageBackward, PageForward, PageJump } from './store/annotation/actionCreators';
import { i18n } from '@sensetime/lb-utils';
import { I18nextProvider } from 'react-i18next';
import AnnotationView from '@/components/AnnotationView';

export const store = configureStore();

const OutputApp = (props: any, ref: any) => {
  const [toolInstance, setToolInstance] = useState<ToolInstance>();
  // 暴露给 ref 的一些方法
  useImperativeHandle(
    ref,
    () => {
      return {
        toolInstance,
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
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <App {...props} setToolInstance={setToolInstance} />
      </I18nextProvider>
    </Provider>
  );
};

export default React.forwardRef(OutputApp);

export { AnnotationView, i18n };
