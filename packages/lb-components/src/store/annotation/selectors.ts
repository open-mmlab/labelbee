import { jsonParser } from '@/utils';
import { getStepConfig } from './reducer';
import { AnnotationState } from './types';

/**
 * select current step config
 */
export const stepConfigSelector = ({ annotation }: { annotation: AnnotationState }) => {
  const { stepList, step } = annotation;
  return jsonParser(getStepConfig(stepList, step)?.config);
};
