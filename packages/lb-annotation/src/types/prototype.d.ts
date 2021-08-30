interface CanvasRenderingContext2D {
  /**
   * 用于 canvas 绘制可换行文字
   * @param {string} text 绘制的内容
   * @param {number} x 绘制起点的x坐标
   * @param {number} y 绘制起点的y坐标
   * @param {number | undefined} maxWidth 每行最大宽度
   * @param {number | undefined} lineHeight 每行高度
   */
  wrapText: (text: string, x: number, y: number, maxWidth?: number, lineHeight?: number) => void;
}

declare interface Canvas {
  CanvasRenderingContext2D: CanvasRenderingContext2D;
}
