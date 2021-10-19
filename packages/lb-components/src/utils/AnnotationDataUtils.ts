import { uuid } from '@sensetime/annotation';
import { jsonParser } from '.';
import { EToolName } from '@/data/enums/ToolType';

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
   * 获取初始化数据
   * @param result
   * @param toolInstance
   * @param config
   * @param dependResult
   */
  public static getInitialResult(
    result: [] | undefined,
    toolInstance: any,
    stepConfig: any,
    basicResultList: any[],
  ) {
    if (stepConfig.tool === EToolName.Text && !result) {
      return toolInstance.getInitResultList(stepConfig.dataSourceStep, basicResultList);
    }

    return result || [];
  }
}
