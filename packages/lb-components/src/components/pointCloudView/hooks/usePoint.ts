import { IPointUnit } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

/**
 * PointCloud Point Hook
 */
export const usePoint = () => {
  const { pointList, setPointList, selectedID, setSelectedIDs } = useContext(PointCloudContext);

  const selectedPoint = pointList.find((v) => v.id === selectedID)

  const addPoint = (point: IPointUnit) => {
    setPointList([...pointList, point])
    setSelectedIDs([point.id])
  }

  const deletePoint = (id: string) => {
    setPointList(pointList.filter((v) => v.id === id))
    setSelectedIDs([])
  }

  return {
    selectedPoint,
    addPoint,
    deletePoint,
  }
}
