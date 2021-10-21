# Label Bee

Label-Bee 是 SenseBee 数据服务平台内部自研的标注 SDK。基于现有标注业务开发的一款简单易用的标注模块，支持拉框、标签、多边形等标注工具。开发者可根据需求配置，快速实现多种标注功能。

## 📦 Install

```bash
# NPM
**$** npm install @sensetime/label-bee --registry=https://npm-registry.sensetime.com

# YARN
$ yarn add @sensetime/label-bee --registry=https://npm-registry.sensetime.com

# .npmrc
@sensetime:registry=https://npm-registry.sensetime.com
```

## 🔗 Examples

- [bee-sdk-demo](https://gitlab.bj.sensetime.com/luozefeng/bee-sdk-demo)

## 🔨 Usage

```ts
import AnnotationOperation from '@sensetime/label-bee';
import '@sensetime/label-bee/dist/index.css';


// 用于触发 onSubmit 的方向判断
enum ESubmitType {
  Backward = 1, // 向前翻页
  Forward = 2, // 向后翻页
  Jump = 3, // 分页器的跳页翻页
  Quit = 4, // 左上角后退触发
  Export = 5, // 数据导出时
}

interface IData {
   id: number;
   url?: string;
   result?: string;
}

/**
 * @property {number} id
 * @property {url} 图片路径;参数可选时，需要传入getFileData
 * @property {result} 标注结果字符串，详情请内网访问:https://resultdoc.sensebee.xyz/;参数可选时,需要传入getFileData
*/
const fileList: IData[] = [
   {
      id: 1,
      url: '',
      result: '',
   }
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
const stepList = [
   {
      step: 1, //  当前步骤
      dataSourceStep: 0, // 当前依赖步骤，若为原图则为 0
      tool: 'rectTool', // 具体查询下方工具列表指定工具
      config: rectConfigString,
   }
];

const style = {
  layout: {},
  header: {},
  sider: {},
  footer: {}
};

const App = () => {
   /**
    * 监听数据提交操作： 翻页 / 导出所有数据
    * @param {IData[]} data 当前提交的数据
    * @param {ESubmitType} submitType 触发 onSubmit 的方向判断
    * @param {number} imgIndex 提交结果的图片下标
   */
   const onSubmit = (data: IData[], submitType: ESubmitType, imgIndex: number) => {};
   const onSave = (data: IData, submitType: ESubmitType, imgIndex: number, datas: Idata[]) => {};

   const goBack = (data: IData[]) => {
      // 页面内自带跳转的回调函数, data 表示整个任务的所有标注信息
   }

   /**
    * 在文件切换时触发，将回传的数据写入的到nextIndex
    * @param {IData} nextFileData 下一个文件的数据 (imgList[index])
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
    *
    *
    *
   */
   const getFileData = (nextFileData: IFileItem, nextIndex: number) => {}
   return (
      <AnnotationOperation
         ref={childrenRef}
         onSubmit={onSubmit}
         onSave={onSave}
         imgList={imgList}
         step={step}
         stepList={stepList}
         goBack={goBack}
         getFileData={getFileData}
         headerName="任务标题" // 不写则隐藏标题
         exportData={} // 不写则隐藏导出按钮
         initialIndex={0} // 仅在初始化时使用，表示当前图片 index，默认为：0.
          // 支持覆盖 侧边栏 传入组件的形式
         header = {<Header>};
         footer = {<Footer>};
         sider = {null}; // 传入 null 则隐藏
         className='layout' // 组件默认宽高为 100vw 100vh，若需修改这通过 className 更改样式 or style 的 layout 进行更改
         style={style}
      />
   );
}

export default App;
```

| 参数         | 说明                                        | 是否必填 | 类型 ↑↑↑↑↑↑ |
| ------------ | ------------------------------------------- | -------- | ----------- | -------- |
| imgList      | 标注文件对象                                | 是       | IFileItem   |
| step         | 标注当前的步骤                              | 是       | Number      |
| stepList     | 所有步骤和 step 关联                        | 是       | stepList    | stepList |
| ref          | 工具类 可以调用工具内部方法                 | 否       |             |
| onSubmit     | 翻页 保存的时候触发 data 表示当前标注的信息 | 否       | onSubmit    |
| onSave       | 保存的时候触发 data 表示当前标注的信息      | 否       | onSave      |
| goBack       | 页面内自带跳转的回调函数                    | 否       | goBack      |
| getFileData  | 支持外部传入获取文件接口                    | 否       | getFileData |
| headerName   | 标题                                        | 否       | string      |
| exportData   | 导出按钮 不写则隐藏导出按钮                 | 否       | {}          |
| initialIndex | 当前图片列表的 index 初始化时候使用         | 否       | number      |
| header       | 顶部菜单                                    | 否       | RectNote    |
| footer       | footer                                      | 否       | RectNote    |
| sider        | 侧边栏                                      | 否       | RectNote    |
| style        | 工具栏样式                                  | 否       | Object      |
| className    | className                                   | 否       | string      |

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
    },
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

## 工具配置详情

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
  lineType: ELineTypes; // 线条类型
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

## 工具列表

### 现已支持

- `rectTool` 拉框工具
- `tagTool`  标签工具
- `polygonTool` 多边形工具
- `pointTool` 标点工具
- `textTool`文本工具
- `lineTool` 线条工具

### 暂不支持

- `segmentationTool` 前景分割工具
- `pointMarkerTool`  列表标点工具
- `filterTool`  筛选工具
- `lineMarkerTool` 列表线条工具
- `folderTagTool` 文件夹标签工具
- `videoTextTool` 视频文本工具
- `videoTagTool` 视频标签工具
- `videoClipTool`  视频截取工具
- `rectTrackTool` 拉框跟踪工具
