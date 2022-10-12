/**
 * @file Collection of matrix operations
 * @createDate 2022-08-15
 * @author Ron <ron.f.luo@gmail.com>
 */
import { TMatrix4Tuple, TMatrix14Tuple, TMatrix13Tuple } from './types/pointCloud';

const flat = (acc: number[], cur: number[]) => {
  return [...acc, ...cur];
};

class MatrixUtils {
  public static transferMatrix34FromKitti2Three(
    matrix34Kitti: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple],
  ): TMatrix4Tuple {
    return [...matrix34Kitti.reduce(flat, []), 0, 0, 0, 1] as TMatrix4Tuple;
  }

  public static transferMatrix33FromKitti2Three(
    matrix33Kitti: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple],
  ): TMatrix4Tuple {
    return [
      ...matrix33Kitti.reduce((acc: number[], cur: number[]) => {
        const newList = [...acc, ...cur].concat([0]);
        return newList;
      }, []),
      0,
      0,
      0,
      1,
    ] as TMatrix4Tuple;
  }
}

export default MatrixUtils;
