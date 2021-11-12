import AxisUtils from '@/utils/tool/AxisUtils';

class DblClickEventListener {
  private dom: HTMLElement; // 点击时间绑定的对象

  private setTimeFun?: any; // 延迟的函数

  private clickCoord: any; // 记录双击第一次的位置，用于延迟加载的加速操作

  private isDoubleClick: boolean; // 用于判断是否有进行双击

  private rcTime = 0; // 用于监听右键时间的双击判断

  private delay: number; // 进行延迟

  private mouseUp: any; // 存储点击事件

  private mouseMove: any; // 存储鼠标移动事件

  private dblclick: any; // 用于左键的双击监听

  private cacheFunction: any; // 用于存储左键的事件的缓存

  private mouseDownTime = 0; // 用于缓解 down

  constructor(dom: HTMLElement, delay: number) {
    this.dom = dom;
    this.isDoubleClick = false;
    this.delay = delay;
  }

  public getRcTime() {
    return this.rcTime;
  }

  /**
   * 获取当前的坐标，用于点击位置的快速获取
   *
   * @param {MouseEvent} e
   * @returns
   * @memberof DblClickEventListen
   */
  public getCoord(e: MouseEvent) {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }

  /**
   * 删除绑定事件
   *
   * @returns
   * @memberof DblClickEventListen
   */
  public removeEvent() {
    if (!this.dom) {
      return;
    }
    this.dom.removeEventListener('mouseup', this.mouseUp);
    this.dom.removeEventListener('mousemove', this.mouseMove);
    this.dom.removeEventListener('dblclick', this.dblclick);
    this.dom.removeEventListener('mousedown', this.onMouseDown);
  }

  public onMouseDown = () => {
    this.mouseDownTime = new Date().getTime();
  };

  /**
   * 用于添加鼠标单击事件， 左键双击事件，右键双击事件
   *
   * @param {*} singleClickFun
   * @param {*} leftDblClick
   * @param {*} rightDblClick
   * @param {*} isAllowDouble 是否允许执行 double click，如果为 true 则进行的延迟，否则将立即执行，增加操作流畅性
   * @returns {void}
   * @memberof DblClickEventListen
   */
  public addEvent(
    singleClickFun: any,
    leftDblClick: any,
    rightDblClick: any,
    isAllowDouble?: (e: any) => boolean,
  ): void {
    if (!this.dom) {
      return;
    }

    this.removeEvent();
    this.mouseUp = (e: MouseEvent) => {
      const cTime = new Date().getTime();

      const isDoubleClick = isAllowDouble ? isAllowDouble(e) : true;

      // down 和 up 超过 delay 时间直接判断为点击事件
      if (cTime - this.mouseDownTime > this.delay || isDoubleClick !== true) {
        singleClickFun(e);
        return;
      }

      // 右键双击的判断
      if (e.button === 2) {
        if (this.rcTime === 0) {
          // 初始化右键右键事件
          setTimeout(() => {
            this.rcTime = 0;
          }, this.delay);
          this.rcTime = cTime;
        } else {
          if (cTime - this.rcTime < this.delay) {
            // 双击右键操作
            rightDblClick(e);
            clearTimeout(this.setTimeFun);
            this.cacheFunction = undefined; // 关键，清除双击右键触发单击右键的关键
          }
          this.rcTime = 0;
          return;
        }
      }

      if (this.setTimeFun) {
        clearTimeout(this.setTimeFun); // 清除事件，防止多次执行
      }

      this.clickCoord = this.getCoord(e); // 记录
      this.cacheFunction = () => singleClickFun(e); // 事件存储

      this.setTimeFun = setTimeout(() => {
        if (this.isDoubleClick) {
          // 判断是否为双击事件
          this.isDoubleClick = false;
          return;
        }
        this.cacheFunction();

        // 执行函数
        this.clickCoord = undefined;
      }, this.delay);
    };

    // 用于单击事件的加速运行
    this.mouseMove = (e: MouseEvent) => {
      const currentCoord = this.getCoord(e);

      // 如果超出一定的范围，则判断为单击事件
      if (this.clickCoord && !AxisUtils.getIsInScope(currentCoord, this.clickCoord, 10)) {
        if (this.cacheFunction) {
          this.cacheFunction();
        }
        this.clickCoord = undefined;
        this.cacheFunction = null;
        clearTimeout(this.setTimeFun);
      }
    };

    // 左键双击判断
    this.dblclick = (e: MouseEvent) => {
      // 进入多边形的编辑模式
      this.isDoubleClick = true;
      this.clickCoord = undefined;
      leftDblClick(e);
    };

    this.dom.addEventListener('mouseup', this.mouseUp);
    this.dom.addEventListener('mousemove', this.mouseMove);
    this.dom.addEventListener('dblclick', this.dblclick);
    this.dom.addEventListener('mousedown', this.onMouseDown);
  }

  public clearRightDblClick() {
    this.rcTime = 0;
  }
}

export default DblClickEventListener;
