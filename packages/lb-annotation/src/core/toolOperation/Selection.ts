/**
 * @file Manage selectedIds for ToolInstance
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @createdate 2023-03-01
 */

import _ from 'lodash';
import LineToolOperation from './LineToolOperation';
import PointOperation from './pointOperation';
import PolygonOperation from './polygonOperation';
import { RectOperation } from './rectOperation';
import CommonToolUtils from '../../utils/tool/CommonToolUtils';
import { IPolygonData } from '@/types/tool/polygon';

type ToolInstance = PointOperation | PolygonOperation | LineToolOperation | RectOperation;

type SelectedID = string;
type SelectedIDs = SelectedID[];
type DataUnit = IPointUnit | IPolygonData | ILine | IRect;
type DataList = Array<DataUnit>;

class Selection {
  private _selectedIDs: SelectedIDs;

  private toolInstance: ToolInstance;

  private stashDataList?: DataList;

  constructor(toolInstance: ToolInstance) {
    if (!toolInstance) {
      console.error('MultipleSelect is require a tool instance');
    }

    this._selectedIDs = [];
    this.toolInstance = toolInstance;
  }

  get selectedIDs() {
    return this._selectedIDs;
  }

  get selectedID() {
    return this._selectedIDs.length === 1 ? this._selectedIDs[0] : undefined;
  }

  get visibleDataList() {
    const { dataList, attributeLockList, basicResult } = this.toolInstance;

    const [showingDataList] = CommonToolUtils.getRenderResultList(
      dataList,
      CommonToolUtils.getSourceID(basicResult),
      attributeLockList,
    );

    return showingDataList;
  }

  get dataList(): DataList {
    return this.toolInstance.dataList;
  }

  /**
   * Trigger tools and _textAttributeInstance to re-render when _selectedIDs changed
   */
  private set selectedIDs(selectedIDs: SelectedIDs) {
    this.toolInstance._textAttributeInstance?.selectedIDsChanged(this.selectedIDs, selectedIDs);
    this._selectedIDs = selectedIDs;
    this.toolInstance.render();
  }

  /**
   * Update selectedIDs:
   * Remove selectedID when selectedIDs includes
   * Append selectedID when selectedIDs not includes
   * SelectedID is
   * @param selectedID
   */
  private updateSelectedIDs(selectedID?: SelectedID) {
    if (!selectedID) {
      this._selectedIDs = [];
      return;
    }

    if (this.selectedIDs.includes(selectedID)) {
      this.selectedIDs = this.selectedIDs.filter((id) => id !== selectedID);
    } else {
      this.selectedIDs = [...this.selectedIDs, selectedID];
    }
  }

  /**
   * Set selectedIDs
   * isAppend is true: push or remove from selectedIDs
   * isAppend is false: overwrite selectedIDs
   * @param id
   * @param isAppend
   */
  public setSelectedIDs(id?: string, isAppend = false) {
    if (isAppend) {
      this.updateSelectedIDs(id);
    } else {
      this.selectedIDs = id ? [id] : [];
    }
  }

  public selectAll() {
    this.selectedIDs = this.visibleDataList.map((i) => i.id);
    this.toolInstance.render();
  }

  public toStashDataList() {
    if (this.selectedIDs.length > 0) {
      this.stashDataList = _.cloneDeep(this.dataList.filter((i) => this.selectedIDs.includes(i.id)));
    }
  }

  public toUnStashDataList() {
    if (this.stashDataList) {
      const _stashDataList = this.stashDataList;
      this.stashDataList = [];
      return _stashDataList;
    }

    return undefined;
  }

  public mergeStashData() {
    const stashList = this.toUnStashDataList();
    /**
     * Merge current result and stashList
     * https://stackoverflow.com/questions/38612972/how-to-merge-two-arrays-of-objects-by-id-using-lodash
     */
    const mergedDataList = _(this.dataList).keyBy('id').merge(_.keyBy(stashList, 'id')).values().value();
    this.setResultAndRender(mergedDataList);
  }

  public setResultAndRender(dataList: DataList) {}

  public isIdSelected(id: string) {
    return this.selectedIDs.includes(id);
  }
}

export default Selection;
