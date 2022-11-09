import { IPointCloudBox } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo } from 'react';
import _ from 'lodash';
import { PointCloudContext } from '../PointCloudContext';
import { cAnnotation } from '@labelbee/lb-annotation';
import { useHistory } from './useHistory';

const { ESortDirection } = cAnnotation;

/** Actions for single selected box */
export const useSingleBox = () => {
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
  } = useContext(PointCloudContext);

  const { pushHistoryWithList } = useHistory();

  /** Returns { info: selected box, index: selected box index } */
  const selectedBox = useMemo(() => {
    const boxIndex = pointCloudBoxList.findIndex((i: { id: string }) => i.id === selectedID);
    if (boxIndex > -1) {
      return { info: pointCloudBoxList[boxIndex], index: boxIndex };
    }
  }, [selectedID, pointCloudBoxList]);

  /** Use Partial<IPointCloudBox> to update selected box  */
  const updateSelectedBox = useCallback(
    (params: Partial<IPointCloudBox>) => {
      if (selectedBox?.info) {
        pointCloudBoxList.splice(selectedBox.index, 1, _.merge(selectedBox.info, params));
        const newPointCloudBoxList = _.cloneDeep(pointCloudBoxList)
        setPointCloudResult(newPointCloudBoxList);
        pushHistoryWithList({ pointCloudBoxList: newPointCloudBoxList });
      }
    },
    [selectedID, pointCloudBoxList],
  );

  /** Use Partial<IPointCloudBox> to update box by ID  */
  const updateBoxByID = useCallback(
    (params: Partial<IPointCloudBox>, id: string) => {
      const boxIndex = pointCloudBoxList.findIndex((v) => v.id === id);

      if (boxIndex > -1) {
        pointCloudBoxList.splice(boxIndex, 1, _.merge(pointCloudBoxList[boxIndex], params));
        setPointCloudResult(_.cloneDeep(pointCloudBoxList));
      }
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
      updateSelectedBox({ valid: !valid });

      changePolygonViewValid(id);
    }
  }, [changePolygonViewValid, selectedBox]);

  const changeBoxValidByID = useCallback(
    (id: string) => {
      const boxInfo = pointCloudBoxList.find((v) => v.id === id);

      if (boxInfo) {
        const { id, valid = true } = boxInfo;

        // PointCloud
        updateBoxByID({ valid: !valid }, id);

        changePolygonViewValid(id);
      }
    },
    [changePolygonViewValid, pointCloudBoxList],
  );

  /** PointCloud select next/prev one */
  const switchToNextBox = useCallback(
    (sort = ESortDirection.ascend) => {
      if (!topViewInstance || selectedIDs.length > 1) {
        return;
      }

      const { pointCloud2dOperation } = topViewInstance;

      const newSelectedIDs = pointCloud2dOperation.switchToNextPolygon(sort);
      if (newSelectedIDs) {
        setSelectedIDs(newSelectedIDs);
      }
    },
    [topViewInstance],
  );

  const selectPrevBox = () => {
    switchToNextBox(ESortDirection.descend);
  };

  const deletePointCloudBox = (id: string) => {
    setPointCloudResult(pointCloudBoxList.filter((v) => v.id !== id));
    mainViewInstance?.removeObjectByName(id);
    mainViewInstance?.render();
    // TODO Clear Highlight.
  };

  return {
    selectedBox,
    updateSelectedBox,
    changeSelectedBoxValid,
    changeBoxValidByID,
    selectNextBox: switchToNextBox,
    selectPrevBox,
    deletePointCloudBox,
  };
};
