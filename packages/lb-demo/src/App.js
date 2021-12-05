import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './components/Annotation';
import { fileList as mockFileList, getMockResult } from './mock/index';
import { getStepList, getDependStepList } from './mock/taskConfig';
import qs from 'qs';
import { AnnotationView } from '@labelbee/lb-components';
import { DEFAULT_ANNOTATIONS } from './mock';

const App = () => {
  const tool = qs.parse(window.location.search, { ignoreQueryPrefix: true, comma: true }).tool;

  const isSingleTool = !Array.isArray(tool);
  const stepList = isSingleTool ? getStepList(tool) : getDependStepList(tool);

  const [fileList] = useState(
    mockFileList.map((url, i) => ({
      id: i + 1,
      url,
      result: isSingleTool ? getMockResult(tool) : '',
    })),
  );

  // 参看工具的展示
  if (tool === 'annotationView') {
    return (
      <div>
        <div style={{ height: 500 }}>
          <AnnotationView
            src='https://cdn.nba.com/manage/2020/10/andre-iguodala-iso-smile-0520-784x588.jpg'
            annotations={DEFAULT_ANNOTATIONS}
            style={{
              color: 'blue',
              thickness: 5,
            }}
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
