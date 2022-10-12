import { jsonParser } from '.';
import StepUtils from './StepUtils';

/**
 * 解析结果，将图片信息注入到结果
 * @param result
 * @param basicImgInfo
 */
export const composeResultWithBasicImgInfo = (
  result: string,
  basicImgInfo: { [a: string]: any },
) => {
  const newResult = JSON.stringify({ ...jsonParser(result), ...basicImgInfo });
  return newResult;
};

// 处理result
export const composeResult = (
  result: string,
  pos: {
    step: number;
    stepList: any[];
  },
  newData: {
    rect: any[];
    basicRectID?: string;
  },
  customObject: Object,
) => {
  const { step, stepList } = pos;
  const { rect, basicRectID } = newData;

  try {
    const data = jsonParser(result);
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    const { dataSourceStep } = currentStepInfo;

    const stepName = `step_${currentStepInfo.step}`;

    if (data[stepName]) {
      const info = data[stepName];
      Object.assign(info, customObject);

      if (info.result) {
        if (JSON.stringify(info.result) === JSON.stringify(rect)) {
          return JSON.stringify(data);
        }
        if (basicRectID) {
          info.result = [
            ...info.result.filter(
              (v: { sourceID: string }) => !(v.sourceID && v.sourceID === basicRectID),
            ),
            ...rect.filter((v) => v.sourceID && v.sourceID === basicRectID),
          ];
        } else {
          info.result = rect;
        }
        return JSON.stringify(data);
      }
      return JSON.stringify({
        ...data,
        [stepName]: {
          ...data[stepName],
          ...customObject,
          result: rect,
        },
      });
    }
    // 初始化结果
    return JSON.stringify({
      ...data,
      [stepName]: {
        dataSourceStep,
        ...customObject,
        toolName: stepList[step - 1].tool,
        result: rect,
      },
    });
  } catch (e) {
    return result;
  }
};
