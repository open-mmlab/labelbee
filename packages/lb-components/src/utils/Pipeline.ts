import { CommonToolUtils, EToolName } from '@labelbee/lb-annotation';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';

/**
 * 获取当前步骤下的依赖情况，用于依赖框体的展示
 *
 *
 * @export
 * @param {number} currentStep 正常标注的步骤！（如果是质检则需要转换成正常标注步骤）
 * @param {number} dataSourceStep 正常标注依赖的步骤
 * @param {IStepInfo[]} stepList 步骤信息
 * @param {*} result 当前图片的所有结果
 * @param {boolean} [filterNeeded=true]
 * @param {boolean} [forbidFilter=false]
 * @returns
 */
export function getBasicResult(
  currentStep: number,
  dataSourceStepParam: number,
  stepList: IStepInfo[],
  resultParam: any,
  filterNeeded = true,
  preResult = '{}',
  forbidFilter = false,
) {
  let result = resultParam;
  let dataSourceStep = dataSourceStepParam;

  const currentStepInfo = CommonToolUtils.getCurrentStepInfo(currentStep, stepList);
  let dataSourceStepInfo = CommonToolUtils.getCurrentStepInfo(dataSourceStep, stepList);

  if (currentStepInfo?.preDataSourceStep > 0) {
    if (typeof preResult === 'string') {
      result = jsonParser(preResult);
    } else {
      result = preResult;
    }

    dataSourceStep = currentStepInfo?.preDataSourceStep;
    dataSourceStepInfo = {
      tool: result[`step_${currentStepInfo?.preDataSourceStep}`]?.toolName,
      step: 1,
    };
  }

  if (!result[`step_${dataSourceStep}`] || !result[`step_${dataSourceStep}`].result) {
    return [];
  }
  const sourceData = result[`step_${dataSourceStep}`].result;

  if (!dataSourceStepInfo && currentStepInfo?.preDataSourceStep <= 0) {
    return [];
  }
  try {
    const currentStepInfoConfig = jsonParser(currentStepInfo.config);
    // 如果为非框型工具就需要递归下去
    const filterData = filterDataAdaptor(currentStepInfoConfig.filterData, dataSourceStepInfo);
    if (!filterData && filterNeeded) {
      return [];
    }

    if (dataSourceStepInfo.tool === EToolName.Tag) {
      // 过滤标签工具的数据
      if (
        dataSourceStepInfo.dataSourceStep === 0 &&
        (!dataSourceStepInfo?.preDataSourceStep || dataSourceStepInfo?.preDataSourceStep === 0)
      ) {
        return [];
      }

      // 过滤出当前符合标准的标签数据
      const newData = filterTagResult(sourceData, filterData, forbidFilter);
      const sourceIDList = newData.map((v) => ({ id: v.id, sourceID: v.sourceID }));
      return getSourceData(
        dataSourceStepInfo.step,
        dataSourceStepInfo.dataSourceStep,
        stepList,
        result,
        sourceIDList,
        preResult,
      );
    } else if (
      [
        EToolName.Rect,
        EToolName.RectTrack,
        EToolName.Polygon,
        EToolName.Point,
        EToolName.Line,
      ].includes(dataSourceStepInfo.tool)
    ) {
      return useConfigFilterData(currentStep, stepList, sourceData, forbidFilter);
    } else if (dataSourceStepInfo.tool === EToolName.Filter) {
      // 过滤筛选工具的数据
      if (
        dataSourceStepInfo.dataSourceStep === 0 &&
        (!dataSourceStepInfo?.preDataSourceStep || dataSourceStepInfo?.preDataSourceStep === 0)
      ) {
        return [];
      }
      // 过滤出当前符合标准的标签数据
      const newData = sourceData.filter(
        (v: any) => filterData.indexOf(v.filterLabel) > -1 || forbidFilter,
      );
      const sourceIDList = newData.map((v: any) => ({ id: v.id, sourceID: v.sourceID }));
      return getSourceData(
        dataSourceStepInfo.step,
        dataSourceStepInfo.dataSourceStep,
        stepList,
        result,
        sourceIDList,
        preResult,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

export const DEFAULT_LINK = '@@';
const DEFAULT_TOOL_ATTRIBUTE = ['valid', 'invalid'];
/**
 * 将旧版的 filterData 转换为新版的 filterData
 *
 * @export
 * @param {*} oldFilterData
 * @param {IStepInfo} dataSourceStepInfo 注意这个是依赖项的 stepInfo
 * @returns
 */
export function filterDataAdaptor(
  oldFilterData: any,
  dataSourceStepInfo: IStepInfo,
): string[] {
  const config = jsonParser(dataSourceStepInfo?.config);

  if (oldFilterData?.constructor === Object) {
    // 说明为旧数据
    const keyList = Object.keys(oldFilterData).reduce((acc: any[], cur: string) => {
      if (Array.isArray(oldFilterData[cur])) {
        // 在旧格式中仅为 标签工具
        return [...acc, ...oldFilterData[cur].map((v: any) => `${cur}${DEFAULT_LINK}${v}`)];
      }

      // 对之前旧的图形工具的适配
      if (
        DEFAULT_TOOL_ATTRIBUTE.includes(cur) &&
        oldFilterData[cur] === true &&
        judgeIsAttribute(config)
      ) {
        return [
          ...acc,
          `${cur}${DEFAULT_LINK}`, // 无属性
          ...config.attributeList.reduce((a: any, v: any) => {
            return [...a, `${cur}${DEFAULT_LINK}${v?.value}`];
          }, []),
        ];
      }

      return [...acc, cur];
    }, []);

    return keyList;
  }

  return oldFilterData;
}

/**
 * 判断是否是按属性进行标注
 *
 * @export
 * @param {*} config
 * @returns
 */
export function judgeIsAttribute(config: any) {
  return (
    config?.attributeConfigurable && config?.attributeList && config?.attributeList?.length > 0
  );
}

/**
 * 过滤标签结果
 * @param sourceData
 * @param filterData
 * @param forbidFilter
 */
export function filterTagResult(
  sourceData: any[],
  filterData: string[],
  forbidFilter?: boolean,
) {
  const tagInputList = transformFilterDataToObject(filterData);

  return sourceData.filter((data) => {
    if (forbidFilter === true) {
      return true;
    }

    for (const i of Object.keys(data.result)) {
      // 注意，标签工具的结果是 是一个对象

      if (tagInputList.hasOwnProperty(i)) {
        const dataList = data.result[i].split(';');
        for (const d of dataList) {
          if (tagInputList[i].indexOf(d) > -1) {
            return true;
          }
        }
      }
    }
    return false;
  });
}

/**
 * 将 filterData 转换为 Object 形式，便于判断
 *
 * @export
 * @param {FilterDataState} filterData
 * @returns
 */

export function transformFilterDataToObject(filterData: string[]): any {
  return filterData.reduce((acc: { [key: string]: any }, cur) => {
    const [key, value] = cur.split(DEFAULT_LINK);

    if (typeof value === 'undefined') {
      // 表示为空，例如： ['valid', 'invalid']
      return {
        ...acc,
        [key]: [],
      };
    }

    if (acc.hasOwnProperty(key)) {
      return {
        ...acc,
        [key]: [...acc[key], value],
      };
    } else {
      return {
        ...acc,
        [key]: [value],
      };
    }
  }, {});
}

/**
 * 根据 config 过滤当前数据
 *
 * 注意： 该函数目前仅适用于图形类的步骤进行过滤
 *
 * @export
 * @param {number} currentStep
 * @param {IStepInfo[]} stepList
 * @param {any[]} basicData
 * @returns
 */
export function useConfigFilterData(
  currentStep: number,
  stepList: IStepInfo[],
  basicData: any[],
  forbidFilter = false,
) {
  const currentStepInfo = CommonToolUtils.getStepInfo(currentStep, stepList);
  const dataSourceStepInfo = CommonToolUtils.getCurrentStepInfo(currentStepInfo.dataSourceStep, stepList);
  let res = basicData;
  if (currentStepInfo.config) {
    const config = jsonParser(currentStepInfo.config);
    if (config.filterData) {
      const filterData = filterDataAdaptor(config.filterData, dataSourceStepInfo);

      const filterDataObject = transformFilterDataToObject(filterData);

      res = basicData.filter((v) => {
        if (forbidFilter === true) {
          return true;
        }

        if (filterData.some((v) => v === 'valid') || filterData.some((v) => v === 'invalid')) {
          // 说明为图形统一管理
          if (filterData.some((v) => v === 'valid') && v?.valid === true) {
            // 说明是原始的图形的过滤
            return true;
          }

          if (filterData.some((v) => v === 'invalid') && v?.valid === false) {
            // 说明是原始的图形的过滤
            return true;
          }

          return false;
        }
        // 含有属性的数据过滤
        if (judgeIsAttribute(jsonParser(dataSourceStepInfo.config))) {
          if (v?.valid === true) {
            return filterDataObject?.valid?.includes(v?.attribute ?? '');
          } else {
            return filterDataObject?.invalid?.includes(v?.attribute ?? '');
          }
        }

        return false;
      });
    }
  }
  return res;
}

/**
 * 过滤出指定步骤中的指定依赖框出来
 * @param currentStep
 * @param dataSourceStep
 * @param stepList
 * @param result
 * @param sourceIDList
 * @param preResult
 */
export function getSourceData(
  currentStep: number,
  dataSourceStep: number,
  stepList: IStepInfo[],
  result: any,
  sourceIDList: any[],
  preResult = '{}',
): any {
  const currentStepInfo = CommonToolUtils.getCurrentStepInfo(currentStep, stepList);

  if (currentStepInfo?.preDataSourceStep > 0) {
    // 说明该步骤依赖的是预标注数据
    const stepName = `step_${currentStepInfo?.preDataSourceStep}`;
    const result = jsonParser(preResult)[stepName]?.result;

    if (result) {
      return (
        result?.filter((v: any) => {
          for (const i of sourceIDList) {
            if (i?.sourceID === v.id) {
              return true;
            }
          }
          return false;
        }) ?? []
      );
    }
  }

  if (currentStep === 0 || !result[`step_${dataSourceStep}`]?.result) {
    return [];
  }
  const dataSourceStepInfo = CommonToolUtils.getCurrentStepInfo(dataSourceStep, stepList);
  if (!dataSourceStepInfo) {
    return [];
  }

  const sourceData = result[`step_${dataSourceStep}`].result;
  let resultList = [];
  resultList = sourceData.filter((v: any) => {
    for (const i of sourceIDList) {
      if (i?.sourceID === v.id) {
        return true;
      }
    }
    return false;
  });

  if (dataSourceStepInfo.tool === EToolName.Tag || dataSourceStepInfo.tool === EToolName.Filter) {
    // 如果 dataSource 工具还是为标签的话，就继续递归，找到为止
    return getSourceData(
      dataSourceStepInfo.step,
      dataSourceStepInfo.dataSourceStep,
      stepList,
      result,
      sourceIDList, // 注意： 其实比较怀疑这边是否能正确使用，表示怀疑 - 后续需要关注 todo
      preResult,
    );
  } else if (
    [EToolName.Rect, EToolName.RectTrack, EToolName.Polygon].includes(dataSourceStepInfo.tool)
  ) {
    return resultList;
  }

  return resultList;
}
