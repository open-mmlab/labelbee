# Polygon 多边形工具 - 功能使用介绍

## 多边形模式转换

现有的多边形支持两种模式进行编程:

1. 正常标注模式
2. 矩形模式

```ts
/**
 *  多边形的标注模式
 */
export enum EPolygonPattern {
  Normal,
  Rect,
}
```

## 使用方式

### 1. 切换模式

```ts
import { cTool } from '@labelbee/lb-annotation';

const { EPolygonPattern } = cTool;

// 设置为矩形模式
toolInstance.setPattern(EPolygonPattern.Rect);

// 设置为普通模式
toolInstance.setPattern(EPolygonPattern.Normal);
```

### 2. 旋转当前多边形

```ts
import { cAnnotation } from '@labelbee/lb-annotation';

const { ERotateDirection } = cAnnotation;

toolInstance.rotatePolygon();
```

#### toolInstance.rotatePolygon

| 参数      | 说明      | 是否必填 | 类型             |            默认            |
| --------- | --------- | -------- | ---------------- | :------------------------: |
| angle     | 旋转角度  | 否       | number           |             1              |
| direction | 旋转方向  | 否       | ERotateDirection | ERotateDirection.Clockwise |
| id        | 多边形 ID | 否       | string           |       当前选中多边形       |
