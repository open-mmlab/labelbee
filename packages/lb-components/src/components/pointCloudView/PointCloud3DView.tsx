/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:43:25
 */

import { PointCloud } from '@labelbee/lb-annotation';
import React, { useEffect, useRef } from 'react';
const pointCloudID = 'LABELBEE-POINTCLOUD';

let pointCloudMain: any; // TODO

const PointCloud3D = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pointCloudRef = useRef<PointCloud>();

  useEffect(() => {
    if (ref.current) {
      pointCloudRef.current = new PointCloud({ container: ref.current });
      pointCloudRef.current.loadPCDFile('http://10.53.25.142:8001/1/000001.pcd', () => {
        // TODO
      });
      pointCloudMain = pointCloudRef.current;
    }
  }, []);

  return (
    <div
      id={pointCloudID}
      ref={ref}
      style={{
        height: 540, // TODO
        width: '100%', // TODO
      }}
    />
  );
};

export default PointCloud3D;

export { pointCloudMain };
