import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './components/Annotation';
import { mockFileList, getMockResult } from './mock/index';
import { getStepList, getDependStepList } from './mock/taskConfig';
import qs from 'qs';

const App = () => {
  const tools = qs.parse(window.location.search, { ignoreQueryPrefix: true, comma: true }).tool;
  const stepList = Array.isArray(tools) ? getDependStepList(tools) : getStepList(tools);

  const [fileList] = useState(mockFileList);

  const goBack = (data) => {
    console.log('goBack', data);
  };

  if (fileList.length > 0) {
    return <Annotation fileList={fileList} goBack={goBack} stepList={stepList} step={1} />;
  }

  return <div className='App'></div>;
};

export default App;
