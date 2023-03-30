import { IPointUnit } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

/**
 * PointCloud Point Hook
 */
export const usePoint = () => {
  const { pointList, setPointList, selectedID } = useContext(PointCloudContext);

  const selectedPoint = pointList.find((v) => v.id === selectedID)

  const addPoint = (point: IPointUnit) => {
    setPointList([...pointList, point])
  }

  const deletePoint = () => {
  }

  return {
    selectedPoint,
    addPoint,
    deletePoint,
  }
}
