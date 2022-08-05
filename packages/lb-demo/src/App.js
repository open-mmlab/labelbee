import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './components/Annotation';
import { fileList as mockFileList, getMockResult, videoList } from './mock/index';
import { getStepList, getDependStepList } from './mock/taskConfig';
import qs from 'qs';
import { AnnotationView } from '@labelbee/lb-components';
import { DEFAULT_ANNOTATIONS } from './mock';
import StepUtils from '@labelbee/lb-components/dist/utils/StepUtils';

const App = () => {
  const tool = qs.parse(window.location.search, { ignoreQueryPrefix: true, comma: true }).tool;

  const isSingleTool = !Array.isArray(tool);
  const stepList = isSingleTool ? getStepList(tool) : getDependStepList(tool);
  const currentIsVideo = StepUtils.currentToolIsVideo(1, stepList);

  const [fileList] = useState(
    (currentIsVideo ? videoList : mockFileList).map((url, i) => ({
      id: i + 1,
      url,
      result: isSingleTool ? getMockResult(tool) : '',
    })),
  );

  const [data, setData] = useState(DEFAULT_ANNOTATIONS);

  const onChange = (type, ids) => {
    if (type === 'hover') {
      setData((pre) => {
        return pre.map((item) => {
          if (item.annotation.id === 'g5r2l7mcrv8') {
            const { annotation } = item;
            return {
              ...item,
              annotation: {
                ...annotation,
                hiddenRectSize: !ids.includes('g5r2l7mcrv8'),
              },
            };
          }
          return item;
        });
      });
    }
  };

  // 参看工具的展示
  if (tool === 'annotationView') {
    return (
      <div>
        <div style={{ height: 1000 }}>
          <AnnotationView
            src='https://cdn.nba.com/manage/2020/10/andre-iguodala-iso-smile-0520-784x588.jpg'
            annotations={data}
            style={{
              stroke: 'blue',
              thickness: 3,
            }}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  const goBack = (data) => {
    console.log('goBack', data);
  };

  if (fileList.length > 0) {
    return <Annotation fileList={fileList} goBack={goBack} stepList={stepList} step={1} />;
  }

  return <div className='App'></div>;
};

export default App;
