import { AppProps } from '@/App';
import AnnotationView from '@/components/AnnotationView';
import PointCloudAnnotationView from '@/components/AnnotationView/pointCloudAnnotationView';
import QuestionView from '@/components/LLMToolView/questionView';
import TextContent from '@/components/NLPToolView/textContent';
import { i18n } from '@labelbee/lb-utils';
import React, { useImperativeHandle, useState } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { AnyAction } from 'redux';
import App from './App';
import configureStore from './configureStore';
import { PageBackward, PageForward, PageJump } from './store/annotation/actionCreators';
import { ToolInstance } from './store/annotation/types';
import { VideoTagTool } from '@/components/videoAnnotate/videoTagTool/TagToolInstanceAdaptorI18nProvider';
import './index.scss';
import { PointCloudProvider } from './components/pointCloudView/PointCloudContext';
import { AppState } from './store';
import { LabelBeeContext } from '@/store/ctx';
import PredictTracking from '@/components/predictTracking';
import LLMToolView from '@/components/LLMToolView';
import SwitchCuboidBoxIn2DView, {
  SwitchCuboidBoxIn2DViewStateMode,
} from '@/views/MainView/toolFooter/SwitchCuboidBoxIn2DView';
import BatchSwitchConnectIn2DView from '@/views/MainView/toolFooter/BatchSwitchConnectIn2DView';
import MeasureCanvas from './components/measureCanvas';
import AnnotatedBox from './views/MainView/sidebar/PointCloudToolSidebar/components/annotatedBox';
import RectRotateSensitivitySlider from './views/MainView/sidebar/PointCloudToolSidebar/components/rectRotateSensitivitySlider';
import { FindTrackIDIndexInCheckMode as FindTrackIDIndex } from './views/MainView/sidebar/PointCloudToolSidebar/components/findTrackIDIndex';
import { WrapAudioPlayer as AudioPlayer } from './components/audioPlayer';
import { generatePointCloudBoxRects } from './utils';
import SubAttributeList from './components/subAttributeList';
import { ToolStyleProvider } from './hooks/useToolStyle';
import { LoadFileAndFileData } from './store/annotation/reducer';
import useToolConfigStore from '@/store/toolConfig';

export const store = configureStore();

i18n.use(initReactI18next);
i18n.options.react = {
  useSuspense: false,
};

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
        pageJump: (page: string, isLoadData?: boolean) => {
          const imgIndex = ~~page - 1;
          store.dispatch(PageJump(imgIndex) as unknown as AnyAction);
          if (isLoadData) {
            store.dispatch(LoadFileAndFileData(imgIndex));
          }
        },
        hello: () => alert(`hello labelBee!!!`),
      };
    },
    [toolInstance],
  );

  return (
    <Provider store={store} context={LabelBeeContext}>
      <I18nextProvider i18n={i18n}>
        <ToolStyleProvider value={props.toolStyle}>
          <PointCloudProvider>
            <App
              {...props}
              setToolInstance={(toolInstance) => {
                setToolInstance(toolInstance);
                props.onLoad?.({ toolInstance });
              }}
            />
          </PointCloudProvider>
        </ToolStyleProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default React.forwardRef(OutputApp);

export {
  AnnotationView,
  PointCloudAnnotationView,
  QuestionView,
  TextContent,
  LLMToolView,
  i18n,
  VideoTagTool,
  PredictTracking,
  SwitchCuboidBoxIn2DView,
  SwitchCuboidBoxIn2DViewStateMode,
  BatchSwitchConnectIn2DView,
  MeasureCanvas,
  AnnotatedBox,
  RectRotateSensitivitySlider,
  FindTrackIDIndex,
  AudioPlayer,
  generatePointCloudBoxRects,
  SubAttributeList,
  useToolConfigStore,
};

export * from './constant';

export * from './typeTem';
