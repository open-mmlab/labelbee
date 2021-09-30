import React from 'react';
import AnnotationOperation from '@sensetime/label-bee';
import '@sensetime/label-bee/dist/index.css';

const Annotation = (props) => {
  const { fileList, goBack, stepList, step } = props;

  // const exportData = (data) => {
  //   console.log('exportData', data);
  // };

  const onSubmit = (data) => {
    // 翻页时触发当前页面数据的输出
    console.log('submitData', data);
  }

  const onSave = (data, imgList, index) => {
    console.log('save', data, imgList, index);
  }

  return (
    <div>
      <AnnotationOperation
        // exportData={exportData}
        headerName="测试各类工具"
        onSubmit={onSubmit}
        imgList={fileList}
        goBack={goBack}
        stepList={stepList}
        step={step}
        onSave={onSave}
        // sider={null}
      />
    </div>
  );
};
export default Annotation;
