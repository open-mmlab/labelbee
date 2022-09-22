import { IPointCloudBoxList } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import { usePointCloudViews } from './usePointCloudViews';
import { PointCloudContext } from '../PointCloudContext';
import { useTranslation } from 'react-i18next';

/**
 * Actions for selected boxes
 */
export const useBoxes = () => {
  const { selectedIDs, pointCloudBoxList, setPointCloudResult } = useContext(PointCloudContext);
  const [copiedBoxes, setCopiedBoxes] = useState<IPointCloudBoxList>([]);
  const { pointCloudBoxListUpdated } = usePointCloudViews();
  const { t, i18n} = useTranslation();

  const hasDuplicateID = (checkBoxList: IPointCloudBoxList) => {
    return pointCloudBoxList.some((item) => {
      return checkBoxList.some((i) => i.id === item.id);
    });
  };

  const selectedBoxes = useMemo(() => {
    return pointCloudBoxList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, pointCloudBoxList]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxes.length > 0) {
      setCopiedBoxes(_.cloneDeep(selectedBoxes));
    } else {
      setCopiedBoxes([]);
      message.error(t("CopyEmptyInPointCloud"));
    }
  }, [selectedIDs, pointCloudBoxList, i18n.language]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error(t("PasteEmptyInPointCloud"));
      return;
    }

    const hasDuplicate = hasDuplicateID(copiedBoxes);

    if (hasDuplicate) {
      message.error(t("HasDuplicateID"));
    } else {
      /** Paste succeed and empty */
      setPointCloudResult(copiedBoxes);
      pointCloudBoxListUpdated?.(copiedBoxes);
      setCopiedBoxes([]);
    }
  }, [copiedBoxes, pointCloudBoxList, i18n.language]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
