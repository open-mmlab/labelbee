 简体中文

# renderEnhance 渲染增强函数

> 为数据提供渲染增强能力，当你不满足于当前的渲染情况，想要自己动手进行扩展时，renderEnhance给你提供所有可能用到的属性和数据，在每次获取渲染的时候都会执行，所以需要注意renderEnhance的执行时间和性能，以免造成卡顿。

## Examples

```ts
import { AnnotationView } from '@labelbee/lb-components';

const src = ''; // 可访问的图片路径

const data=[{
    type: 'rect',
    annotation: {
      id: 'g5r2l7mcrv8',
      x: 60,
      y: 260,
      width: 100,
      height: 100,
      stroke: 'pink',
      name: 'Bag',
      renderEnhance: (params) => {
        console.log(params);
        const {
          ctx,
          data: { annotation },
          zoom,
          currentPos,
        } = params;

        ctx.fillStyle = annotation.stroke;

        ctx.fillRect(
          annotation.x * zoom + currentPos.x - 2,
          annotation.y * zoom + currentPos.y - 20 * zoom,
          40 * zoom,
          20 * zoom,
        );
        ctx.strokeStyle = 'white';
        ctx.strokeText(
          annotation.name,
          annotation.x * zoom + currentPos.x + 6 * zoom,
          annotation.y * zoom + currentPos.y - 7 * zoom,
        );
      },
    },
  }]

const DemoComponent = () => {
  return (
    <AnnotationView
     src={src}
     annotations={data}
   />
  )
}

export default DemoComponent;
```

## API

| 参数         | 说明                                                         | 类型                            |                             默认                             |
| ------------ | ------------------------------------------------------------ | ------------------------------- | :----------------------------------------------------------: |
| ctx          | 当前canvas的上下文，有了上下文，您就可以绘制任何喜欢的东西   | CanvasRenderingContext2D \|null |                             null                             |
| canvas       | 当前canvas标签的dom节点                                      | HTMLCanvasElement\|null         |                             null                             |
| currentPos   | 当前位置信息 ，x、y是二维平面上，画布距离 canvas 左上角，偏移的坐标，可用来计算新的位置信息 | ICoordinate                     |                         {x: 0, y: 0}                         |
| zoom         | 当前缩放比例，判断渲染时当前坐标的转换，例如可以根据currentPos和zoom建一个跟随框或文字 | number                          |                              1                               |
| data         | 当前渲染的数据，详情请见外层的的定义 - [AnnotationView 标注查看模式](./annotationView.md) | IAnnotationData                 | eg:{type: "rect",annotation: {id: 'g5r2l7mcrv8', x: 60, y: 260, width: 100, height: 100, …}} |
| toolInstance | 当前标注工具实例，可以拿到当前实例的所有信息，除了上面的属性，还有绘制过程中用到的所有属性和数据，例如可以从toolInstance.annotations拿到所有标注数据 | ViewOperation                   |                              {}                              |


### Type

```ts
declare interface IRenderEnhanceParams {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  currentPos: ICoordinate;
  zoom: number;
  data: IAnnotationData;
  toolInstance: ViewOperation;
}
```

