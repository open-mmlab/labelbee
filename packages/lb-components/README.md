# Label Bee

Label-Bee 是 SenseBee 数据服务平台内部自研的标注 SDK。基于现有标注业务开发的一款简单易用的标注模块，支持拉框、标签、多边形等标注工具。开发者可根据需求配置，快速实现多种标注功能。

## 📦 Install

```bash
# NPM
$ npm install @sensetime/label-bee --registry=https://npm-registry.sensetime.com

# YARN
$ yarn add @sensetime/label-bee --registry=https://npm-registry.sensetime.com

# .npmrc
@sensetime:registry=https://npm-registry.sensetime.com
```

## 🔗 Examples

- [bee-sdk-demo](https://gitlab.bj.sensetime.com/label-bee/beehive/blob/dev/packages/lb-demo/README.md)
- [客户端下载链接](http://file.intra.sensetime.com/d/cc7d831d9f/)

## 🔨 Usage

- [AnnotationOperation](./docs/annotation.md)
- [AnnotationView](./docs/annotationView.md)


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
