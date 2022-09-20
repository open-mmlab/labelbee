## DataInjectionAtCreation

### 功能

在用户创建标注数据时数据注入

### 定义

<span id='TDataInjectionAtCreateion' ></span>

```ts
declare type TDataInjectionAtCreateion = (
  data: IRect | IPolygon | IPoint | ILine | ITagResult | IBasicText,
) => {
  [a: string]: any;
};
```

### 示例

```ts
import AnnotationOperation from '@labelbee/lb-components';
import 'antd/dist/antd.css';
import '@labelbee/lb-components/dist/index.css';

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

  const dataInjectionAtCreation = (data) => {
    // data 判断注入数据

    return {
      testDataInjection: 1,
    };
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
      dataInjectionAtCreation={dataInjectionAtCreation}
    />
  );
};

export default App;
```

### 范围

现仅支持拉框工具
