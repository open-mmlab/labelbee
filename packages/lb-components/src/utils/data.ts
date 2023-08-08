import { EPointCloudName } from '@labelbee/lb-annotation';
import { jsonParser } from '.';
import StepUtils from './StepUtils';
import { IPointCloudBox } from '@labelbee/lb-utils';
import { IStepInfo } from '@/types/step';

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

interface IPreDataProcessParams {
  // 标注类型:暂时只支持点云
  tool: EPointCloudName.PointCloud;
  // 更新数据
  dataList: IPointCloudBox[];
  // 更新数据的具体动作
  action: 'preDataProcess' | 'topViewAddBox' | 'topViewUpdateBox' | 'viewUpdateBox';
  // 用户开启的默认尺寸的属性
  activeAttributes?: string[];
  // 当前步骤的config
  stepConfig?: IStepInfo['config'];
}

export const preDataProcess = (params: IPreDataProcessParams): IPointCloudBox[] => {
  const { action, dataList, stepConfig, tool } = params;

  if (tool !== EPointCloudName.PointCloud) {
    // 暂时只支持点云
    return dataList;
  }

  const newDataList = dataList.map((item) => {
    // TODO:尺寸范围的判断、中心点范围的判断更改有效无效性，和固定尺寸修改width、height、depth在这里实现
    // EXAMPLE:暂时高度小于1.6的框设置为无效
    console.log(
      `在 ${action} 时将 id 为 ${item.id} 的框设置为${item.depth > 1.6 ? '有' : '无'}效，高度为 ${
        item.depth
      }`,
      stepConfig,
    );

    return {
      ...item,
      valid: item.depth > 1.6,
    };
  });

  return newDataList;
};
