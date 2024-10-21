import { IPointCloudBoxRect, IPointCloud2DRectOperationViewRect } from '@labelbee/lb-utils';

/**
 * 2D视图仅显示选中框体
 *
 * @description 参考 https://y631vj6044.feishu.cn/docx/VZLBdgvU8oJUfSxkOy3cswkKn3f
 * ```选择俯视图对应框体，在选中状态下，2D视图仅展示该框体，其它框体隐藏，非选中状态下还是保持和现有一致都展示```
 */
export const selectSpecifiedRectsFromTopViewSelectedIds = (
  selectedIdsByBoxList: string[],
  rectListByBoxList: IPointCloud2DRectOperationViewRect[],
  rectListInImage: IPointCloudBoxRect[],
) => {
  if (selectedIdsByBoxList.length) {
    const set = new Set(selectedIdsByBoxList)

    const filteredBoxList = rectListByBoxList.filter(({ boxID }) => {
      return set.has(boxID)
    })

    const filteredImage = rectListInImage.filter((item) => item.extId && set.has(item.extId))

    return [
      ...filteredBoxList,
      ...filteredImage
    ]
  }

  return [
    ...rectListByBoxList,
    ...rectListInImage
  ]
};
