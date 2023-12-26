import img1 from './images/10.jpg';
import img2 from './images/19.jpg';
import img3 from './images/20.jpg';
import img4 from './images/66.jpg';
import { pointCloudResult1 } from './pointCloud';
import { LLMToolResult } from './LLMTool';

// audios
import audio1 from './audios/audio1.mp3'

// Cuboid_IMG
import car1 from './cuboidImages/1.png';
import car2 from './cuboidImages/2.png';
import car3 from './cuboidImages/3.png';
import car4 from './cuboidImages/4.png';
import car5 from './cuboidImages/5.png';

// POINTCLOUD_DATA
import pcd1 from './pointCloud/lidar/pro1.pcd';
import pcd2 from './pointCloud/lidar/2.pcd';
import pcd3 from './pointCloud/lidar/3.pcd';
import pcd4 from './pointCloud/lidar/4.pcd';
import pcd5 from './pointCloud/lidar/5.pcd';
import pcd6 from './pointCloud/lidar/6.pcd';
import pcd7 from './pointCloud/lidar/7.pcd';
import pcd8 from './pointCloud/lidar/8.pcd';
import pcd9 from './pointCloud/lidar/9.pcd';
import pointCloudImg1 from './pointCloud/image/P2/1.png';
import pointCloudImg2 from './pointCloud/image/P2/2.png';
import calib1 from './pointCloud/calib/P2/1.json';
import calib2 from './pointCloud/calib/P2/2.json';

// const MOCK_URL = 'http://bee-sdk-demo.sensebee.xyz/images/';
// export const fileList = ['10', '19', '20', '66'].map((i) => `${MOCK_URL}${i}.jpg`);
export const fileList = [car1, car2, car3, car4, car5];
// export const fileList = [img1, img2, img3, img4];
export const videoList = ['http://vjs.zencdn.net/v/oceans.mp4', 'https://media.w3.org/2010/05/sintel/trailer.mp4'];

export const pointCloudList = [pcd1, pcd2, pcd3, pcd4, pcd5, pcd6, pcd7, pcd8, pcd9];

export const pointCloudMappingImgList = [
  {
    url: pointCloudImg1,
    calib: calib1,
    path: pointCloudImg1,
  },
  {
    url: pointCloudImg2,
    calib: calib2,
    path: pointCloudImg2,
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

  if (tool === 'LLMTool') {
    return LLMToolResult;
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

export const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

const generateCoordinates = (num, width, height) => {
  const coordinates = [];
  const defaultOffset = {
    x: 400,
    y: 400,
  };
  for (let i = 0; i < num; i++) {
    const x = Math.floor(Math.random() * width) + defaultOffset.x;
    const y = Math.floor(Math.random() * height) + defaultOffset.y;
    coordinates.push({ x, y, color: generateRandomColor() });
  }
  return coordinates;
};

const pixelPointsData = generateCoordinates(10000, 200, 200);

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
          annotation.y * zoom + currentPos.y - 25,
          40,
          25,
        );
        ctx.strokeStyle = 'white';
        ctx.strokeText(
          annotation.name,
          annotation.x * zoom + currentPos.x + 6,
          annotation.y * zoom + currentPos.y - 7,
        );
      },
    },
  },
  {
    type: 'box3d',
    annotation: {
      id: 'fJGtJkho',
      center: {
        x: 65.40254070595145,
        y: -0.3830958425132849,
        z: 0.45834684240952583,
      },
      width: 3.8735671799451086,
      height: 2.6857128643132304,
      depth: 3.4032850127098584,
      rotation: 3.107123552590266,
      attribute: 'class-8f',
      valid: true,
      trackID: 3,
      calib: {
        P: [
          [721.5377, 0, 609.5593, 44.85728],
          [0, 721.5377, 172.854, 0.2163791],
          [0, 0, 1, 0.002745884],
        ],
        R: [
          [0.9999239, 0.00983776, -0.007445048],
          [-0.009869795, 0.9999421, -0.004278459],
          [0.007402527, 0.004351614, 0.9999631],
        ],
        T: [
          [0.007533745, -0.9999714, -0.000616602, -0.004069766],
          [0.01480249, 0.0007280733, -0.9998902, -0.07631618],
          [0.9998621, 0.00752379, 0.01480755, -0.2717806],
        ],
      },
      stroke: 'pink',
    },
  },
  {
    type: 'box3d',
    annotation: {
      id: 'asGtJk23',
      center: {
        x: 15.40254070595145,
        y: 2.3830958425132849,
        z: 0.45834684240952583,
      },
      width: 1.8735671799451086,
      height: 3.6857128643132304,
      depth: 4.4032850127098584,
      rotation: 2.107123552590266,
      attribute: 'class-8f',
      valid: true,
      trackID: 3,
      calib: {
        P: [
          [721.5377, 0, 609.5593, 44.85728],
          [0, 721.5377, 172.854, 0.2163791],
          [0, 0, 1, 0.002745884],
        ],
        R: [
          [0.9999239, 0.00983776, -0.007445048],
          [-0.009869795, 0.9999421, -0.004278459],
          [0.007402527, 0.004351614, 0.9999631],
        ],
        T: [
          [0.007533745, -0.9999714, -0.000616602, -0.004069766],
          [0.01480249, 0.0007280733, -0.9998902, -0.07631618],
          [0.9998621, 0.00752379, 0.01480755, -0.2717806],
        ],
      },
      stroke: 'rgb(255, 226, 50)',
    },
  },
  {
    type: 'cuboid',
    annotation: {
      attribute: 'class-gF',
      direction: 'front',
      valid: true,
      id: 'dmjIbMoD',
      sourceID: '',
      textAttribute: 'text',
      order: 1,
      frontPoints: {
        tl: {
          x: 189.98858647936788,
          y: 192.48726953467954,
        },
        tr: {
          x: 254.1510096575944,
          y: 192.48726953467954,
        },
        bl: {
          x: 189.98858647936788,
          y: 253.65144863915717,
        },
        br: {
          x: 254.1510096575944,
          y: 253.65144863915717,
        },
      },
      backPoints: {
        br: {
          x: 296.7260755048288,
          y: 217.07287093942054,
        },
        tr: {
          x: 296.7260755048288,
          y: 155.9086918349429,
        },
        tl: {
          x: 232.56365232660232,
          y: 155.9086918349429,
        },
        bl: {
          x: 232.56365232660232,
          y: 217.07287093942054,
        },
      },
    },
  },
  {
    type: 'pixelPoints',
    annotation: pixelPointsData,
    defaultRGBA: 'rgba(23,0,255,1)',
    pixelSize: 1,
  },
];

export const mockAudioList = [
  {
    id: 1,
    path: '230150176229189149233159179.mp3',
    name: '',
    url: 'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8978%2F2.wav?Expires=1701341999&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=s5eX9GyK6VM42Xk0jZtYndYfwI0%3D',
    processedUrl:
      'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8799%2F2.mp3?Expires=1693378799&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=5u3nNCoKi64X487g%2F23wJR1486w%3D',
    result: '',
    auditStatus: 0,
    preAnnotationJsonUrl:
      'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8799%2Fpre_annotation_data%2F2.json?Expires=1693378799&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=EvfnLs9qn%2FWWfYASFqPWA0%2B30FM%3D',
    preResult: '{}',
    thumbnail: '',
    standStatus: 0,
    unitFileList: null,
    webPointCloudFile: {
      lidar: {
        id: 0,
        path: '',
        url: '',
        processedUrl: '',
        thumbnail: '',
      },
      cameras: null,
    },
  },
  {
    id: 2,
    path: '20220721_iatcut_p1_00-Copy1.h1.wav',
    name: '',
    url: 'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8799%2F1.wav?Expires=1693562399&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=T%2FVoiFZK3DPkGdjMubRKY2fq%2B%2F8%3D',
    processedUrl:
      'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8799%2F1.wav?Expires=1693378799&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=2DxHuj3N7huPBEHIOGGwNniqWRk%3D',
    result: '',
    auditStatus: 0,
    preAnnotationJsonUrl:
      'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F8799%2Fpre_annotation_data%2F1.json?Expires=1693378799&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=dX42luevW6YJky4fO2O9%2F18t8oY%3D',
    preResult: '{}',
    thumbnail: '',
    standStatus: 0,
    unitFileList: null,
    webPointCloudFile: {
      lidar: {
        id: 0,
        path: '',
        url: '',
        processedUrl: '',
        thumbnail: '',
      },
      cameras: null,
    },
  },
];
