# Label-Bee

- author zefeng
- createTime 2021-08-31
- updateTime 2021-08-31 10:15:15

## 项目概述

Label-Bee 前端技术才有 Typescript 为基础的，基础组件基于 [antd](https://ant.design/)、[react](https://reactjs.org/) 进行开发。label-bee 采用 Monorepo 的形式进行组织，项目可以同时

| package name  | 功能                 |
| ------------- | -------------------- |
| lb-annotation | 集成标注的操作和渲染 |
| lb-components | 标注组件库           |
| lb-demo       | 快速查看的标注组件库 |

## 项目研发

### 研发前 - 项目提交代码规范

项目提交的 git 信息做到规范化，项目采用 husky 插件监听 msg commit。

### 项目初始化

```bash
git clone git@gitlab.bj.sensetime.com:label-bee/beehive.git # 拉取项目
npm i && npm run bootstrap
npm run start
```
