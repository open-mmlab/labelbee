import { CommonToolUtils, EToolName } from '@labelbee/lb-annotation';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';

/**
 * Retrieve the dependencies for the current step to be used in displaying the dependency framework
 *
 *
 * @export
 * @param {number} currentStep current annotation step（needs to be converted into normal annotation steps if in quality inspection case）
 * @param {number} dataSourceStep step of datasource
 * @param {IStepInfo[]} stepList
 * @param {*} result all results for the current image
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
    // Recursion is needed if it is a non-box tool
    const filterData = filterDataAdaptor(currentStepInfoConfig.filterData, dataSourceStepInfo);
    if (!filterData && filterNeeded) {
      return [];
    }

    if (dataSourceStepInfo.tool === EToolName.Tag) {
      // Filtering the data from the tagging tool
      if (
        dataSourceStepInfo.dataSourceStep === 0 &&
        (!dataSourceStepInfo?.preDataSourceStep || dataSourceStepInfo?.preDataSourceStep === 0)
      ) {
        return [];
      }

      // Filter out the current tags data that meets the criteria
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
      // Filtering the data from the selection tool
      if (
        dataSourceStepInfo.dataSourceStep === 0 &&
        (!dataSourceStepInfo?.preDataSourceStep || dataSourceStepInfo?.preDataSourceStep === 0)
      ) {
        return [];
      }
      // Filter out the current tags data that meets the criteria
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
 * turn filterData into new filterData
 *
 * @export
 * @param {*} oldFilterData
 * @param {IStepInfo} dataSourceStepInfo attention: this is stepInfo of data source
 * @returns
 */
export function filterDataAdaptor(
  oldFilterData: any,
  dataSourceStepInfo: IStepInfo,
): string[] {
  const config = jsonParser(dataSourceStepInfo?.config);

  if (oldFilterData?.constructor === Object) {
    // means old data
    const keyList = Object.keys(oldFilterData).reduce((acc: any[], cur: string) => {
      if (Array.isArray(oldFilterData[cur])) {
        // In the old format, it only consists of the tagging tool
        return [...acc, ...oldFilterData[cur].map((v: any) => `${cur}${DEFAULT_LINK}${v}`)];
      }

      // Adaptation for the previous old image tools
      if (
        DEFAULT_TOOL_ATTRIBUTE.includes(cur) &&
        oldFilterData[cur] === true &&
        judgeIsAttribute(config)
      ) {
        return [
          ...acc,
          `${cur}${DEFAULT_LINK}`, // no attribute
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
 * Determine whether the annotation is based on attributes
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
 * Filtering tag results
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
      // Note that the result of the tagging tool is an object

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
 * turn filterData into Object format，making it easy to determine
 *
 * @export
 * @param {FilterDataState} filterData
 * @returns
 */

export function transformFilterDataToObject(filterData: string[]): any {
  return filterData.reduce((acc: { [key: string]: any }, cur) => {
    const [key, value] = cur.split(DEFAULT_LINK);

    if (typeof value === 'undefined') {
      // means empty, like： ['valid', 'invalid']
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
 * Filtering current data by config
 *
 * Note: This function is currently only applicable for filtering steps related to graphical elements.
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
          // This means centralized management of graphical elements
          if (filterData.some((v) => v === 'valid') && v?.valid === true) {
            // This indicates filtering based on original graphical elements
            return true;
          }

          if (filterData.some((v) => v === 'invalid') && v?.valid === false) {
            // This indicates filtering based on original graphical elements
            return true;
          }

          return false;
        }
        // Filtering data containing attributes
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
 * Filter out specified dependency boxes in a specific step
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
    // This indicates that the step relies on pre-annotated data
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
    // If the dataSource tool is still tag tool, continue the recursion
    return getSourceData(
      dataSourceStepInfo.step,
      dataSourceStepInfo.dataSourceStep,
      stepList,
      result,
      sourceIDList, // Note: There is some doubt about whether this part can be used correctly. It indicates skepticism - further attention is needed todo
      preResult,
    );
  } else if (
    [EToolName.Rect, EToolName.RectTrack, EToolName.Polygon].includes(dataSourceStepInfo.tool)
  ) {
    return resultList;
  }

  return resultList;
}
