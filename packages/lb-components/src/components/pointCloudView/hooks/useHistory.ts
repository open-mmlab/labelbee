import { IPointCloudBox, IPointCloudBoxList, IPolygonData } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useHistory = () => {
  const {
    history,
    setPointCloudResult,
    setSelectedIDs,
    pointCloudBoxList,
    mainViewInstance,
    topViewInstance,
    polygonList,
    setPolygonList,
    syncAllViewPointCloudColor,
  } = useContext(PointCloudContext);

  const addHistory = ({
    newBoxParams,
    newPolygon,
  }: {
    newBoxParams?: IPointCloudBox;
    newPolygon?: IPolygonData;
  }) => {
    const historyRecord = {
      pointCloudBoxList,
      polygonList,
    };

    if (newBoxParams) {
      historyRecord.pointCloudBoxList = pointCloudBoxList.concat(newBoxParams);
    }

    if (newPolygon) {
      historyRecord.polygonList = polygonList.concat(newPolygon);
    }

    history.pushHistory(historyRecord);
  };

  const pushHistoryWithList = (
    params: Partial<{
      pointCloudBoxList: IPointCloudBoxList;
      polygonList: IPolygonData[];
    }>,
  ) => {
    const historyRecord = {
      pointCloudBoxList,
      polygonList,
    };

    if (params.pointCloudBoxList) {
      historyRecord.pointCloudBoxList = params.pointCloudBoxList;
    }

    if (params.polygonList) {
      historyRecord.polygonList = params.polygonList;
    }

    history.pushHistory(historyRecord);
  };

  const pushHistoryUnderUpdatePolygon = (polygon: IPolygonData) => {
    const selectedPolygon = polygonList.find((v) => v.id === polygon.id);

    if (selectedPolygon) {
      const newPolygonList = polygonList.map((v) => {
        if (v.id === polygon.id) {
          return polygon;
        }
        return {
          ...v,
        };
      });
      history.pushHistory({
        pointCloudBoxList,
        polygonList: newPolygonList,
      });
      setPolygonList(newPolygonList);
    }
  };

  const initHistory = ({
    pointCloudBoxList,
    polygonList,
  }: {
    pointCloudBoxList: IPointCloudBoxList;
    polygonList: IPolygonData[];
  }) => {
    history.initRecord({ pointCloudBoxList, polygonList }, true);
  };

  const updatePointCloud = (params?: {
    pointCloudBoxList: IPointCloudBoxList;
    polygonList: IPolygonData[];
  }) => {
    if (!params) {
      return;
    }

    const { pointCloudBoxList: newPointCloudBoxList = [], polygonList: newPolygonList = [] } =
      params;

    if (newPointCloudBoxList) {
      if (pointCloudBoxList.length !== newPointCloudBoxList.length) {
        setSelectedIDs();
      }

      const deletePointCloudList = pointCloudBoxList.filter((v) =>
        newPointCloudBoxList.every((d) => d.id !== v.id),
      );
      const addPointCloudList = newPointCloudBoxList.filter((v) =>
        pointCloudBoxList.every((d) => d.id !== v.id),
      );

      // Clear All Data
      deletePointCloudList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      // Add Init Box
      addPointCloudList.forEach((v) => {
        mainViewInstance?.generateBox(v);
      });

      setPointCloudResult(newPointCloudBoxList);
      syncAllViewPointCloudColor(newPointCloudBoxList);
    }

    if (newPolygonList) {
      setPolygonList(newPolygonList);
    }

    topViewInstance?.updatePolygonList(newPointCloudBoxList ?? [], newPolygonList ?? []);
  };

  const redo = () => {
    updatePointCloud(history.redo());
  };

  const undo = () => {
    updatePointCloud(history.undo());
  };

  return {
    addHistory,
    pushHistoryWithList,
    initHistory,
    pushHistoryUnderUpdatePolygon,
    redo,
    undo,
  };
};
