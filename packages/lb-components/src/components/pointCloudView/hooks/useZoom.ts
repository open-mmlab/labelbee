/**
 * @file Zoom Updated by PointCloud
 * @createDate 2022-09-04
 * @author Ron <ron.f.luo@gmail.com>
 */
 import { useContext } from 'react';
 import { PointCloudContext } from '../PointCloudContext';

export const useZoom = () => {
  const { topViewInstance } = useContext(PointCloudContext);
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

  return {
    zoom, 
    setZoom,
    initialPosition,
    zoomOut,
    zoomIn
  }
}
