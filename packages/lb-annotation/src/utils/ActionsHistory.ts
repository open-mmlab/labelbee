import _ from 'lodash';

export default class ActionsHistory {
  public record: any[] = [];

  public recordIndex: number = -1;

  public callback?: () => void;

  public minRecordIndex: number = -1;

  /** 历史改变后触发的更新 */
  public historyChanged?: (undoEnabled: boolean, redoEnabled: boolean) => void;

  constructor(historyChanged?: (undoEnabled: boolean, redoEnabled: boolean) => void) {
    this.historyChanged = historyChanged;
  }

  get undoEnabled() {
    return this.recordIndex > this.minRecordIndex;
  }

  get redoEnabled() {
    return this.recordIndex < this.record.length - 1;
  }

  public emitHistoryChanged = () => {
    if (this.historyChanged) {
      const isEmit = this.constructor.name === 'ActionsHistory' ? true : this.record.length > 0;
      if (isEmit) {
        this.historyChanged(this.undoEnabled, this.redoEnabled);
      }
    }
  };

  public pushHistory(action: any) {
    if (this.recordIndex !== this.record.length - 1) {
      const newRecord = this.record.slice(0, Math.min(this.recordIndex + 1, this.record.length));
      this.record = newRecord;
    }
    this.record.push(_.cloneDeepWith(action));
    this.recordIndex += 1;
    this.emitHistoryChanged();
  }

  public updateHistory(newRecord: any) {
    this.record[this.recordIndex] = _.cloneDeep(newRecord);
  }

  /**
   * 应用属性到所有记录
   * @param key
   * @param value
   */
  public applyAttribute(id: string | undefined, key: string, value: any) {
    if (id) {
      this.record.forEach((lines) => {
        const line = lines.find((i: any) => i.id === id);
        if (line) {
          line[key] = value;
        }
      });
    }
  }

  /** 撤销 */
  public undo() {
    if (this.undoEnabled) {
      this.recordIndex -= 1;
      this.emitHistoryChanged();
      return _.cloneDeep(this.record[this.recordIndex]) || [];
    }
  }

  /** 重做 */
  public redo() {
    if (this.redoEnabled) {
      this.recordIndex += 1;
      this.emitHistoryChanged();
      return _.cloneDeep(this.record[this.recordIndex]);
    }
  }

  public init() {
    this.record = [[]];
    this.recordIndex = 0;
    this.emitHistoryChanged();
  }

  public empty() {
    this.record = [];
    this.recordIndex = -1;
    this.emitHistoryChanged();
  }

  /**
   * 设置已经保存的数据
   * @param minIndex
   * @param isExitData  用于空数组下的赋值
   */
  public initRecord(data: any[], isExitData = false) {
    const existData = data.length > 0 || isExitData;
    this.record = existData ? [_.cloneDeep(data)] : [];
    this.minRecordIndex = existData ? 0 : -1;
    this.recordIndex = 0;
  }
}
