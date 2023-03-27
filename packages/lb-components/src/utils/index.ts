import _ from 'lodash';
import StepUtils from './StepUtils';

export const jsonParser = (content: any, defaultValue: any = {}) => {
  try {
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return _.isObject(content) ? content : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const getNewNode = <T>(newNode: T, oldNode: T): T => {
  return newNode || _.isNull(newNode) ? newNode : oldNode;
};

export const classnames = (className: { [key: string]: boolean } | (string | undefined)[]) => {
  if (Array.isArray(className)) {
    return className.filter((i) => i).join(' ');
  }

  if (_.isObject(className)) {
    const classArray: string[] = [];
    Object.keys(className).forEach((key) => {
      if (className[key]) {
        classArray.push(key);
      }
    });

    return classArray.join(' ');
  }

  return '';
};

export { StepUtils };
