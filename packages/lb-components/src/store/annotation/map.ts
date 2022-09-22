/**
 * @file MapStateToProps set
 * @createdate 2022-07-19
 * @author Ron <ron.f.luo@gmail.com>
 */
import { AppState } from '../index';
import { IFileItem } from '@/types/data';

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
