[English](./annotationView_en-US.md) | 简体中文

# AnnotationView 标注查看模式

> 集成基础的标注渲染，仅需简单配置就可以渲染出需要的标注信息。

## Examples

```ts
import { AnnotationView } from '@labelbee/lb-components';

const src = ''; // 可访问的图片路径

const [data, setData] = useState(DEFAULT_ANNOTATIONS);

const onChange = (type, ids) => {
  if (type === 'hover') {
    setData((pre) => {
      return pre.map((item) => {
        if (item.annotation.id === 'g5r2l7mcrv8') {
          const { annotation } = item;
          return {
            ...item,
            annotation: {
              ...annotation,
              hiddenRectSize: !ids.includes('g5r2l7mcrv8'),
            },
          };
        }
        return item;
      });
    });
  }
};


const DefaultComponent = () => {
  return (
    <AnnotationView
     src={src}
     annotations={data}
   />
  )
}

export default DefaultComponent;
```


## API

| 参数            | 说明                                    | 是否必填 | 类型                                                  |            默认             |
| --------------- | --------------------------------------- | -------- | ----------------------------------------------------- | :-------------------------: |
| src             | 图片路径                                | 是       | string                                                |              -              |
| size            | 当前标注展示框的大小                    | 否       | ISize                                                 | {width: 1280, height: 720,} |
| annotations     | 标注内容的集合                          | 否       | TAnnotationViewData[]                                     |             []              |
| style           | 基础标注默认样式                        | 否       | IBasicStyle                                           |             {}              |
| zoomChange      | 监听内部缩放比例的改变                  | 否       | (zoom: number) => void                                |              -              |
| backgroundStyle | 容器 style 控制，现用于背景颜色的控制的 | 否       | CSSProperties                                         |             {}              |
| onChange        | 监听内部的对标注数据的操作              | 否       | (type: 'hover' \| 'selected', ids: string[]) => void; |              -              |
| showLoading     | 是否进行加载中                          | 否       | boolean                                               |            false            |

### Special API

- [renderEnhance - 渲染增强方法](./renderEnhance.md)

### Type

```ts

interface ISize {
  width: number;
  height: number;
}

export interface ICoordinate {
  x: number;
  y: number;
}

/** 线条类型 */
export enum ELineTypes {
  Line,
  Curve,
}
export interface IBasicStyle {
  stroke?: string; // 边框颜色
  fill?: string; // 填充颜色
  thickness?: number; // 当前图形宽度
}


export interface IRenderEnhanceParams {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  currentPos: ICoordinate;
  zoom: number;
  data: TAnnotationViewData;
  toolInstance: any;
}

export interface IGraphicsBasicConfig extends IBasicStyle {
  hiddenText?: boolean; // 是否隐藏文本
  isReference?: boolean; // 是否进行的参考显示
  renderEnhance?: (params: IRenderEnhanceParams) => void;
}
export interface IBasicRect extends IGraphicsBasicConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hiddenRectSize?: boolean;
}

export interface IBasicPoint extends IGraphicsBasicConfig {
  id: string;
  x: number;
  y: number;
  radius?: number;
}

export interface IBasicPolygon extends IGraphicsBasicConfig {
  id: string;
  pointList: IBasicPoint[];
  showDirection?: boolean;
  specialPoint?: boolean; // 顶点是否特殊点
  specialEdge?: boolean; // 顶点与a其下一个顶点连成的边是否为特殊边

  lineType?: ELineTypes;
  showKeyPoint?: boolean; // 是否展示关键点
}

export type IBasicLine = IBasicPolygon;

export interface IBasicText extends IGraphicsBasicConfig {
  id: string;
  x: number;
  y: number;
  text: string; // Use \n for line feed
  position: 'rt';
  textMaxWidth?: number;

  color?: string;
  background?: string;
  lineHeight?: number;
  font?: string; // canvas-font https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
  style?: StyleSheetList;
}

export interface ICalib {
  P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Camera Intrinsic matrix
  R: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple]; // 3x3 rotation matrix
  T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Lidar to camera matrix
}

export interface IBasicBox3d extends IGraphicsBasicConfig {
  id: string;
  // Box3d centerPoint
  center: {
    x: number;
    y: number;
    z: number;
  };

  width: number; // The length of X-Axis
  height: number; // The length of Y-Axis
  depth: number; // The length of Z-Axis
  rotation: number; // Right-handed system, angle of rotation around Z-Axis, Range: [0, 2 * Pi]
  calib: ICalib; // Calibration parameters of the current picture.
}

export type TAnnotationViewRect = {
  type: 'rect';
  annotation: IBasicRect;
};

export type TAnnotationViewPolygon = {
  type: 'polygon';
  annotation: IBasicPolygon;
};

export type TAnnotationViewPoint = {
  type: 'point';
  annotation: IBasicPoint;
};

export type TAnnotationViewBox3d = {
  type: 'box3d';
  annotation: IBasicBox3d;
};

export type TAnnotationViewLine = {
  type: 'line';
  annotation: IBasicLine;
};

export type TAnnotationViewText = {
  type: 'text';
  annotation: IBasicText;
};

export type TAnnotationViewData =
  | TAnnotationViewRect
  | TAnnotationViewPolygon
  | TAnnotationViewPoint
  | TAnnotationViewBox3d
  | TAnnotationViewLine
  | TAnnotationViewText;

```