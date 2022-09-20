## RenderEnhance

### 功能

在原有渲染的基础上进行渲染增强，适配更多的业务场景的扩展

### 定义

<span id='IRenderEnhance' ></span>

```ts
/**
 * 标注渲染样式
 */
declare interface IAnnotationStyle {
  strokeColor: string;
  fillColor: string;
  textColor: string;
  toolColor: any;
}

/**
 * 数据渲染增强
 */
declare interface IRenderEnhance {
  staticRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void; //
  selectedRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
  creatingRender?: (canvas: HTMLCanvasElement, data: any, style: IAnnotationStyle) => void;
}
```

### 示例

```ts
import AnnotationOperation from '@labelbee/lb-components';
import 'antd/dist/antd.css';
import '@labelbee/lb-components/dist/index.css';
import { DrawUtils } from '@labelbee/lb-annotation';

const imgUrl = ''; // 你需要更改当前图片路径 imgUrl

const imgList = [
  {
    id: 1,
    url: imgUrl,
    result: '{}',
  },
];

const step = 1;
const stepList = [
  {
    step: 1, //  当前步骤
    dataSourceStep: 0, // 当前依赖步骤，若为原图则为 0
    tool: 'rectTool', // 具体查询下方工具列表指定工具
  },
];

const App = () => {
  /**
   * 监听数据提交操作： 翻页
   * @param {IFileItem[]} data 当前提交的数据
   * @param {ESubmitType} submitType 触发 onSubmit 的方向判断
   * @param {number} imgIndex 提交结果的图片下标
   */
  const onSubmit = () => {};

  const renderEnhance = {
    staticRender: (canvas, rect, style) => {
      DrawUtils.drawRectWithFill(canvas, rect, { color: style.fillColor });
    },
    selectedRender: (canvas, rect, style) => {
      DrawUtils.drawText(canvas, { x: rect.x, y: rect.y - 10 }, 'I am text', {
        color: style.textColor,
      });
      DrawUtils.drawRectWithFill(canvas, rect, { color: 'blue' });
    },
    creatingRender: (canvas, rect, style) => {
      DrawUtils.drawRectWithFill(canvas, rect, { color: 'green' });
    },
  };

  return (
    <AnnotationOperation
      imgList={imgList}
      step={step}
      stepList={stepList}
      onSubmit={onSubmit}
      style={{
        layout: {
          width: '100vw',
          height: '100vh',
        },
      }}
      renderEnhance={renderEnhance}
    />
  );
};

export default App;
```

### 范围

现仅支持拉框工具
