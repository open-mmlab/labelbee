# Sense-Annotation

Sense-Annotation 是 SenseBee 数据服务平台内部自研的标注绘图框架，能快速提供检测、分割、分类等标注操作。

## 📦 Install

```bash
# NPM
$ npm install @sensetime/annotation --registry=https://npm-registry.sensetime.com

# YARN
$ yarn add label-bee --registry=https://npm-registry.sensetime.com

# .npmrc
@sensetime:registry=https://npm-registry.sensetime.com
```

## Usage

```ts
import React, { useEffect } from 'react';
import { toolUtils } from '@sensetime/annotation';

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

const imgSrc =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Andre_Iguodala_2016.jpg/1200px-Andre_Iguodala_2016.jpg';

const rectConfigString = JSON.stringify({
  minWidth: 1,
  minHeight: 1,
  isShowOrder: true,
  attributeConfigurable: true,
  attributeList: [
    { key: '类别x1', value: 'class-x1' },
    { key: '类别Hl', value: 'class-Hl' },
    { key: '类别J5', value: 'class-J5' },
    { key: '类别ve', value: 'class-ve' },
    { key: '类别oJ', value: 'class-oJ' },
    { key: '类别qz', value: 'class-qz' },
    { key: '类别0x', value: 'class-0x' },
    { key: '类别Hv', value: 'class-Hv' },
  ],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
  drawOutsideTarget: false,
  copyBackwardResult: false,
});

const styleConfig = {
  toolColor: {
    1: {
      valid: { stroke: 'rgba(0,0,255,0.50)', fill: 'rgba(0,0,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(0,15,255,1.00)', fill: 'rgba(0,15,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(0,15,255,0.80)', fill: 'rgba(0,15,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    3: {
      valid: { stroke: 'rgba(0,255,255,0.50)', fill: 'rgba(0,255,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(0,212,255,1.00)', fill: 'rgba(0,212,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(0,212,255,0.80)', fill: 'rgba(0,212,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    5: {
      valid: { stroke: 'rgba(0,255,0,0.50)', fill: 'rgba(0,255,0,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(149,255,1.00)', fill: 'rgba(149,255,0,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(149,255,0,0.80)', fill: 'rgba(149,255,0,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    7: {
      valid: { stroke: 'rgba(255,255,0,0.50)', fill: 'rgba(255,255,0,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(255,230,102,1.00)', fill: 'rgba(255,213,0,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(255,230,102,0.80)', fill: 'rgba(255,230,102,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    9: {
      valid: { stroke: 'rgba(255,0,255,0.50)', fill: 'rgba(255,0,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(230,102,255,1.00)', fill: 'rgba(213,0,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(230,102,255,0.80)', fill: 'rgba(230,102,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
  },
  attributeColor: [
    {
      valid: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
  ],
  lineColor: {
    1: 'rgba(102, 111, 255, 1 )',
    3: 'rgba(102, 230, 255, 1)',
    5: 'rgba(191, 255, 102, 1)',
    7: 'rgba(255, 230, 102, 1)',
    9: 'rgba(230, 102, 255, 1)',
  },
  attributeLineColor: [
    'rgba(204, 204, 204, 1)',
    'rgba(153, 51, 255, 1)',
    'rgba(51, 254, 51, 1)',
    'rgba(255, 51, 255, 1)',
    'rgba(204, 255, 51, 1)',
    'rgba(51, 153, 255, 1)',
    'rgba(255, 153, 51, 1)',
    'rgba(51, 255, 238, 1)',
    'rgba(255, 221, 51, 1)',
  ],
  color: 1,
  width: 2,
  opacity: 9,
};

const App = () => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      const imgNode = new Image();
      imgNode.src = imgSrc;
      imgNode.onload = () => {
        // 获取当前工具的类
        const ToolOperation = toolUtils.getCurrentOperation('rectTool');

        const toolInstance = new ToolOperation({
          container: ref.current,
          size: {
            width: 1000,
            height: 600,
          },
          imgNode,
          config: rectConfigString,
          style: styleConfig,
        });

        // 初始化当前的工具
        if (toolInstance?.init) {
          toolInstance.init();
        }

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
      };
    }
  }, []);

  return <div ref={ref} />;
};

export default App;
```
