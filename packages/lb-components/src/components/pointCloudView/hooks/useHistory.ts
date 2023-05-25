import {
  IPointCloudBox,
  IPointCloudBoxList,
  IPointCloudSphere,
  IPointCloudSphereList,
  IPolygonData,
  ILine,
  IPointCloudSegmentation,
} from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';

export const useHistory = () => {
  const {
    history,
    setPointCloudResult,
    setSelectedIDs,
    pointCloudBoxList,
    pointCloudSphereList,
    setPointCloudSphereList,
    mainViewInstance,
    topViewInstance,
    polygonList,
    setPolygonList,
    lineList,
    setLineList,
    syncAllViewPointCloudColor,
    segmentation,
  } = useContext(PointCloudContext);

  const addHistory = ({
    newBoxParams,
    newPolygon,
    newLine,
    newSphereParams,
  }: {
    newBoxParams?: IPointCloudBox;
    newPolygon?: IPolygonData;
    newLine?: ILine;
    newSphereParams?: IPointCloudSphere;
  }) => {
    const historyRecord = {
      pointCloudBoxList,
      polygonList,
      lineList,
      pointCloudSphereList,
    };

    if (newBoxParams) {
      historyRecord.pointCloudBoxList = pointCloudBoxList.concat(newBoxParams);
    }

    if (newPolygon) {
      historyRecord.polygonList = polygonList.concat(newPolygon);
    }
    if (newLine) {
      historyRecord.lineList = lineList.concat(newLine);
    }

    if (newSphereParams) {
      historyRecord.pointCloudSphereList = pointCloudSphereList.concat(newSphereParams);
    }

    history.pushHistory(historyRecord);
  };

  const pushHistoryWithList = (
    params: Partial<{
      pointCloudBoxList: IPointCloudBoxList;
      polygonList: IPolygonData[];
      lineList: ILine[];
      pointCloudSphereList: IPointCloudSphereList;
      segmentation: IPointCloudSegmentation[];
    }>,
  ) => {
    const historyRecord = {
      pointCloudBoxList,
      polygonList,
      lineList,
      pointCloudSphereList,
      segmentation,
    };

    if (params.pointCloudBoxList) {
      historyRecord.pointCloudBoxList = params.pointCloudBoxList;
    }

    if (params.polygonList) {
      historyRecord.polygonList = params.polygonList;
    }

    if (params.lineList) {
      historyRecord.lineList = params.lineList;
    }

    if (params.pointCloudSphereList) {
      historyRecord.pointCloudSphereList = params.pointCloudSphereList;
    }

    if (params.segmentation) {
      historyRecord.segmentation = params.segmentation;
    }

    history.pushHistory(historyRecord);
  };
  const pushHistoryUnderUpdateLine = (line: ILine) => {
    const selectedLine = lineList.find((v) => v.id === line.id);
    if (selectedLine) {
      const newLineList = lineList.map((v) => {
        if (v.id === line.id) {
          return line;
        }
        return {
          ...v,
        };
      });
      history.pushHistory({
        lineList: newLineList,
      });
      setLineList(newLineList);
    }
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
    pointCloudSphereList,
  }: {
    pointCloudBoxList: IPointCloudBoxList;
    polygonList: IPolygonData[];
    pointCloudSphereList: IPointCloudSphereList;
  }) => {
    history.initRecord({ pointCloudBoxList, polygonList, pointCloudSphereList }, true);
  };

  const updatePointCloud = (params?: {
    pointCloudBoxList: IPointCloudBoxList;
    polygonList: IPolygonData[];
    lineList: ILine[];
    pointCloudSphereList: IPointCloudSphereList;
  }) => {
    if (!params) {
      return;
    }

    const {
      pointCloudBoxList: newPointCloudBoxList = [],
      polygonList: newPolygonList = [],
      lineList: newLineList = [],
      pointCloudSphereList: newPointCloudSphereList = [],
    } = params;

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

    if (newPointCloudSphereList) {
      if (pointCloudSphereList.length !== newPointCloudSphereList.length) {
        setSelectedIDs();
      }

      let deletedPointCloudList = pointCloudSphereList.filter((v) =>
        newPointCloudSphereList.every((d) => d.id !== v.id),
      );
      let addPointCloudList = newPointCloudSphereList.filter((v) =>
        pointCloudSphereList.every((d) => d.id !== v.id),
      );
      deletedPointCloudList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      addPointCloudList.forEach((v) => {
        mainViewInstance?.generateSphere(v);
      });
      setPointCloudSphereList(newPointCloudSphereList);
    }

    if (newPolygonList) {
      setPolygonList(newPolygonList);
    }

    if (newLineList) {
      setLineList(newLineList);
    }

    topViewInstance?.updatePolygonList(newPointCloudBoxList ?? [], newPolygonList ?? []);
    topViewInstance?.updateLineList(newLineList ?? []);
    topViewInstance?.updatePointList(newPointCloudSphereList)
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
    pushHistoryUnderUpdateLine,
    redo,
    undo,
  };
};
