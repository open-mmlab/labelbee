import { IPolygonData } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';


/**
 * PointCloud Polygon Hook
 * @returns
 */
export const usePolygon = () => {
  const { polygonList, setPolygonList} = useContext(PointCloudContext);

  const addPolygon = (polygon: IPolygonData) => {
    setPolygonList(polygonList.concat(polygon));
  }

  const deletePolygon = (id: string) => {
    const newPolygonList = polygonList.filter(v => v.id !== id);
    setPolygonList([...newPolygonList])
  }
  
  return { addPolygon, deletePolygon };
};
