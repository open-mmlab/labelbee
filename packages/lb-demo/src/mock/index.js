import img1 from './images/10.jpg';
import img2 from './images/19.jpg';
import img3 from './images/20.jpg';
import img4 from './images/66.jpg';
import { pointCloudResult1 } from './pointCloud';

// const MOCK_URL = 'http://bee-sdk-demo.sensebee.xyz/images/';
// export const fileList = ['10', '19', '20', '66'].map((i) => `${MOCK_URL}${i}.jpg`);
export const fileList = [img1, img2, img3, img4];
export const videoList = [
  'http://127.0.0.1:8080/a.mp4',
  'http://127.0.0.1:8080/d.mp4',
  'http://127.0.0.1:8080/c.mp4',
  'http://127.0.0.1:8080/e.mp4',
];

export const pointCloudList = [
  // 'http://10.53.25.142:8001/10837/1/total.pcd',
  // 'http://127.0.0.1:8082/lidar/1651762642488711000.pcd',
  'http://10.152.32.16:8080/top_center_lidar/2022-02-20-12-21-03-100.pcd',
  'http://10.152.32.16:8080/top_center_lidar/2022-02-20-12-21-03-200.pcd',
  'http://10.152.32.16:8080/top_center_lidar/2022-02-20-12-21-03-300.pcd',
  'http://10.53.25.142:8001/10837/2/total.pcd',
  'http://10.53.25.142:8001/10837/3/total.pcd',
  'http://10.53.25.142:8001/10837/4/total.pcd',
  'http://10.53.25.142:8001/10837/5/total.pcd',
  'http://10.53.25.142:8001/10837/6/total.pcd',
  'http://10.53.25.142:8001/10837/7/total.pcd',
  'http://10.53.25.142:8001/10837/8/total.pcd',
  'http://10.53.25.142:8001/10837/9/total.pcd',
  'http://10.53.25.142:8001/10837/10/total.pcd',
  'http://10.53.25.142:8001/10837/11/total.pcd',
  'http://10.53.25.142:8001/10837/12/total.pcd',
  'http://10.53.25.142:8001/10837/13/total.pcd',
  'http://10.53.25.142:8001/10837/14/total.pcd',
  'http://10.53.25.142:8001/10837/15/total.pcd',
  'http://10.53.25.142:8001/10837/16/total.pcd',
  'http://10.53.25.142:8001/10837/17/total.pcd',
  'http://10.53.25.142:8001/10837/18/total.pcd',
  'http://10.53.25.142:8001/10837/19/total.pcd',
  'http://10.53.25.142:8001/10837/20/total.pcd',
];

export const pointCloudMappingImgList = [
  {
    url: 'http://10.152.32.16:8080/image_undistort/center_camera_fov120/2022-02-20-12-21-03-100.png',
    calib: {
      P: [
        [664.2713623046875, 0.0, 966.8039735557395, 0],
        [0.0, 673.2572021484375, 557.292600044435, 0],
        [0.0, 0.0, 1.0, 0],
      ],
      R: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      T: [
        [-0.99986, 0.0138869, -0.009277, -0.18942],
        [0.00942274, 0.0105122, -0.9999, -0.0724215],
        [-0.0137894, -0.999848, -0.0106419, 0.420832],
      ],
    },
  },
  {
    url: 'http://10.152.32.16:8080/image_undistort/center_camera_fov30/2022-02-20-12-21-03-100.png',
    calib: {
      P: [
        [4454.6, 0, 954.3, 0],
        [0, 4459.0, 616.6, 0],
        [0.0, 0.0, 1.0, 0],
      ],
      R: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      T: [
        [-0.999925, -0.000707111, -0.0122273, 0.0962923],
        [0.0122155, 0.0140593, -0.999826, -0.0991715],
        [0.000877471, -0.9999, -0.0140499, 1.48935],
      ],
    },
  },
  {
    url: 'http://10.152.32.16:8080/image_undistort/left_front_camera/2022-02-20-12-21-03-100.png',
    calib: {
      P: [
        [1231.7, 0, 964.3, 0],
        [0, 1234.6, 572.7, 0],
        [0.0, 0.0, 1.0, 0],
      ],
      R: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      T: [
        [-0.604101, -0.796899, 0.00388006, -0.821921],
        [-0.0384692, 0.024299, -0.998964, -1.0657],
        [0.795979, -0.603624, -0.0453359, -1.45241],
      ],
    },
  },
  {
    url: 'http://10.152.32.16:8080/image_undistort/left_rear_camera/2022-02-20-12-21-03-100.png',
    calib: {
      P: [
        [1255.3, 0, 952.9, 0],
        [0, 1257.3, 539.3, 0],
        [0, 0, 1, 0],
      ],
      R: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      T: [
        [0.568373, -0.822005, -0.0354856, -1.73776],
        [-0.0376153, 0.0171236, -0.999146, -1.39336],
        [0.82191, 0.569223, -0.0211873, 0.583955],
      ],
    },
  },
  {
    url: 'http://10.152.32.16:8080/image_undistort/rear_camera/2022-02-20-12-21-03-100.png',
    calib: {
      P: [
        [2109.75, 0, 984.6, 0],
        [0, 2365.9, 631.1, 0],
        [0.0, 0.0, 1.0, 0],
      ],
      R: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      T: [
        [0.999947, -0.00513728, -0.00884364, -0.0994936],
        [-0.00885675, -0.00250621, -0.999958, -0.388493],
        [0.00511496, 0.999983, -0.00255124, 0.346432],
      ],
    },
  },
];

const data = [];

const polygonData = [];
// Array(1)
//   .fill('')
//   .map((v, i) => ({
//     id: i + 1,
//     sourceID: '',
//     pointList: Array(1000)
//       .fill('')
//       .map((_) => ({
//         x: Math.random() * 300,
//         y: Math.random() * 400,
//       })),
//     order: i + 1,
//     attribute: '',
//     valid: true,
//   }));

export const rectDefaultResult = JSON.stringify({
  height: 200,
  width: 100,
  rotate: 0,
  step_1: {
    dataSource: 0,
    tool: 'rectTool',
    result: data,
  },
});

export const polygonDefaultResult = JSON.stringify({
  height: 200,
  width: 100,
  rotate: 0,
  step_1: {
    dataSource: 0,
    tool: 'polygonTool',
    result: polygonData,
  },
});

export const tagDefaultResult = JSON.stringify({
  height: 200,
  width: 100,
  rotate: 0,
  step_1: {
    dataSource: 0,
    tool: 'tagTool',
    result: [],
  },
});

export const videoTagDefaultResult = JSON.stringify({
  step_1: {
    dataSource: 0,
    tool: 'videoTagTool',
    result: [],
  },
});

export const pointCloudResult = pointCloudResult1;

export const getMockResult = (tool) => {
  if (tool === 'rectTool') {
    return rectDefaultResult;
  }
  if (tool === 'tagTool') {
    return tagDefaultResult;
  }

  if (tool === 'polygonTool') {
    return polygonDefaultResult;
  }

  if (tool === 'videoTagTool') {
    return videoTagDefaultResult;
  }

  if (tool === 'pointCloudTool') {
    return '{}';
    // return pointCloudResult;
  }

  return '';
};

export const mockFileList = [
  {
    id: 1,
    url: 'http://bee-sdk-demo.sensebee.xyz/images/10.jpg',
    result:
      '{"width":720,"height":1280,"valid":true,"rotate":0,"step_1":{"dataSourceStep":0,"toolName":"rectTool","result":[{"x":272.47863247863245,"y":397.4928774928775,"width":288.0911680911681,"height":346.4387464387464,"attribute":"","valid":true,"id":"AwL2kecs","sourceID":"","textAttribute":"","order":1}]}}',
  },
  {
    id: 2,
    url: 'http://bee-sdk-demo.sensebee.xyz/images/19.jpg',
    result:
      '{"width":720,"height":1280,"valid":true,"rotate":0,"step_1":{"dataSourceStep":0,"toolName":"rectTool","result":[{"x":137.54985754985753,"y":262.56410256410254,"width":492.30769230769226,"height":525.1282051282051,"attribute":"","valid":true,"id":"iCXb9Lat","sourceID":"","textAttribute":"","order":1},{"x":133.9031339031339,"y":627.2364672364672,"width":357.3789173789174,"height":353.7321937321937,"attribute":"","valid":true,"id":"siLd255B","sourceID":"","textAttribute":"","order":2},{"x":640.7977207977208,"y":1061.196581196581,"width":79.2022792022792,"height":200.56980056980055,"attribute":"","valid":true,"id":"udXxQJou","sourceID":"","textAttribute":"","order":3}]}}',
  },
  {
    id: 3,
    url: 'http://bee-sdk-demo.sensebee.xyz/images/20.jpg',
    result:
      '{"width":720,"height":1280,"valid":true,"rotate":0,"step_1":{"dataSourceStep":0,"toolName":"rectTool","result":[{"x":144.84330484330485,"y":506.8945868945869,"width":324.55840455840456,"height":368.3190883190883,"attribute":"","valid":true,"id":"NFN0vzGW","sourceID":"","textAttribute":"","order":1},{"x":301.65242165242165,"y":328.2051282051282,"width":350.0854700854701,"height":386.5527065527065,"attribute":"","valid":true,"id":"t91AA81j","sourceID":"","textAttribute":"","order":2}]}}',
  },
  {
    id: 4,
    url: 'http://bee-sdk-demo.sensebee.xyz/images/66.jpg',
    result:
      '{"width":720,"height":1280,"valid":true,"rotate":0,"step_1":{"dataSourceStep":0,"toolName":"rectTool","result":[]}}',
  },
];

export const DEFAULT_ANNOTATIONS = [
  {
    type: 'rect',
    annotation: {
      id: '123123',
      x: 123,
      y: 23,
      width: 100,
      height: 100,
      stroke: 'pink',
      // thickness: 10,
      label: 'laoluo',
      attribute: 'asdasd',
      order: 1,
      // hiddenText: true
    },
  },
  {
    type: 'polygon',
    annotation: {
      id: '3',
      // thickness: 10,
      stroke: 'green',
      lineType: 1,
      pointList: [
        {
          x: 12,
          y: 123,
        },
        {
          x: 122,
          y: 123,
        },
        {
          x: 2,
          y: 3,
        },
      ],
    },
  },
  {
    type: 'line',
    annotation: {
      stroke: 'yellow',
      thickness: 5,
      id: '4',
      pointList: [
        {
          x: 123,
          y: 12,
        },
        {
          x: 2,
          y: 12,
        },
        {
          x: 34,
          y: 132,
        },
      ],
    },
  },
  {
    type: 'point',
    annotation: {
      id: '5',
      x: 10,
      y: 10,
      fill: 'green',
      stroke: 'blue',
      thickness: '20',
      radius: 10,
    },
  },
  {
    type: 'rect',
    annotation: {
      id: '10',
      x: 13,
      y: 3,
      width: 1020,
      height: 100,
    },
  },
  {
    type: 'text',
    annotation: {
      position: 'rt',
      id: '11',
      x: 223,
      y: 23,
      textMaxWidth: 416,
      color: 'yellow',
      text: '标签1: 测试1LoooooooooooooooooooooooooooooooooogLoooooooooooooooooooooooooooooooooogLoooooooooooooooooooooooooooooooooogLoooooooooooooooooooooooooooooooooogLoooooooooooooooooooooooooooooooooog\n标签2: 测试2sdasdas\n\n\n标签1: 测试1asdasdasd\n标签2: 测试2标签1: 测试1\n标签2: 测试2sdasdas\n标签1: 测试1asdasdasd\n标签2: 测试2标签1: 测试1\n标签2: 测试2sdasdas\n标签1: 测试1asdasdasd\n标签2: 测试2标签1: 测试1\n标签2: 测试2sdasdas\n标签1: 测试1asdasdasd\n标签2: 测试2标签1: 测试1\n标签2: 测试2sdasdas\n标签1: 测试1asdasdasd\n标签2: 测试2标签1: 测试1\n标签2: 测试2sdasdas\n标签1: 测试1asdasdasd\n标签2: 测试2',
    },
  },
  {
    type: 'text',
    annotation: {
      id: '12',
      x: 12,
      y: 123,
      textMaxWidth: 500,
      lineHeight: 25,
      text: 'Key: Loooooooooooooooooooooooooooooooooog value\nSecond One: short value',
    },
  },
  {
    type: 'rect',
    annotation: {
      id: 'g5r2l7mcrv8',
      x: 60,
      y: 260,
      width: 100,
      height: 100,
      stroke: 'pink',
      name: 'Bag',
      hiddenRectSize: true,
      renderEnhance: (params) => {
        const {
          ctx,
          data: { annotation },
          zoom,
          currentPos,
        } = params;

        ctx.fillStyle = annotation.stroke;

        ctx.fillRect(
          annotation.x * zoom + currentPos.x - 2,
          annotation.y * zoom + currentPos.y - 20 * zoom,
          40 * zoom,
          20 * zoom,
        );
        ctx.strokeStyle = 'white';
        ctx.strokeText(
          annotation.name,
          annotation.x * zoom + currentPos.x + 6 * zoom,
          annotation.y * zoom + currentPos.y - 7 * zoom,
        );
      },
    },
  },
];
