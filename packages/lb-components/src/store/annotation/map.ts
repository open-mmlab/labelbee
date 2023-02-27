/**
 * @file MapStateToProps set
 * @createdate 2022-07-19
 * @author Ron <ron.f.luo@gmail.com>
 */
import { AppState } from '../index';
import { IFileItem } from '@/types/data';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';

export const aMapStateToProps = (state: AppState) => {
  const {
    annotation: { imgList, imgIndex },
  } = state;
  const currentData = imgList[imgIndex] ?? {};

  return {
    currentData,
  };
};

export interface IAnnotationStateProps {
  currentData: IFileItem;
}

export interface IA2MapStateProps extends IAnnotationStateProps {
  imgList: IFileItem[];
  stepInfo: IStepInfo;
  config: any;
  imgIndex: number;
  configString: string; // Easy for users to listener.
}

export const a2MapStateToProps = (state: AppState) => {
  const {
    annotation: { imgList, imgIndex },
  } = state;
  const currentData = imgList[imgIndex] ?? {};
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    currentData,
    imgIndex,
    imgList,
    stepInfo,
    config: jsonParser(stepInfo?.config),
    configString: stepInfo?.config,
  };
};
