import TagUtils from '../../utils/tool/TagUtils';
import uuid from '../../utils/uuid';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';
import { CommonToolUtils } from '@/';

interface ITagOperationProps extends IBasicToolOperationProps {
  config: string;
}

class TagOperation extends BasicToolOperation {
  public config: ITagConfig;

  public tagResult: ITagResult[]; // 当前图片下所有的标签集合

  public labelSelectedList: number[]; // 用于展示侧边栏标签选中高亮状态

  public sourceID: string; // 表示当亲标签工具的依赖

  constructor(props: ITagOperationProps) {
    super(props);
    this.config = CommonToolUtils.jsonParser(props.config);
    this.tagResult = [];
    this.labelSelectedList = [];
    this.sourceID = '';

    // 设置默认 cursor
    this.setShowDefaultCursor(true);
  }

  public setResult(tagResult: any[], isInitData = false) {
    if (isInitData === true) {
      // 注意，该获取方式是需要拉取所有的 basicResultList
      tagResult = TagUtils.getDefaultTagResult(this.config.inputList, []);
    }

    this.tagResult = tagResult;
    this.render();
  }

  public get currentTagResult() {
    return this.tagResult.filter((v) => {
      const basicSourceID = `${v.sourceID}`;
      return basicSourceID === this.sourceID;
    })[0];
  }

  public onKeyDown(e: KeyboardEvent) {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      return;
    }

    let { keyCode } = e;

    if (keyCode) {
      if ((keyCode <= 57 && keyCode >= 49) || (keyCode <= 105 && keyCode >= 97)) {
        if (keyCode > 57) {
          keyCode -= 97;
        } else {
          keyCode -= 49;
        }

        // 数字键 0 - 9 48 - 57 / 97 - 105
        // 数字键检测
        if (this.config.inputList.length === 1) {
          // 说明标签只有一层
          this.labelSelectedList = [0, keyCode];
          this.setLabel(0, keyCode);
          setTimeout(() => {
            this.labelSelectedList = [];
            this.render();
          }, 500);

          return;
        }

        if (this.labelSelectedList.length === 1) {
          this.labelSelectedList = [this.labelSelectedList[0], keyCode];
          this.setLabel(this.labelSelectedList[0], keyCode);
          setTimeout(() => {
            this.labelSelectedList = [];
            this.render();
          }, 500);
        } else {
          this.labelSelectedList = [keyCode];
          this.emit('expend');
        }
      }
    }
  }

  // 打标签
  // i j 表示 标签set 的index, 0 开始
  // 注意： 单图模式（无框）下，selectedList 就为 [0]
  public setLabel = (i: number, j: number) => {
    if (this.isImgError) {
      return;
    }

    const labelInfoSet = this.config.inputList;

    if (!labelInfoSet[i]) {
      return;
    }

    /**
     *  注意：这里固定如果依赖原图的话 sourceID 就指定为  '0'
     *  2021-08-26 改成  ‘’
     *  */
    const { subSelected } = labelInfoSet[i];

    // 需要判断 i j 是否能找到 labelInfoSet 的值
    if (i < labelInfoSet.length && labelInfoSet[i].subSelected && subSelected && j < subSelected.length) {
      const key = labelInfoSet[i].value;
      let value = subSelected[j]?.value;
      const isMulti = labelInfoSet[i]?.isMulti;

      const basicTagResult = this.tagResult.filter((v) => {
        const basicSourceID = `${v.sourceID}`;
        return basicSourceID === this.sourceID;
      })[0];

      // 判断是否有数据， 有则需要检测覆盖
      if (basicTagResult) {
        let times = 0;
        const { result } = basicTagResult;

        // 对已有数据强制转换格式
        // @ts-ignore
        if (basicTagResult.sourceID === 0) {
          basicTagResult.sourceID = '0';
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const oldKey in basicTagResult.result) {
          if (oldKey === labelInfoSet[i].value) {
            times++;

            // 需要区分是否为多选
            if (isMulti === true) {
              const keyList = result[oldKey].split(';').filter((v) => v !== ''); // 注意： 需要过滤 '' 空字符串分割出现 ['']
              const index = keyList.indexOf(value);

              if (index === -1) {
                keyList.push(value);
              } else {
                // 处在数据需要清除
                keyList.splice(index, 1);
              }
              value = keyList.join(';');
            }

            if (value === '') {
              // 如果当前数据仅当前的数据， 则过滤当前结果
              if (Object.keys(result).length === 1) {
                this.tagResult = this.tagResult.filter((v) => {
                  const basicSourceID = `${v.sourceID}`;
                  return basicSourceID !== this.sourceID;
                });
              } else if (Object.keys(result).length > 1) {
                // 清除当前的标签的 key
                delete result[oldKey];
              }
            } else {
              result[oldKey] = value;
            }
          }
        }

        // 如果都不在的说明为新的,需要往里面嵌入新的信息
        if (times === 0) {
          Object.assign(basicTagResult.result, { [key]: value });
        }
      } else {
        // 注意，如果是单图情况的 hover 需要检测是否存在
        // if (!basicRect[currentIndex] && currentIndex > 0) {
        //   return false;
        // }

        this.tagResult = [
          {
            sourceID: this.sourceID,
            id: uuid(8, 62),
            result: {
              [key]: value,
            },
          },
        ];
      }
      this.render();
    }
  };

  // 清空当前页面的标注结果
  public clearResult = (value?: string) => {
    // 依赖原图
    if (value) {
      this.tagResult = this.tagResult.map((v) => {
        if (v?.result[value]) {
          delete v.result[value];
        }
        return v;
      });
    } else {
      this.tagResult = [];
    }
    this.render();
  };

  public renderTag() {
    const parentNode = this.canvas?.parentNode;
    const oldDom = window.self.document.getElementById('tagToolTag');
    if (oldDom && parentNode && parentNode.contains(oldDom)) {
      parentNode?.removeChild(oldDom);
    }

    if (!(this.tagResult?.length > 0)) {
      return;
    }

    const dom = document.createElement('div');
    const tagInfoList = TagUtils.getTagNameList(this.currentTagResult.result, this.config.inputList);

    dom.innerHTML =
      tagInfoList.reduce((acc: string, cur: { keyName: string; value: string[] }) => {
        return `${acc}${cur.keyName}: ${cur.value.join(` 、 `)}\n`;
      }, '') ?? '';

    dom.setAttribute('id', 'tagToolTag');
    dom.setAttribute(
      'style',
      `
        position: absolute;
        top: 0;
        right: 0;
        z-index: 5;
      
        padding: 0 20px;
      
        font-size: 15px;
        color: white;
        text-align: right;
        line-height: 32px;
        white-space: pre;
      
        background: rgba(102, 111, 255, 1);
        opacity: 0.6;
        clear: both;
      `,
    );
    parentNode?.appendChild(dom);
  }

  render() {
    this.renderTag();
    super.render();
    this.emit('render');
  }

  exportData() {
    let { tagResult } = this;

    if (this.isImgError) {
      tagResult = [];
    }

    return [tagResult, this.basicImgInfo];
  }
}

export default TagOperation;
