import { IPointCloudBox, IPointCloudBoxList, IPointCloudConfig } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import { message, Modal } from 'antd';
import { usePointCloudViews } from './usePointCloudViews';
import { PointCloudContext } from '../PointCloudContext';
import { useTranslation } from 'react-i18next';
import { EPointCloudBoxRenderTrigger } from '@/utils/ToolPointCloudBoxRenderHelper';
import AnnotationDataUtils from '@/utils/AnnotationDataUtils';
import { IFileItem } from '@/types/data';

/**
 * For each `rect`, the value of `imageName` on the paste page should be calculated from the value on the copy page using `getNextPath` in `AnnotationDataUtils`.
 * When a box with 2D rects having image names like "1_a.png" and "1_b.png" is copied on page 1 and pasted on page 10, the rects' image names should be updated to "10_a.png" and "10_b.png" respectively to match the images on page 10.
 * Filters out any `rect` objects that have an empty `imageName`.
 *
 * @param {IPointCloudBox} box - The point cloud box containing the rects array to be updated.
 * @returns {IPointCloudBox} - A new point cloud box object with the updated rects array.
 */
const updateBoxRects = (
  box: IPointCloudBox,
  mappingImgList: IFileItem['mappingImgList'] = [],
  preMappingImgList: IFileItem['mappingImgList'] = [],
) => {
  const { rects = [] } = box;

  const newRects = rects
    .map((rect) => ({
      ...rect,
      imageName:
        AnnotationDataUtils.getNextPath({
          prePath: rect.imageName,
          preMappingImgList,
          nextMappingImgList: mappingImgList,
        }) ?? '',
    }))
    .filter((rect) => rect.imageName !== '');

  return {
    ...box,
    rects: newRects,
  };
};

/**
 * Actions for selected boxes
 */
export const useBoxes = ({
  config,
  currentData,
}: {
  config: IPointCloudConfig;
  currentData: IFileItem;
}) => {
  const {
    selectedIDs,
    pointCloudBoxList,
    displayPointCloudList,
    setPointCloudResult,
    syncAllViewPointCloudColor,
  } = useContext(PointCloudContext);

  const [copiedParams, setCopiedParams] = useState<{
    copiedBoxes: IPointCloudBoxList;
    copiedMappingImgList: IFileItem['mappingImgList'];
  }>({
    copiedBoxes: [],
    copiedMappingImgList: [],
  });

  const { copiedBoxes } = copiedParams;

  const { pointCloudBoxListUpdated } = usePointCloudViews();
  const { t, i18n } = useTranslation();

  const hasDuplicateID = (checkBoxList: IPointCloudBoxList) => {
    if (config.trackConfigurable !== true) {
      return false;
    }

    return pointCloudBoxList.some((item) => {
      return checkBoxList.some((i) => i.trackID === item.trackID);
    });
  };

  const selectedBoxes = useMemo(() => {
    return displayPointCloudList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, displayPointCloudList]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxes.length > 0) {
      const mappingImgList = currentData?.mappingImgList ?? [];
      setCopiedParams({
        copiedBoxes: _.cloneDeep(selectedBoxes),
        copiedMappingImgList: mappingImgList,
      });
    } else {
      setCopiedParams({
        copiedBoxes: [],
        copiedMappingImgList: [],
      });
      message.error(t('CopyEmptyInPointCloud'));
    }
  }, [selectedIDs, displayPointCloudList, i18n.language, currentData]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error(t('PasteEmptyInPointCloud'));
      return;
    }

    const hasDuplicate = hasDuplicateID(copiedBoxes);

    const mappingImgList = currentData?.mappingImgList ?? [];
    const preMappingImgList = copiedParams?.copiedMappingImgList ?? [];

    const pastedBoxes = copiedBoxes.map((box) => {
      return updateBoxRects(box, mappingImgList, preMappingImgList);
    });

    const updatePointCloudResult = (newPointCloudBoxList: IPointCloudBoxList) => {
      /** Paste succeed and empty */
      setPointCloudResult(newPointCloudBoxList);
      pointCloudBoxListUpdated?.(newPointCloudBoxList);
      setCopiedParams({
        copiedBoxes: [],
        copiedMappingImgList: [],
      });
      syncAllViewPointCloudColor(EPointCloudBoxRenderTrigger.MultiPaste, newPointCloudBoxList);
    };

    if (hasDuplicate) {
      Modal.confirm({
        title: t('HasDuplicateIDHeader'),
        content: t('HasDuplicateIDMsg'),
        onOk: () => {
          /**
           * Filter the same trackID in old-pointCloudBoxList.
           */
          const newPointCloudResult = pointCloudBoxList
            .filter((v) => {
              if (pastedBoxes.find((c) => c.trackID === v.trackID)) {
                return false;
              }
              return true;
            })
            .concat(pastedBoxes);

          updatePointCloudResult(newPointCloudResult);
        },
      });
    } else {
      /** Paste succeed and empty */
      const newPointCloudResult = [...displayPointCloudList, ...pastedBoxes];

      updatePointCloudResult(newPointCloudResult);
    }
  }, [copiedBoxes, displayPointCloudList, i18n.language, currentData]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
