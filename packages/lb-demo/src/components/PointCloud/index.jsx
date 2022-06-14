/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:31:36
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-13 20:07:03
 */
import { PointCloud } from '@labelbee/lb-annotation';
import { useEffect, useRef } from 'react';

const pointCloudID = 'LABELBEE-POINTCLOUD';

const PointCloudDom = () => {
  const ref = useRef();
  const pointCloudRef = useRef();

  useEffect(() => {
    console.log(ref.current);
    if (ref.current) {
      pointCloudRef.current = new PointCloud({ container: ref.current });
      pointCloudRef.current.loadPCDFile('http://10.53.25.142:8001/1/000001.pcd');
    }
  }, []);

  return <div id={pointCloudID} ref={ref} />;
};

export default PointCloudDom;
