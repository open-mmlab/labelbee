import { uuid } from '@labelbee/lb-annotation';
import { jsonParser } from '.';
import { EToolName } from '@/data/enums/ToolType';
import _ from 'lodash';
import StepUtils from './StepUtils';
import { IStepInfo } from '@/types/step';
import { IMappingImg } from '@/types/data';
import { message } from 'antd';
import { i18n } from '@labelbee/lb-utils';

interface ICopyResultChangeParams {
  copyResult: string;
  step: number;
  currentResult: string;
  mappingImgList: IMappingImg[];
  preMappingImgList: IMappingImg[];
}

interface IGetNextPath {
  prePath: string;
  preMappingImgList: IMappingImg[];
  nextMappingImgList: IMappingImg[];
}

interface ICopyResultItemHandlerParams {
  item: any;
  key?: string | number;
  parent: any;
  mappingImgList: IMappingImg[];
  preMappingImgList: IMappingImg[];
}

export default class AnnotationDataUtils {
  /**
   * Performs a depth-first traversal of an object or array, executing a callback function on each element.
   *
   * @param {any} objOrArr - The object or array to be traversed.
   * @param {Function} callback - The callback function to be executed on each element.
   *                               The callback function takes three parameters: element, key, and parent.
   * @param {string | number} [key] - The key or index of the current element in its parent (optional).
   * @param {any} [parent] - The parent of the current element (optional).
   */
  public static traverseDF(
    objOrArr: any,
    callback: (element: any, key?: string | number, parent?: any) => void,
    key?: string | number,
    parent?: any,
  ) {
    callback(objOrArr, key, parent);
    if (typeof objOrArr === 'object' && objOrArr !== null) {
      if (Array.isArray(objOrArr)) {
        objOrArr.forEach((item, index) => {
          this.traverseDF(item, callback, index, objOrArr);
        });
      } else {
        Object.keys(objOrArr).forEach((key) => {
          this.traverseDF(objOrArr[key], callback, key, objOrArr);
        });
      }
    }
  }

  /**
   * Calculates the next path based on the provided parameters.
   *
   * @param {IGetNextPath} params - The object containing necessary information.
   * @param {string} params.prePath - The current path.
   * @param {IImgList} params.preMappingImgList - The list of current mapping images.
   * @param {IImgList} params.nextMappingImgList - The list of next mapping images.
   * @returns {string} The next path, returns an empty string if not found.
   */
  public static getNextPath(params: IGetNextPath) {
    const { prePath, preMappingImgList, nextMappingImgList } = params;

    const calName = preMappingImgList?.find((item) => item.path === prePath)?.calib?.calName;

    const nextPath = nextMappingImgList.find((img) => img.calib?.calName === calName)?.path;

    return nextPath;
  }
  /**
   * Handles the processing of individual items during the traversal of results or resultRect.
   * This function updates specific properties of the parent object based on the key of the current item.
   *
   * @param {ICopyResultItemHandlerParams} params - Parameters containing the current item, its key, parent object, and image lists.
   * @param {ICopyResultItemHandlerParams.item} item - The current item being processed.
   * @param {ICopyResultItemHandlerParams.key} key - The key associated with the current item.
   * @param {ICopyResultItemHandlerParams.parent} parent - The parent object of the current item.
   * @param {ICopyResultItemHandlerParams.mappingImgList} mappingImgList - The list of images for mapping.
   * @param {ICopyResultItemHandlerParams.preMappingImgList} preMappingImgList - The list of images before mapping.
   */
  public static copyResultItemHandler(params: ICopyResultItemHandlerParams) {
    const { item, key, parent, mappingImgList, preMappingImgList } = params;

    // Get the pre-processing value
    const oldValue = key ===  undefined ? undefined : parent[key]

    if (key === 'id') {
      parent.id = uuid(8, 62);
    }
    if (key === 'imageName') {
      parent.imageName = this.getNextPath({
        prePath: item,
        preMappingImgList,
        nextMappingImgList: mappingImgList,
      });
    }

    // Get the pos-processing value
    const value = key ===  undefined ? undefined : parent[key]

    return {
      value,
      oldValue
    }
  }

  /**
   * 复制上一张图片结果
   * @param copyResult 复制的结果
   * @param step 复制的步骤
   * @param currentResult 当前的步骤
   * @returns
   */
  public static copyResultChange(params: ICopyResultChangeParams) {
    const { copyResult, step, currentResult, mappingImgList, preMappingImgList } = params;
    // 其实其限定的范围一般都在单图的情况
    try {
      const copyData = jsonParser(copyResult);
      const currentData = jsonParser(currentResult);
      const stepName = `step_${step}`;
      if (copyData[stepName]) {
        // 这层可能还要处理 dataSource 依赖问题
        const info = copyData[stepName];
        // need copy fields
        const fields = ['result', 'resultRect'];

        // 新老id的映射
        const resultIdMapping = new Map<string, string>()
        const enqueueResultIdMapping = (newValue?: string, oldValue?: string) => {
          // Ignore the invalid value
          if (newValue === undefined || oldValue === undefined) {
            console.warn('invalid id')
            return
          }

          resultIdMapping.set(oldValue, newValue)
        }

        // 数据处理
        fields.forEach((field) => {
          if (info[field]) {
            this.traverseDF(info[field], (item: any, key?: string | number, parent?: any) => {
              const { value: newValue, oldValue } = this.copyResultItemHandler({
                item,
                key,
                parent,
                mappingImgList,
                preMappingImgList,
              });

              // FIXME 目前result是一维简单对象数组，后续复杂对象数组项需要考虑先辈key
              if (field === 'result' && key === 'id') {
                if (newValue !== undefined && oldValue !== undefined) {
                  resultIdMapping.set(oldValue, newValue)
                }
              }
            });
          }
        });

        /**
         * 更新resultRect里面的 extId 值，以便同步前面result的数据处理
         *
         * @description extId用于识别来源哪个result项
         */
        if (resultIdMapping.size) {
          const resultRect = info['resultRect']
          if (Array.isArray(resultRect)) {
            resultRect.forEach(item => {
              const extId = item.extId
              const newExtId = resultIdMapping.get(extId)
              if (extId !== undefined && newExtId !== undefined) {
                item.extId = newExtId
              }
            })
          }
        }
        
        const needFilterFields = ['resultRect', 'rects'];

        const errorValues: any[] = [];

        this.traverseDF(info, (item: any, key?: string | number, parent?: any) => {
          if (_.isString(key) && needFilterFields.includes(key) && Array.isArray(item)) {
            parent[key] = item.filter((i: any) => {
              if (i.imageName) {
                return true;
              }

              errorValues.push(i);

              return false;
            });
          }
        });

        if (errorValues.length) {
          console.warn(errorValues);
          message.info(i18n.t('PartialResultsReplicationFailure'));
        }

        currentData[stepName] = info;
        return JSON.stringify(currentData);
      }
      return copyResult;
    } catch {
      /**
       * Note: This function should not return `copyResult`, as this will cause duplicate ID issues with the previous image.
       * Additionally, `imageName` will also cause errors because it is based on the previous image's address and cannot be correctly displayed on the current page.
       */
      message.info(i18n.t('FailedToCopyResults'));
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

  /**
   * 修正数据，找到被删除的数据，并将依赖该数据的结果全部删除
   * @param newResStr 新提交的数据
   * @param oldResStr 当前的数据
   * @param step 当前操作的步骤
   * @param stepList 步骤列表
   */
  public static dataCorrection(
    newResStr: string,
    oldResStr: string,
    step: number,
    stepList: IStepInfo[],
  ) {
    try {
      const curStep = StepUtils.getStepInfo(step, stepList);
      const stepKey = `step_${curStep.step}`;
      const newRes = jsonParser(newResStr);
      const oldRes = jsonParser(oldResStr);
      const newResForCurStep = newRes[stepKey]?.result;
      const oldResForCurStep = oldRes[stepKey]?.result;

      /** 没有旧数据时不处理 */
      if (!oldResForCurStep) {
        return newResStr;
      }

      if (_.isEqual(newResForCurStep.sort(this.idCmp), oldResForCurStep.sort(this.idCmp))) {
        return newResStr;
      }

      const deletedIds = this.findDeletedIds(newResForCurStep, oldResForCurStep);

      if (deletedIds.length === 0) {
        return newResStr;
      }

      const dataSourceStep = step;
      const stepKeys = this.getStepKeys(newRes).sort();
      this.deleteRes(newRes, dataSourceStep, deletedIds, stepKeys);

      return JSON.stringify(newRes);
    } catch (error) {
      console.error(error);
      return newResStr;
    }
  }

  /**
   * id sort 规则
   * @param a
   * @param b
   * @returns
   */
  public static idCmp(a: any, b: any) {
    const idA = a.id;
    const idB = b.id;
    if (idA < idB) {
      return -1;
    }
    if (idA > idB) {
      return 1;
    }

    return 0;
  }

  /**
   * 找到结果被删除的id
   * @param newResForCurStep
   * @param oldResForCurStep
   * @returns {Array<string>}
   */
  public static findDeletedIds(newResForCurStep: any[], oldResForCurStep: any[]) {
    return this.findDeletedItems(oldResForCurStep, newResForCurStep).map((i) => i.id);
  }

  /**
   * 找到被删除的结果
   * @param oldResForCurStep
   * @param newResForCurStep
   * @returns {Array<any>}
   */
  public static findDeletedItems(oldResForCurStep: any[], newResForCurStep: any[]) {
    const deletedItems: any[] = [];
    oldResForCurStep.forEach((i: any) => {
      const isNewResExisted = newResForCurStep.some((r: any) => r.id === i.id);
      if (!isNewResExisted) {
        deletedItems.push(i);
      }
    });
    return deletedItems;
  }

  /**
   * 根据结果找到所有的步骤
   * @param res
   * @returns {Array<number>} 结果步骤列表
   */
  public static getStepKeys(res: any) {
    return Object.keys(res)
      .map((i) => parseInt(i.replace('step_', ''), 10))
      .filter((i) => !isNaN(i));
  }

  /**
   * 删除依赖数据的结果
   * @param resData 当前文件的结果
   * @param dataSourceStep 依赖步骤
   * @param deletedIds 需要删除的sourceID
   * @param stepKeys 结果的步骤
   */
  public static deleteRes(
    resData: any,
    dataSourceStep: number,
    deletedIds: string[],
    stepKeys: number[],
  ) {
    stepKeys.forEach((s) => {
      if (s > dataSourceStep) {
        const stepRes = resData[`step_${s}`];
        // 文件夹标签, 分割工具 没有依赖, 不进行判断
        if ([EToolName.FolderTag, EToolName.Segmentation].includes(stepRes.tool)) {
          return;
        }
        if (stepRes.dataSourceStep === dataSourceStep) {
          const newDeletedIds: string[] = [];
          stepRes.result = stepRes.result.filter((i: any) => {
            const exist = deletedIds.includes(i.sourceID);
            if (exist) {
              newDeletedIds.push(i.id);
              return false;
            }

            return true;
          });
          this.deleteRes(resData, s, newDeletedIds, stepKeys);
        } else {
          // 非直接依赖关系下，也同样过滤删除了对应框的数据（注意: 该场景不包含 filterData 过滤属性下，更改框的属性来删除对应的框体）
          stepRes.result = stepRes.result.filter((i: any) => {
            const exist = deletedIds.includes(i.sourceID);
            if (exist) {
              return false;
            }

            return true;
          });
        }
      }
    });
  }
}
