/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import { PointCloud } from '@labelbee/lb-annotation';
import { IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';
import React, { useCallback, useEffect, useRef } from 'react';

interface IProps {
  src: string; // 图片路径
  result: string;
  size: {
    width: number;
    height: number;
  };
}

const PointCloudAnnotationView = (props: IProps) => {
  const { src, result, size } = props;
  let viewOperation = useRef<any>();
  const instance = useRef<any>();

  const refCallback = useCallback((node) => {
    viewOperation.current = node;
  }, []);

  useEffect(() => {
    const pointCloud = new PointCloud({
      container: viewOperation.current,
      backgroundColor: '#ccc',
    });
    instance.current = pointCloud;
    return () => {
      instance.current.renderer?.forceContextLoss();
    };
  }, []);

  useEffect(() => {
    instance.current?.init();
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
        instance.current?.removeObjectByName(v.id);
      });
      instance.current?.render();
    };
  }, [result]);

  return <div style={size} ref={refCallback} />;
};

export default PointCloudAnnotationView;
