import React, { useEffect, useRef } from 'react';
import AnnotationOperation from '@labelbee/lb-components';
import '@labelbee/lb-components/dist/index.css';
// import { DrawUtils } from '@labelbee/lb-annotation';
import { fileList as urlList } from '../../mock';
import { message } from 'antd';

// Type definition.
// type TRunPrediction = (params: {
//   point: ICoordinate;
//   rect: { x: number; y: number; w: number; h: number };
// }) => Promise<unknown>;

const Annotation = (props) => {
  const ref = useRef();
  const { fileList, goBack, stepList, step } = props;

  // const exportData = (data) => {
  //   console.log('exportData', data);
  // };

  useEffect(() => {
    setTimeout(() => {
      if (ref.current?.annotationEngine) {
        const { annotationEngine } = ref.current;
        const firstToolInstance = annotationEngine.firstToolInstance;
        firstToolInstance?.setRunPrediction?.((data) => {
          // data: TRunPrediction
          return new Promise((resolve) => {
            // 模拟异步的操作
            setTimeout(() => {
              // 关键，需要返回成功
              resolve('');
              message.success('Predict successfully');

              // 返回的原来的工具
              annotationEngine.switchLastTwoCanvas();
            }, 1000);
          });
        });
      }
    });
  }, []);

  const onSubmit = (data, type, imgIndex, imgList) => {
    // 翻页时触发当前页面数据的输出
    console.log('submitData', data, type, imgIndex, imgList);
  };

  const onSave = (data, imgList, index) => {
    console.log('save', data, imgList, index);
  };

  const dataInjectionAtCreation = (data) => {
    return {
      testDataInjection: 1,
    };
  };

  // const loadFileList = (page, pageSize) => {
  //   return new Promise((resolve) => {
  //     const fileList = [];
  //     const total = 105;
  //     for (let i = 0; i < pageSize; i++) {
  //       if (page * pageSize + i >= total) {
  //         break;
  //       }
  //       fileList.push({
  //         id: Number(`${page}${i}`),
  //         result: '',
  //         url: urlList[i % urlList.length],
  //       });
  //     }
  //     console.log('loadFileList', fileList);
  //     setTimeout(() => {
  //       resolve({ fileList, total });
  //     }, 500);
  //   });
  // };

  // const renderEnhance = {
  //   staticRender: (canvas, rect, style) => {
  //     DrawUtils.drawRectWithFill(canvas, rect, { color: style.fillColor });
  //   },
  //   selectedRender: (canvas, rect, style) => {
  //     DrawUtils.drawText(canvas, { x: rect.x, y: rect.y - 10 }, 'asdasdsa', { color: style.textColor });
  //     DrawUtils.drawRectWithFill(canvas, rect, { color: 'blue' });
  //   },
  //   creatingRender: (canvas, rect, style) => {
  //     console.log('style3', style);

  //     DrawUtils.drawText(canvas, { x: rect.x, y: rect.y - 10 }, 'asdasdsa', { color: 'red' });
  //     DrawUtils.drawRectWithFill(canvas, rect, { color: 'green' });
  //   },
  // };

  return (
    <div>
      <AnnotationOperation
        // exportData={exportData}
        ref={ref}
        headerName='测试各类工具'
        onSubmit={onSubmit}
        imgList={fileList}
        pageSize={10}
        // loadFileList={loadFileList}
        goBack={goBack}
        stepList={stepList}
        step={step}
        onSave={onSave}
        dataInjectionAtCreation={dataInjectionAtCreation}
        // renderEnhance={renderEnhance}
      />
    </div>
  );
};
export default Annotation;
