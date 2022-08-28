import { IPointCloudBox } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo } from 'react';
import _ from 'lodash';
import { PointCloudContext } from '../PointCloudContext';
import { cAnnotation } from '@labelbee/lb-annotation';

const { ESortDirection } = cAnnotation;

/** Actions for single selected box */
export const useSingleBox = () => {
  const {
    pointCloudBoxList,
    setPointCloudResult,
    topViewInstance,
    selectedIDs,
    selectedID,
    mainViewInstance,
    setSelectedIDs,
  } = useContext(PointCloudContext);

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
        setPointCloudResult(_.cloneDeep(pointCloudBoxList));
      }
    },
    [selectedID, pointCloudBoxList],
  );

  /** Toggle selected box‘s validity  */
  const changeSelectedBoxValid = useCallback(() => {
    if (selectedBox?.info) {
      updateSelectedBox({ valid: !selectedBox.info.valid });
    }
  }, [selectedID]);

  /** PointCloud select next/prev one */
  const switchToNextBox = useCallback(
    (sort = ESortDirection.ascend) => {
      if (!topViewInstance || selectedIDs.length > 1) {
        return;
      }

      const { pointCloud2dOperation } = topViewInstance;

      const newSelectedIDs = pointCloud2dOperation.switchToNextPolygon(sort);
      setSelectedIDs(newSelectedIDs);
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
    selectNextBox: switchToNextBox,
    selectPrevBox,
    deletePointCloudBox,
  };
};
