[English](./annotationView_en-US.md) | 简体中文

# AnnotationView 标注查看模式

> 集成基础的标注渲染，仅需简单配置就可以渲染出需要的标注信息。

## Examples

```ts
import { AnnotationView } from '@labelbee/lb-components';

const src = ''; // 可访问的图片路径

const DefaultComponent = () => {
  return (
    <AnnotationView
     src={imgInfo.src}
   />
  )
}
```


## API

| 参数            | 说明                                    | 是否必填 | 类型                                                  |            默认             |
| --------------- | --------------------------------------- | -------- | ----------------------------------------------------- | :-------------------------: |
| src             | 图片路径                                | 是       | string                                                |              -              |
| size            | 当前标注展示框的大小                    | 否       | ISize                                                 | {width: 1280, height: 720,} |
| annotations     | 标注内容的集合                          | 否       | IAnnotationData[]                                     |             []              |
| style           | 基础标注默认样式                        | 否       | IBasicStyle                                           |             {}              |
| zoomChange      | 监听内部缩放比例的改变                  | 否       | (zoom: number) => void                                |              -              |
| backgroundStyle | 容器 style 控制，现用于背景颜色的控制的 | 否       | CSSProperties                                         |             {}              |
| onChange        | 监听内部的对标注数据的操作              | 否       | (type: 'hover' \| 'selected', ids: string[]) => void; |              -              |
| showLoading     | 是否进行加载中                          | 否       | boolean                                               |            false            |


### Type

```ts
interface ISize {
  width: number;
  height: number;
}

interface IBasicStyle {
  color?: string; 
  fill?: string; 
  thickness?: number;
}


interface IAnnotationData {
  type: 'rect' | 'polygon' | 'line' | 'point';
  annotation: IBasicRect & IBasicPolygon & IBasicLine & IPoint;
}

interface IBasicRect extends IBasicStyle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IBasicPolygon extends IBasicStyle {
  id: string;
  pointList: IPoint[];
}

type IBasicLine = IBasicPolygon;

interface IPoint extends IBasicStyle {
  x: number;
  y: number;
  radius?: number;
}
```