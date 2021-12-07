<div align="center">
  <article style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <p align="center"><img width="300" src="./docs/assets/logo.svg" /></p>
      <h1 style="width: 100%; text-align: center;">LabelBee</h1>
      <p>为标注而生，专注于标注体验的渲染、组件库。快速搭建标注应用。</p>
  </article>
  <a href="./README_en-US.md">English</a> | 简体中文

</div>

## 特性

- 即拆即用，简单配置即可创建标注应用
- 渲染分离，可单独使用渲染模块


## 安装

```bash
# npm
npm install @labelbee/lb-annotation
npm install @labelbee/lb-components

# yarn
yarn add @labelbee/lb-annotation
yarn add @labelbee/lb-components
```


## 使用

快速开始例子

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { AnnotationView } from '@labelbee/lb-components';

const src = ''; // 可访问的图片路径

const DefaultComponent = () => {
  return (
    <AnnotationView
     src={src}
   />
  )
}

ReactDOM.render(<App />, document.querySelector('#app'));
```

## 文档

- [LabelBee 渲染库 - lb-Annotation](./packages/lb-annotation/README.md)
- [LabelBee 组件库 - lb-components](./packages/lb-components/README.md)
- [快速 DEMO 展示](./packages/lb-demo/README.md)

## 友情链接

- [LabelBee-Client](https://github.com/open-mmlab/labelbee-client)

## LICENSE

该项目使用 [Apache 2.0 license](./LICENSE).
