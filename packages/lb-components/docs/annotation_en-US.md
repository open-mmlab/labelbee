English | [简体中文](./annotation.md)

# AnnotationOperation

Contains the entire annotation process, supports a series of basic annotation such as annotation, image drag and drop zoom, image adjustment, page turning, data error checking, etc.

## Type

```ts
enum ESubmitType {
  Backward = 1,
  Forward = 2,
  Jump = 3,
  Quit = 4,
  Export = 5,
  StepChanged = 6,
  Save = 7,
  BatchUpdateTrackID = 8,
  SyncImgList = 10001, 
  SyncCurrentPageData = 10002, // 同步当页数据
}

interface IFileItem {
  id: number;
  url?: string;
  result?: string;
}
```

## Quick Start

```ts
import AnnotationOperation from '@labelbee/lb-components';
import 'antd/dist/antd.css';
import '@labelbee/lb-components/dist/index.css';

const imgUrl = ''; // You need to change imgUrl

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
    />
  );
};

export default App;
```

## Full configuration

```ts
import AnnotationOperation from '@labelbee/lb-components';
import 'antd/dist/antd.css';
import '@labelbee/lb-components/dist/index.css';

const imgUrl = ''; // You need to change imgUrl

const imgList = [
  {
    id: 1,
    url: imgUrl,
    result: '',
  },
];

const step = 1; // 标注当前的步骤
const rectConfigString = JSON.stringify({
  minWidth: 1,
  minHeight: 1,
  isShowOrder: true,
  attributeConfigurable: true,
  attributeList: [
    { key: '类别x1', value: 'class-x1' },
    { key: '类别Hl', value: 'class-Hl' },
  ],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
  drawOutsideTarget: false,
  copyBackwardResult: false,
});

const stepList = [
  {
    step: 1, //  当前步骤
    dataSourceStep: 0, // 当前依赖步骤，若为原图则为 0
    tool: 'rectTool', // 具体查询下方工具列表指定工具
    config: rectConfigString,
  },
];

const style = {
  layout: {
    width: '100vw',
    height: '100vh',
  },
  header: {},
  sider: {},
  footer: {},
};

const App = () => {
  /**
   * 监听数据提交操作： 翻页 / 导出所有数据
   * @param {IFileItem[]} data 当前提交的数据
   * @param {ESubmitType} submitType 触发 onSubmit 的方向判断
   * @param {number} imgIndex 提交结果的图片下标
   */
  const onSubmit = () => {};

  /**
   * 点击保存按钮时触发
   * @param {IFileItem[]} data 当前提交的数据
   * @param {ESubmitType} submitType 触发 onSubmit 的方向判断
   * @param {number} imgIndex 提交结果的图片下标
   */
  const onSave = () => {};

  const goBack = () => {
    // 页面内自带跳转的回调函数, data 表示整个任务的所有标注信息
  };

  /**
   * 在文件切换时触发，将回传的数据写入的到nextIndex
   * @param {IFileItem} nextFileData 下一个文件的数据 (imgList[index])
   * @param {string} nextIndex 下一个文件的索引
   * @returns {PromiseLike<{ result?: string, url: string }>} promise需要返回对应文件数据
   *
   * 示例:
   *  getFileData={(fileData, index) => {
   *     return new Promise((reslove) => {
   *        reslove({
   *           url: urlForFile
   *           result: resultForFile,
   *        });
   *     });
   *  }}
   *
   *  const childrenRef = React.useRef()
   *  childrenRef.current = {
   *     工具实例
   *    toolInstance,
   *    图片的切换
   *    pageBackwardActions,     () => void
   *    pageForwardActions,      () => void
   *    pageJump                 (pageNumber: number) => void
   *  }
   *  ref 可以拿到工具的实例 可以在外部调用一些工具方法  比如 旋转 撤销  重做 等
   */

  /**
   * assign to DOM or function to return DOM
   * @headerDomObject {backNode,headerNameNode,stepListNode,headerOptionNode,langNode,} *header internal components
   * @return {React.ReactNode}
   */
  const header = ({
    backNode,
    headerNameNode,
    stepListNode,
    headerOptionNode,
    langNode,
  }: {
    backNode: React.ReactNode;
    headerNameNode: React.ReactNode;
    stepListNode: React.ReactNode;
    headerOptionNode: React.ReactNode;
    langNode: React.ReactNode;
  }): React.ReactNode => {
    <>
      {backNode}
      {headerNameNode}
      {stepListNode}
      {currentOption}
      {langNode}
    </>;
  };

  /**
   * assign to DOM or function to return DOM
   * @siderDomObject {toolIcon,attributeList,annotationText,toolStyle,imageAttributeInfo, operation,tagToolSideBar,textToolSideBar,horizontal} *sider internal components
   * @return {React.ReactNode}
   */
  const sider = ({
    toolIcon,
    attributeList,
    annotationText,
    toolStyle,
    imageAttributeInfo,
    operation,
    tagToolSideBar,
    textToolSideBar,
    horizontal,
  }: {
    toolIcon: React.ReactNode;
    attributeList: React.ReactNode;
    annotationText: React.ReactNode;
    toolStyle: React.ReactNode;
    imageAttributeInfo: React.ReactNode;
    operation: React.ReactNode;
    tagToolSideBar: React.ReactNode;
    textToolSideBar: React.ReactNode;
    horizontal: React.ReactNode;
  }): React.ReactNode => {
    <>
      {attributeList}
      {toolStyle}
      {imageAttributeInfo}
    </>;
  };

  /**
   * assign to DOM or function to return DOM
   * @footerDomObject {footerTips,hiddenTips,pageNumber,pagination,zoomController, curItems,footerDivider,} *footer internal components
   * @return {React.ReactNode}
   */
  const footer = ({
    footerTips,
    hiddenTips,
    pageNumber,
    pagination,
    zoomController,
    curItems,
    footerDivider,
  }: {
    footerTips: React.ReactNode;
    hiddenTips: React.ReactNode;
    pageNumber: React.ReactNode;
    pagination: React.ReactNode;
    zoomController: React.ReactNode;
    curItems: React.ReactNode;
    footerDivider: React.ReactNode;
  }): React.ReactNode => {
    <>
      {pageNumber}
      {footerDivider}
      {pagination}
      {footerDivider}
      {curItems}
    </>;
  };
  /**
   * 每次页面获取
   * @param {IFileItem} nextFileData
   * @param {number} nextIndex
   */
  const getFileData = () => {};
  return (
    <AnnotationOperation
      //  ref={childrenRef}
      onSubmit={onSubmit}
      onSave={onSave}
      imgList={imgList}
      step={step}
      stepList={stepList}
      goBack={goBack}
      getFileData={getFileData}
      headerName='任务标题' // 不写则隐藏标题
      initialIndex={0} // 仅在初始化时使用，表示当前图片 index，默认为：0.
      // 支持覆盖 侧边栏 传入组件的形式
      sider={sider} // 传入 null 则隐藏
      footer={footer} // 传入 null 则隐藏
      header={header} // 传入 null 则隐藏
      className='layout' // 组件默认宽高为 100vw 100vh，若需修改这通过 className 更改样式 or style 的 layout 进行更改
      style={style}
    />
  );
};

export default App;
```

| Params                                                             | Description                       | Required | Type                                                                                           |
| ------------------------------------------------------------------ | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| imgList                                                            | list of annotation                | 是       | IFileItem[]                                                                                    |
| step                                                               | current step                      | 是       | Number                                                                                         |
| stepList                                                           | the config of each step           | 是       | stepList                                                                                       |
| ref                                                                | ForwardRef                        | 否       |                                                                                                |
| onSubmit                                                           | listen the page turning or submit | 否       | onSubmit                                                                                       |
| onSave                                                             | listen the click of save-button   | 否       | onSave                                                                                         |
| goBack                                                             | listen the click of 'goBack'      | 否       | goBack                                                                                         |
| getFileData                                                        | Support external file data        | 否       | getFileData                                                                                    |
| headerName                                                         | headerName                        | 否       | string                                                                                         |
| initialIndex                                                       | initial Index in imgList          | 否       | number                                                                                         |
| exportData                                                         | exportData                        | 否       | ReactNode                                                                                      |
| header                                                             | header                            | 否       | (headerDomObject) => React.ReactNode ｜ ReactNode                                              |
| footer                                                             | footer                            | 否       | (footerDomObject) => React.ReactNode ｜ ReactNode                                              |
| sider                                                              | sider                             | 否       | (siderDomObject) => React.ReactNode ｜ ReactNode                                               |
| [renderEnhance](./annotation/renderEnhance.md)                     | 标注渲染样式                      | 否       | [IRenderEnhance](./annotation/renderEnhance.md#IRenderEnhance)                                 |
| [dataInjectionAtCreation](./annotation/dataInjectionAtCreation.md) | 在用户创建标注数据时数据注入      | 否       | [TDataInjectionAtCreateion](./annotation/dataInjectionAtCreation.md#TDataInjectionAtCreateion) |
| customRenderStyle                                                  | 自定义样式                        | 否       | (data) => return { strokeColor: 'red';fillColor: 'blue';textColor:'green';}                    |
| style                                                              | the style of annotation           | 否       | Object                                                                                         |
| className                                                          | className                         | 否       | string                                                                                         |
| defaultLang                                                        | default language                  | 否       | 'en' \| 'cn'                                                                                   |

```ts
/* 下方为不同工具配置, 为切换不同工具参考 */
// 标签工具参考配置
const tagConfigString = JSON.stringify({
  showConfirm: true,
  skipWhileNoDependencies: false,
  inputList: [
    {
      key: '类别1',
      value: 'class1',
      isMulti: false,
      subSelected: [
        { key: '选项1', value: 'option1', isDefault: false },
        { key: '选项2', value: 'option1-2', isDefault: false },
      ],
    },
    {
      key: '类别2',
      value: 'class-AH',
      isMulti: true,
      subSelected: [
        { key: '选项2-1', value: 'option2-1', isDefault: true },
        { key: '选项2-2', value: 'option2-2', isDefault: false },
        { key: '选项2-3', value: 'option2-3', isDefault: false },
      ],
    },
    {
      key: '类别3',
      value: 'class-0P',
      isMulti: false,
      subSelected: [
        { key: '选项3-1', value: 'option3-1', isDefault: false },
        { key: '选项3-2', value: 'option3-2', isDefault: false },
        { key: '选项3-3', value: 'option3-3', isDefault: false },
      ],
    },****
  ],
});

// 多边形工具参考配置
const polygonConfigString = JSON.stringify({
  lowerLimitPointNum: 3,
  upperLimitPointNum: 20, // 可以填写
  edgeAdsorption: true,

  drawOutsideTarget: false,
  copyBackwardResult: false,
  attributeConfigurable: true,
  attributeList: [
    { key: '类别x1', value: 'class-x1' },
    { key: '类别tT', value: 'class-tT' },
    { key: '类别FM', value: 'class-FM' },
    { key: '类别r6', value: 'class-r6' },
    { key: '类别Rs', value: 'class-Rs' },
    { key: '类别rp', value: 'class-rp' },
    { key: '类别rp2', value: 'class-rp2' },
    { key: '类别rp3', value: 'class-rp3' },
    { key: '类别Rs4', value: 'class-Rs4' },
    { key: '类别rp5', value: 'class-rp5' },
  ],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',

  isShowOrder: false,
  lineType: 0,
  lineColor: 0,
});
```

## Tool configuration details

```ts
// 拉框工具配置
declare interface IRectConfig {
  minWidth: number; // 最小宽度
  minHeight: number; // 最小高度

  drawOutsideTarget: boolean; // 是否可以在图外进行标注，默认为否
  copyBackwardResult: boolean; // 是否开启复制上一张
  attributeConfigurable: boolean; // 是否开启属性标注, 配合 attributeList 使用
  attributeList: IInputList[]; // 属性配置独有
  textConfigurable: boolean; // 是否开启文本标注
  textCheckType: ETextType; // 文本检查类型
  customFormat: string; // 文本检查类型: ETextType.CustomFormat 配合使用
  isShowOrder: boolean; // 是否显示序号，（仅用于显示，默认数据中会携带）
}

// 标签工具配置
declare interface ITagConfig {
  inputList: IInputList[]; // 标签工具配置
}

// 多边形工具配置
declare interface IPolygonToolConfig {
  lowerLimitPointNum: number; // 下限点个数, 最小为 3
  upperLimitPointNum?: number; // 上限点个数, 不填写则无上限
  edgeAdsorption: boolean; // 是否支持边缘吸附

  drawOutsideTarget: boolean; // 是否可以在图外进行标注，默认为否
  copyBackwardResult: boolean; // 是否开启复制上一张
  attributeConfigurable: boolean; // 是否开启属性标注, 配合 attributeList 使用
  attributeList: IInputList[]; // 属性配置独有

  // 下方配置暂不支持
  textConfigurable: boolean; // 是否开启文本标注
  textCheckType: ETextType; // 文本检查类型
  customFormat: string; // 文本检查类型: ETextType.CustomFormat 配合使用
  isShowOrder?: boolean; // 是否显示序号，（仅用于显示，默认数据中会携带）
  lineType: ELineTypes; // 线条类型$$
  lineColor: ELineColor; // 线条颜色
}
```

```ts
/* 其他类型 */

declare interface IInputList {
  key: string; // 展示值
  value: string; // 写入结果值
  isMulti?: boolean; // 仅用于标签工具
  subSelected?: Array<{
    // 仅用于标签工具
    key: string; // 展示值
    value: string; // 写入结果值
    isDefault?: boolean; // 是否默认写入
  }>;
}

// 文本标注类型
export enum ETextType {
  AnyString = 0, // 任意字符
  Order = 1, // 序号
  EnglishOnly = 2, // 仅英文
  NumberOnly = 3, // 仅数字
  CustomFormat = 4, // 自定义文本格式
}

/** 线条类型 */
export declare enum ELineTypes {
  Line = 0, // 直线
  Curve = 1, // 曲线
}

/** 线条颜色 */
export declare enum ELineColor {
  SingleColor = 0, // 单色
  MultiColor = 1, // 多色
}
```
