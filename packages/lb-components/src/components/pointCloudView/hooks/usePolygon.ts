import { IPolygonData } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { useHistory } from './useHistory';

/**
 * PointCloud Polygon Hook
 * @returns
 */
export const usePolygon = () => {
  const { polygonList, setPolygonList, selectedID } = useContext(PointCloudContext);
  const { addHistory, pushHistoryWithList } = useHistory();

  const selectedPolygon = polygonList.find((v) => v.id === selectedID);

  const addPolygon = (polygon: IPolygonData) => {
    setPolygonList(polygonList.concat(polygon));
    addHistory({ newPolygon: polygon });
  };

  const deletePolygon = (id: string) => {
    const newPolygonList = polygonList.filter((v) => v.id !== id).map((v) => ({ ...v }));
    setPolygonList(newPolygonList);
    pushHistoryWithList({ polygonList: newPolygonList });
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

  return { addPolygon, deletePolygon, selectedPolygon, updateSelectedPolygon, updatePolygonValidByID };
};
