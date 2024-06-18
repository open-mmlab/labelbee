import {
  IPointCloud2DRectOperationViewRect,
  IPointCloudBox,
  PartialIPointCloudBoxList,
} from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo } from 'react';
import _ from 'lodash';
import { PointCloudContext } from '../PointCloudContext';
import { EToolName, cAnnotation } from '@labelbee/lb-annotation';
import { useHistory } from './useHistory';
import { usePolygon } from './usePolygon';
import { IFileItem } from '@/types/data';

const { ESortDirection } = cAnnotation;

interface IUseSingleBoxParams {
  generateRects?: (box: IPointCloudBox) => void;
}

/** Actions for single selected box */
export const useSingleBox = (props?: IUseSingleBoxParams) => {
  const {
    pointCloudBoxList,
    setPointCloudResult,
    topViewInstance,
    backViewInstance,
    sideViewInstance,
    selectedIDs,
    selectedID,
    mainViewInstance,
    setSelectedIDs,
    syncAllViewPointCloudColor,
    polygonList,
    pointCloudPattern,
    rectList,

    removeRectIn2DView,
    addRectIn2DView,
  } = useContext(PointCloudContext);
  const { selectedPolygon, updateSelectedPolygon, updatePolygonValidByID, deletePolygon } =
    usePolygon();

  const { pushHistoryWithList } = useHistory();

  /** Returns { info: selected box, index: selected box index } */
  const selectedBox = useMemo(() => {
    const boxIndex = pointCloudBoxList.findIndex((i: { id: string }) => i.id === selectedID);
    if (boxIndex > -1) {
      return { info: pointCloudBoxList[boxIndex], index: boxIndex };
    }
  }, [selectedID, pointCloudBoxList]);

  /** Use Partial<IPointCloudBox> to update selected box */
  const updateSelectedBox = useCallback(
    (params: Partial<IPointCloudBox>) => {
      if (selectedBox?.info) {
        props?.generateRects?.(params as IPointCloudBox);
        pointCloudBoxList.splice(selectedBox.index, 1, _.merge(selectedBox.info, params));
        const newPointCloudBoxList = _.cloneDeep(pointCloudBoxList);
        setPointCloudResult(newPointCloudBoxList);
        pushHistoryWithList({ pointCloudBoxList: newPointCloudBoxList });
        return newPointCloudBoxList;
      }

      return pointCloudBoxList;
    },
    [selectedID, pointCloudBoxList],
  );

  /** Use Partial<IPointCloudBox> to update box by ID  */
  const updateBoxByID = useCallback(
    (params: Partial<IPointCloudBox>, id: string) => {
      const boxIndex = pointCloudBoxList.findIndex((v) => v.id === id);

      if (boxIndex > -1) {
        pointCloudBoxList.splice(boxIndex, 1, _.merge(pointCloudBoxList[boxIndex], params));
        const newPointCloudBoxList = _.cloneDeep(pointCloudBoxList);
        setPointCloudResult(newPointCloudBoxList);
        return newPointCloudBoxList;
      }
      return pointCloudBoxList;
    },
    [pointCloudBoxList],
  );

  /**
   * Change all polygonView Valid.
   */
  const changePolygonViewValid = useCallback(
    (id: string) => {
      topViewInstance?.pointCloud2dOperation.setPolygonValidAndRender(id, true);
      sideViewInstance?.pointCloud2dOperation.setPolygonValidAndRender(id, true);
      backViewInstance?.pointCloud2dOperation.setPolygonValidAndRender(id, true);
    },
    [topViewInstance, sideViewInstance, backViewInstance],
  );

  /** Toggle selected box‘s validity  */
  const changeSelectedBoxValid = useCallback(() => {
    if (selectedBox?.info) {
      const { id, valid = true } = selectedBox.info;

      // PointCloud
      const newPointCloudList = updateSelectedBox({ valid: !valid });

      // Async
      syncAllViewPointCloudColor(newPointCloudList);
      changePolygonViewValid(id);
    }

    if (selectedPolygon) {
      updateSelectedPolygon({ ...selectedPolygon, valid: !selectedPolygon.valid });
      topViewInstance?.pointCloud2dOperation.setPolygonValidAndRender(selectedPolygon.id, true);
    }
  }, [changePolygonViewValid, selectedBox, selectedPolygon]);

  const changeValidByID = useCallback(
    (id: string) => {
      const boxInfo = pointCloudBoxList.find((v) => v.id === id);

      if (boxInfo) {
        const { id, valid = true } = boxInfo;

        // PointCloud
        const newPointCloudBoxList = updateBoxByID({ valid: !valid }, id);

        changePolygonViewValid(id);

        return newPointCloudBoxList;
      }
      updatePolygonValidByID(id);
    },
    [changePolygonViewValid, pointCloudBoxList, polygonList],
  );

  /** PointCloud select next/prev one */
  const switchToNext = useCallback(
    (sort = ESortDirection.ascend, manual = false) => {
      if (!topViewInstance || selectedIDs.length > 1) {
        return;
      }

      if (pointCloudPattern !== EToolName.Rect && pointCloudPattern !== EToolName.Polygon) {
        if (manual) {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              keyCode: 9,
              shiftKey: sort !== ESortDirection.ascend,
            }),
          );
        }

        return;
      }

      const { pointCloud2dOperation } = topViewInstance;

      const newSelectedIDs = pointCloud2dOperation.switchToNextPolygon(sort);
      if (newSelectedIDs) {
        setSelectedIDs(newSelectedIDs);
      }
    },
    [topViewInstance, pointCloudPattern, topViewInstance?.toolInstance],
  );

  const selectPrevBox = (manual = false) => {
    switchToNext(ESortDirection.descend, manual);
  };

  const selectNextBox = (manual = false) => {
    switchToNext(ESortDirection.ascend, manual);
  };

  const deletePointCloudBox = (id: string) => {
    const newPointCloudList = pointCloudBoxList.filter((v) => v.id !== id);
    setPointCloudResult(newPointCloudList);
    mainViewInstance?.removeObjectByName(id, 'box');
    mainViewInstance?.render();
    syncAllViewPointCloudColor(newPointCloudList);
  };

  /**
   * Convert the deleted pointCloudBox's matching rects to the normal rects
   */
  const updateExtIdMatchingRects = useCallback(
    (deletedPointCloudBoxList: IPointCloudBox[], currentData: IFileItem) => {
      const currentImageNameSet = new Set(
        currentData.mappingImgList?.map((item) => item.path) ?? [],
      );

      /** Map: imageName -> Set(extId) */
      const imageNameAndExtIdSetMap = new Map<string, Set<string>>();

      deletedPointCloudBoxList.forEach((pcBox) => {
        const extId = pcBox.id;

        ;(pcBox.rects || []).forEach((item) => {
          const { imageName } = item;
          if (currentImageNameSet.has(imageName)) {
            let set = imageNameAndExtIdSetMap.get(imageName);
            if (!set) {
              set = new Set<string>();
              imageNameAndExtIdSetMap.set(imageName, set);
            }

            set.add(extId);
          }
        });
      });

      const deletedHasExtIdRectList = rectList.filter(
        (item): item is IPointCloud2DRectOperationViewRect => {
          const extId = item.extId;
          const imageName = item.imageName;

          if (imageName !== undefined && extId !== undefined) {
            const set = imageNameAndExtIdSetMap.get(imageName);
            return set?.has(extId) ?? false;
          }

          return false;
        },
      );

      /**
       * How to implement the transform(refer the aboving function description)?
       *  1. remove the self
       *  2. add the transformed(in the normal shape) self
       */
      // Firstly, remove the old item(with boxID)
      removeRectIn2DView(deletedHasExtIdRectList);
      // Then, add the normal rect item
      deletedHasExtIdRectList.forEach((item) => {
        addRectIn2DView(item);
      });
    },
    [rectList, removeRectIn2DView, addRectIn2DView],
  );

  /**
   * Delete all polygon by hotkey.
   */
  const deleteSelectedPointCloudBoxAndPolygon = (currentData: IFileItem) => {
    if (selectedBox) {
      deletePointCloudBox(selectedBox.info.id);
      topViewInstance?.pointCloud2dOperation.deletePolygon(selectedBox.info.id);

      updateExtIdMatchingRects([selectedBox.info], currentData);
    }

    if (selectedPolygon) {
      deletePolygon(selectedPolygon.id);
      topViewInstance?.pointCloud2dOperation.deletePolygon(selectedPolygon.id);
    }
  };

  /**
   * According to selectedIDs, return selected pointCloudList
   * @returns pointCloudList {IPointCloudBoxList}
   */
  const selectedBoxes = useMemo(() => {
    return pointCloudBoxList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, pointCloudBoxList]);

  /**
   * Update point cloud boxes list by updateList
   * @param updateList {PartialIPointCloudBoxList}
   */
  const updateSelectedBoxes = useCallback(
    (updateList: PartialIPointCloudBoxList) => {
      const newPointCloudBoxList = _.cloneDeep(pointCloudBoxList);
      let hasModify = false;

      for (const i of updateList) {
        const index = newPointCloudBoxList.findIndex((p) => p.id === i.id);

        if (index > -1) {
          const updatedBoxParam = _.merge(newPointCloudBoxList[index], i);
          props?.generateRects?.(updatedBoxParam);
          newPointCloudBoxList.splice(index, 1, updatedBoxParam);
          mainViewInstance?.generateBox(updatedBoxParam);
          hasModify = true;
        }
      }

      if (hasModify) {
        setPointCloudResult(newPointCloudBoxList);
        pushHistoryWithList({ pointCloudBoxList: newPointCloudBoxList });
        mainViewInstance?.render();
        return newPointCloudBoxList;
      }
    },

    [selectedIDs, pointCloudBoxList],
  );

  /**
   * @param id {string}
   * @returns pointCloud {IPointCloudBox | undefined }
   */
  const getPointCloudByID = useCallback(
    (id: string) => {
      return pointCloudBoxList.find((i) => i.id === id);
    },
    [pointCloudBoxList],
  );

  return {
    selectedBox,
    updateSelectedBox,
    changeSelectedBoxValid,
    changeValidByID,
    selectNextBox,
    selectPrevBox,
    deletePointCloudBox,
    selectedBoxes,
    updateSelectedBoxes,
    getPointCloudByID,
    deleteSelectedPointCloudBoxAndPolygon,
  };
};
