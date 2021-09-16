import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './components/Annotation';
import { mockFileList, getMockResult } from './mock/index';
import { getStepList, getDependStepList } from './mock/taskConfig';

const getTool = () => new URLSearchParams(window.location.search).get('tool');

const App = () => {
  const stepList = getDependStepList();

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
