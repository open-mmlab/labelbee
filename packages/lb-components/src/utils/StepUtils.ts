import { EStepType } from '@/constant';
import { IStepInfo } from '@/types/step';
import ToolUtils from './ToolUtils';

export default class StepUtils {
  /**
   * 获取当前步骤的步骤配置信息，用于当前标注配置的获取
   * @export
   * @param {number} currentStep
   * @param {IStepInfo[]} stepList
   * @returns {*}
   */
  public static getCurrentStepInfo(currentStep: number, stepList: IStepInfo[]) {
    const currentStepInfo = this.getStepInfo(currentStep, stepList);

    const useDataSourceStep = [EStepType.QUALITY_INSPECTION, EStepType.MANUAL_CORRECTION].includes(
      currentStepInfo?.type,
    );

    /** 人工修正、质检获取 dataSourceStep 作为步骤配置 */
    if (useDataSourceStep) {
      return this.getStepInfo(currentStepInfo.dataSourceStep, stepList);
    }

    return currentStepInfo;
  }

  /**
   * 找到指定步骤的数据
   * @param step 获取的步骤
   * @param stepList 步骤列表
   * @returns 步骤配置
   */
  public static getStepInfo(step: number, stepList: IStepInfo[]) {
    return stepList?.filter((info) => info.step === step)[0];
  }

  /**
   * 根据toolName判断当前步骤是否为视频工具
   * @param step 步骤
   * @param stepList 步骤列表
   * @returns {Number} 是否为视频工具
   */
  public static currentToolIsVideo(step: number, stepList: IStepInfo[]) {
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    return ToolUtils.isVideoTool(currentStepInfo?.tool);
  }


  /**
   * Check for PointCloud
   * @param step 
   * @param stepList 
   * @returns 
   */
  public static currentToolIsPointCloud(step: number, stepList: IStepInfo[]) {
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    return ToolUtils.isPointCloudTool(currentStepInfo?.tool);
  }
}
