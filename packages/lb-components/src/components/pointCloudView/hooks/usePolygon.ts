import { IPolygonData } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { useHistory } from './useHistory';

/**
 * PointCloud Polygon Hook
 * @returns
 */
export const usePolygon = () => {
  const { polygonList, pointCloudBoxList, setPolygonList, selectedID } =
    useContext(PointCloudContext);
  const { addHistory, pushHistoryWithList } = useHistory();

  const selectedPolygon = polygonList.find((v) => v.id === selectedID);

  const addPolygon = (polygon: IPolygonData) => {
    setPolygonList(polygonList.concat(polygon));
    addHistory({ newPolygon: polygon });
  };

  const deletePolygon = (id: string) => {
    const newPolygonList = polygonList.filter((v) => v.id !== id).map((v) => ({ ...v }));
    setPolygonList(newPolygonList);

    const params: any = { polygonList: newPolygonList };

    try {
      // TODO decoupling deletePointCloudBox deletePolygon
      // deletePointCloudBox and deletePolygon are now coupled for historical reasons
      // No matter how you delete pointCloudBoxList, double click the right button or press the delete button, and the execution will come here
      // I know it's ugly, but there's no better way to change it
      // In order to solve the problem that the pointCloudBoxList in history.record is not updated after deleting the box, use this current coupling mechanism
      const newPointCloudBoxList = pointCloudBoxList
        .filter((v) => v.id !== id)
        .map((v) => ({ ...v }));

      if (newPointCloudBoxList.length < pointCloudBoxList.length) {
        params.pointCloudBoxList = newPointCloudBoxList;
      }
    } catch (error) {
      console.error('exec update history pointCloudBoxList error:', error);
    }

    pushHistoryWithList(params);
  };

  const updateSelectedPolygon = (polygon: IPolygonData) => {
    if (selectedPolygon) {
      setPolygonList(
        polygonList.map((v) => {
          if (v.id === selectedID) {
            return polygon;
          }
          return v;
        }),
      );
    }
  };

  const updatePolygonValidByID = (id: string) => {
    const polygon = polygonList.find((v) => v.id === id);
    if (polygon) {
      setPolygonList(
        polygonList.map((v) => {
          if (v.id === id) {
            return {
              ...v,
              valid: !v.valid,
            };
          }
          return v;
        }),
      );
    }
  };

  return {
    addPolygon,
    deletePolygon,
    selectedPolygon,
    updateSelectedPolygon,
    updatePolygonValidByID,
  };
};
