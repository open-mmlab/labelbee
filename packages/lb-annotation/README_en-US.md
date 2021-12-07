English | [简体中文](./README.md)

# LB-Annotation

JavaScript Canvas Library, quickly provide annotation such as detection, segmentation and classification

## 📦 Install

```bash
# NPM
$ npm install @labelbee/lb-annotation

# YARN
$ yarn add @labelbee/lb-annotation
```

## Quick Start

```ts
import React, { useEffect } from 'react';
import { AnnotationEngine } from '@labelbee/lb-annotation';

const imgSrc =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Andre_Iguodala_2016.jpg/1200px-Andre_Iguodala_2016.jpg';

const App = () => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      const imgNode = new Image();
      imgNode.src = imgSrc;
      imgNode.onload = () => {
        // 获取当前工具的类
        const annotationEngine = new AnnotationEngine({
          container: ref.current,
          size: {
            width: 1000,
            height: 600,
          },
          toolName: 'rectTool', // 关键
          imgNode,
        });

        // 控制工具实例
        const toolInstance = annotationEngine.toolInstance;

        // 常见用法
        // 1. 设置当前渲染的 setImgNode，设置之后会主动初始化图片大小
        toolInstance.setImgNode(imgNode);

        // 2. 设置当前的标注工具的结果 IRect[] | IPolygonData[]
        const result = [];
        toolInstance.setResult(result);

        // 3. 初始化当前历史结果
        toolInstance.history.initRecord(result, true);

        // 4. 设置当前图片的是否渲染
        toolInstance.setRotate(fileResult.rotate ?? 0);

        // 5. 更改上述配置的样式
        toolInstance.setStyle(styleConfig);

        // 6. 更改当前的窗口的大小
        toolInstance.setSize(canvasSize);

        // 7. 初始化图片的大小
        toolInstance.initImgPos();

        // 8. 按比例方法放大 / 缩小
        toolInstance.zoomChanged(true);
        toolInstance.zoomChanged(false);

        // 9. 设置选中指定框体
        const selectedID = undefined;
        toolInstance.setSelectedID(selectedID);

        // 10. 数据暴露， exportResult 为当前结果数组的，basicImgInfo 为当前图片的宽、高、旋转角度、有无效性
        const [exportResult, basicImgInfo] = toolInstance.exportData();

        // 11. 设置当前是否可以操作
        const forbidOperation = false;
        toolInstance.setForbidOperation(forbidOperation);

        // 12. 设置当前依赖框体
        // 矩形框依赖
        annotationEngine.setBasicInfo(EToolName.Rect, {
          x: 200.91597,
          y: 157.15384,
          width: 174.88402,
          height: 227.26863,
          order: 1,
          valid: true,
          id: 'omd8QAY7',
          sourceID: '0',
          attribute: 'attribute_1',
          textAttribute: '我是文本',
        });
      };
    }
  }, []);

  return <div ref={ref} />;
};

export default App;
```

### Interface

```js
interface IImageAttribute {
  contrast: number;
  saturation: number;
  brightness: number;
  zoomRatio: number;
  isOriginalSize: boolean;
}

interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  sourceID: string;
  valid: boolean;
  order: number;
  attribute: string;
  textAttribute: string;
  disableDelete?: boolean; // 是否允许被删除
  label?: string; // 列表标签
}

interface IPolygonData {
  sourceID: string;
  id: string;
  pointList: IPolygonPoint[];
  valid: boolean;
  order: number;
  textAttribute: string;
  attribute: string;
}
```
