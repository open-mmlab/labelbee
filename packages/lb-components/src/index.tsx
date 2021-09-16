import React, { useImperativeHandle, useState } from 'react';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { ToolInstance } from './store/annotation/types';
import App from './App';
import { PageBackward, PageForward, PageJump } from './store/annotation/actionCreators';

export const store = configureStore();

const OutputApp = (props: any, ref: any) => {
  const [toolInstance, setToolInstance] = useState<ToolInstance>(null);

  // 暴露给 ref 的一些方法
  useImperativeHandle(
    ref,
    () => {
      return {
        toolInstance,
        pageBackwardActions: () => store.dispatch(PageBackward()),
        pageForwardActions: () => store.dispatch(PageForward()),
        pageJump: (page: string) => {
          const imgIndex = ~~page - 1;
          store.dispatch(PageJump(imgIndex));
        },
        hello: () => alert(`hello labelBee!!!`),
      };
    },
    [toolInstance],
  );

  return (
    <Provider store={store}>
      <App {...props} setToolInstance={setToolInstance} />
    </Provider>
  );
};

export default React.forwardRef(OutputApp);
