/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import {  PointCloud } from '@labelbee/lb-annotation';
import { IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';
import React, { useCallback, useEffect, useRef } from 'react';

interface IProps {
  src: string; // 图片路径
  result: string;
  size: {
    width: number;
    height: number;
  };
  backgroundColor?: string;

  // Camera Update
  isOrthographicCamera?: boolean;
  getInstance?: (Instance: PointCloud) => void
}

const PointCloudAnnotationView = (props: IProps) => {
  const { src, result, size, isOrthographicCamera = false, backgroundColor = '#ccc', getInstance } = props;
  let viewOperation = useRef<any>();
  const instance = useRef<any>();

  const refCallback = useCallback((node) => {
    viewOperation.current = node;
  }, []);

  useEffect(() => {
    let pointCloudProps = {
      container: viewOperation.current,
      backgroundColor,
      isOrthographicCamera,
    };

    /**
     * Orthographic Camera Params.
     *  */
    if (isOrthographicCamera) {
      Object.assign(pointCloudProps, {
        orthographicParams: PointCloudUtils.getDefaultOrthographicParams(size),
      });
    }

    const pointCloud = new PointCloud(pointCloudProps);
    instance.current = pointCloud;
    if(getInstance){
      instance.current.on('loadPCDFileEnd', () =>{
        getInstance(instance.current)
      })
    }
    return () => {
      instance.current.renderer?.forceContextLoss();
    };
  }, []);

  useEffect(() => {
    // PointCloud camera init.

    if (instance.current) {
      // Init the camera
      instance.current?.init();

      // Update range of orthographicCamera.
      instance.current?.initOrthographicCamera(PointCloudUtils.getDefaultOrthographicParams(size));
      instance.current?.render();
    }
  }, [size]);

  useEffect(() => {
    if (instance.current && src) {
      instance.current?.loadPCDFile(src);
    }
  }, [src]);

  useEffect(() => {
    if (result) {
      const boxParamsList = PointCloudUtils.getBoxParamsFromResultList(result);

      // Add Init Box
      boxParamsList.forEach((v: IPointCloudBox) => {
        instance.current?.generateBox(v, v.id);
      });
    }
    return () => {
      const boxParamsList = PointCloudUtils.getBoxParamsFromResultList(result);
      boxParamsList.forEach((v: IPointCloudBox) => {
        instance.current?.removeObjectByName(v.id, 'box');
      });
      instance.current?.render();
    };
  }, [result]);

  return <div style={size} ref={refCallback} />;
};

export default PointCloudAnnotationView;
