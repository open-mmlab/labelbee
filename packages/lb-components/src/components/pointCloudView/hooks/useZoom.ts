/**
 * @file Zoom Updated by PointCloud
 * @createDate 2022-09-04
 * @author Ron <ron.f.luo@gmail.com>
 */
 import { useContext } from 'react';
 import { PointCloudContext } from '../PointCloudContext';
 import { ICoordinate, ISize } from '@labelbee/lb-utils'

export const useZoom = () => {
  const { topViewInstance, sideViewInstance, backViewInstance } = useContext(PointCloudContext);
  const { zoom, setZoom } = useContext(PointCloudContext);

  const initialPosition = () => {
    topViewInstance?.pointCloud2dOperation.initImgPos();
  };

  const zoomOut = () => {
    topViewInstance?.pointCloud2dOperation.zoomChanged(false);
  };

  const zoomIn = () => {
    topViewInstance?.pointCloud2dOperation.zoomChanged(true);
  };

  const syncTopviewToolZoom = (currentPos: ICoordinate, zoom: number, size: ISize) => {
    topViewInstance?.toolScheduler.syncPosition(currentPos, zoom, size, topViewInstance?.toolInstance)
  }

  const syncSideviewToolZoom = (currentPos: ICoordinate, zoom: number, size: ISize) => {
    sideViewInstance?.toolScheduler.syncPosition(currentPos, zoom, size, sideViewInstance?.toolInstance)
  }

  const syncBackviewToolZoom = (currentPos: ICoordinate, zoom: number, size: ISize) => {
    backViewInstance?.toolScheduler.syncPosition(currentPos, zoom, size, backViewInstance?.toolInstance)
  }


  return {
    zoom,
    setZoom,
    initialPosition,
    zoomOut,
    zoomIn,
    syncTopviewToolZoom,
    syncSideviewToolZoom,
    syncBackviewToolZoom
  }
}
