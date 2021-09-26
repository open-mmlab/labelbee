import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './components/Annotation';
import { fileList as mockFileList, getMockResult } from './mock/index';
import { getStepList, getDependStepList } from './mock/taskConfig';
import qs from 'qs';

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

  const goBack = (data) => {
    console.log('goBack', data);
  };

  if (fileList.length > 0) {
    return <Annotation fileList={fileList} goBack={goBack} stepList={stepList} step={1} />;
  }

  return <div className='App'></div>;
};

export default App;
