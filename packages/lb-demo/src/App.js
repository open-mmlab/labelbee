import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Annotation from './Annotation';
import { fileList as mockFileList, getMockResult } from './mock/index';
import { getStepList } from './mock/taskConfig';

const getTool = () => new URLSearchParams(window.location.search).get('tool');

const App = () => {
  const stepList = getStepList(getTool());

  const [fileList] = useState(
    mockFileList.map((url, i) => ({ id: i + 1, url, result: getMockResult(getTool()) })),
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
