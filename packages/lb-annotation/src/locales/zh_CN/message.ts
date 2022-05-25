/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-03-24 15:28:13
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-05-17 15:59:42
 */
import { EMessage } from '../constants';

const message: Record<string, string> = {
  [EMessage.NoRotateNotice]: '本图含有数据，无法进行旋转',
  [EMessage.RectErrorSizeNotice]: '绘制框尺寸小于最小绘制尺寸',
  [EMessage.TextCheckNumberErrorNotice]: '请按仅数字的格式输入',
  [EMessage.TextCheckEnglishErrorNotice]: '请按仅英文的格式输入',
  [EMessage.TextCheckCustomErrorNotice]: '请按要求的格式输入',
  [EMessage.UpperLimitErrorNotice]: '顶点数不多于',
  [EMessage.LowerLimitErrorNotice]: '顶点数不少于',
  [EMessage.InvalidImage]: '无效图片，请跳过此图',
  [EMessage.DisableDelete]: '该数据禁止删除',
  [EMessage.ClearPartialData]: '存在部分数据无法清除',
  [EMessage.MarkerFinish]: '列表标注已完成',
  [EMessage.LowerLimitPoint]: '已到达标点数量上限',
  [EMessage.NoRotateInDependence]: '依赖情况下无法进行旋转',
  [EMessage.UnableToReannotation]: '无法进行续标操作',
  [EMessage.ForbiddenCreationOutsideBoundary]: '边界外禁止创建',
  [EMessage.SuccessfulEdgeAdsorption]: '边缘吸附成功',
};
export default message;
