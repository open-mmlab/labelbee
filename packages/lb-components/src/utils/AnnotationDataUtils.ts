import { uuid } from '@sensetime/annotation';
import { jsonParser } from '.';
import { EToolName } from '@/data/enums/ToolType';
import _ from 'lodash';

export default class AnnotationDataUtils {
  /**
   * 复制上一张图片结果
   * @param copyResult 复制的结果
   * @param step 复制的步骤
   * @param currentResult 当前的步骤
   * @returns
   */
  public static copyResultChange(copyResult: string, step: number, currentResult: string) {
    // 其实其限定的范围一般都在单图的情况
    try {
      const copyData = jsonParser(copyResult);
      const currentData = jsonParser(currentResult);
      const stepName = `step_${step}`;
      if (copyData[stepName]) {
        // 这层可能还要处理 dataSource 依赖问题
        const info = copyData[stepName];
        if (info.result) {
          info.result = info.result.map((info: any) => ({
            ...info,
            // @ts-ignore
            id: uuid(8, 62),
          }));
          currentData[stepName] = info;
          return JSON.stringify(currentData);
        }
      }
      return copyResult;
    } catch {
      return copyResult;
    }
  }

  /**
   * 判断结果sourceID与依赖数据的id是否能对应
   * @param result
   * @param basicResultList
   */
  public static isResultSourceMatchedDependence(result: any, basicResultList: any[]) {
    const sourceIDForCurStep = result?.map((i: { sourceID: string }) => i.sourceID).sort();
    const sourceIDForDependStep = basicResultList?.map((i) => i.id).sort();

    return _.isEqual(sourceIDForCurStep, sourceIDForDependStep);
  }

  /**
   * 获取依赖增量更新的内容
   * @param result
   * @param basicResultList
   * @returns
   */
  public static deltaUpdateBasicResultList(result: any, basicResultList: any[]) {
    const sourceIDForCurStep = result?.map((i: { sourceID: string }) => i.sourceID).sort();

    return basicResultList.filter((v) => !sourceIDForCurStep.includes(v.id));
  }

  /**
   * 
   * @param stepResult 
   * @param toolInstance 
   * @param stepConfig 
   * @param basicResultList 获取初始化数据 该部分默认输入需要为空数组
   * @param isInitData 
   * @returns 
   */
  public static getInitialResultList(
    stepResult: any[] | undefined,
    toolInstance: any,
    stepConfig: any,
    basicResultList: any[],
    isInitData: boolean,
  ) {
    const resultList = stepResult ?? [];

    switch (stepConfig.tool) {
      case EToolName.Tag:
      case EToolName.Text: {

        /**
         * 在依赖的情况下，检查的是否需要增量更新前面新增的结果
         */
        if (stepConfig.dataSourceStep > 0) {
          const deltaResultList = this.deltaUpdateBasicResultList(resultList, basicResultList);
          if (deltaResultList.length > 0) {
            return resultList.concat(
              toolInstance.getInitResultList(stepConfig.dataSourceStep, deltaResultList),
            );
          }
        }

        if (isInitData !== true) {
          return resultList;
        }

        return toolInstance.getInitResultList(stepConfig.dataSourceStep, basicResultList);
      }

      default: {
        return resultList;
      }
    }
  }
}
