import { MutableRefObject } from 'react';
import { prefix } from '@/constant';

export type BasicTarget<T = HTMLElement> =
  | (() => T | null)
  | T
  | null
  | MutableRefObject<T | null | undefined>;

type TargetElement = HTMLElement | Element | Document | Window;

export function getTargetElement(
  target?: BasicTarget<TargetElement>,
  defaultElement?: TargetElement,
): TargetElement | undefined | null {
  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetElement | undefined | null;

  if (typeof target === 'function') {
    // TODO. Maybe the new version of typescript is not allowed.
    // @ts-ignore
    targetElement = target();
  } else if ('current' in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}

/**
 * Get class like BEM
 * @param elm
 * @param modify
 */
export const getClassName = (block: string, elm?: string, modify?: string) =>
  `${prefix}-${block}${elm ? '__' + elm : ''}${modify ? '__' + modify : ''}`;
