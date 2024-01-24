/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-08 21:17:07
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-13 19:34:53
 */
import { AnnotationView, PointCloudAnnotationView } from '@labelbee/lb-components';
import StepUtils from '@labelbee/lb-components/dist/utils/StepUtils';
import 'antd/dist/antd.css';
import qs from 'qs';
import React, { useState } from 'react';
import './App.css';
import Annotation from './components/Annotation';
import { DEFAULT_ANNOTATIONS, generateRandomColor } from './mock';
import {
  fileList as mockFileList,
  getMockResult,
  pointCloudList,
  pointCloudMappingImgList,
  videoList,
  mockAudioList,
} from './mock/index';
import { getDependStepList, getStepList } from './mock/taskConfig';
import car1 from './mock/cuboidImages/1.png';
import { EToolName } from '@labelbee/lb-annotation';
import { LLMToolQa, LLMToolResult } from './mock/LLMTool';
import { textData, NLPToolResult } from './mock/NLPTool';

const App = () => {
  const tool = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
    comma: true,
  }).tool;

  console.log(tool)

  const isSingleTool = !Array.isArray(tool);
  const stepList = isSingleTool ? getStepList(tool) : getDependStepList(tool);
  const currentIsVideo = StepUtils.currentToolIsVideo(1, stepList);
  const currentIsPointCloud = StepUtils.currentToolIsPointCloud(1, stepList);
  const currentIsAudio = StepUtils.currentToolIsAudio(1, stepList);
  const getMockList = () => {
    let srcList = mockFileList;

    const extraData = {};

    if (currentIsVideo) {
      srcList = videoList;
    }

    if (currentIsAudio) {
      return mockAudioList;
    }

    if (currentIsPointCloud) {
      srcList = pointCloudList;
      Object.assign(extraData, {
        mappingImgList: pointCloudMappingImgList,
      });
    }

    if (EToolName.LLM === tool) {
      return srcList.map((url, i) => ({
        ...extraData,
        id: i + 1,
        url,
        result: JSON.stringify(LLMToolResult.step_1.result.map((item) => i + 1 + item.answer)),
        questionList: {
          ...LLMToolQa,
          question: `${i + 1}-${LLMToolQa.question}`,
          answerList: LLMToolQa.answerList.map((list) => ({
            ...list,
            answer: i + 1 + list.answer,
          })),
        },
      }));
    }

    if (EToolName.NLP === tool) {
      return srcList.map((url, i) => ({
        ...extraData,
        id: i + 1,
        url,
        result: JSON.stringify(NLPToolResult.step_1.result),
        textData,
      }));
    }

    return srcList.map((url, i) => ({
      ...extraData,
      id: i + 1,
      url,
      result: isSingleTool ? getMockResult(tool) : '',
      questionList: LLMToolQa,
    }));
  };

  const [fileList] = useState(getMockList());
  const [data, setData] = useState(DEFAULT_ANNOTATIONS);

  const onChange = (type, ids) => {
    if (type === 'hover') {
      setData((pre) => {
        return pre.map((item) => {
          if (item.annotation && item.annotation.id === 'g5r2l7mcrv8') {
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

  const handler = () => {
    const color = generateRandomColor();
    setData((pre) => {
      return pre.map((item) => {
        if (item.type === 'pixelPoints') {
          const { annotation } = item;
          return {
            ...item,
            annotation: annotation.map((point) => {
              return {
                ...point,
                color,
              };
            }),
          };
        }
        return item;
      });
    });
  };

  // 参看工具的展示
  if (tool === 'annotationView') {
    return (
      <div>
        <div
          style={{
            height: 1000,
          }}
        >
          {/* 暂时隐藏 */}
          <div style={{ display: 'none' }} onClick={handler}>
            Change Color
          </div>
          <AnnotationView
            src={car1}
            annotations={data}
            style={{
              stroke: 'blue',
              thickness: 3,
            }}
            size={{
              width: 1280,
              height: 720,
            }}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  if (tool === 'PointCloudAnnotationView') {
    return (
      <PointCloudAnnotationView
        src={pointCloudList[0]}
        size={{
          height: 1080,
          width: 1000,
        }}
        // result={'{}'}
        // result={pointCloudResult1}
      />
    );
  }

  const goBack = (data) => {
    console.log('goBack', data);
  };

  if (fileList.length > 0) {
    return <Annotation fileList={fileList} goBack={goBack} stepList={stepList} step={1} />;
  }

  return <div className='App'> </div>;
};

export default App;
