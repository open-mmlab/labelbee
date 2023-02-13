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
  const { selectedIDs, displayPointCloudList, setPointCloudResult } = useContext(PointCloudContext);
  const [copiedBoxes, setCopiedBoxes] = useState<IPointCloudBoxList>([]);
  const { pointCloudBoxListUpdated } = usePointCloudViews();
  const { t, i18n } = useTranslation();

  const selectedBoxes = useMemo(() => {
    return displayPointCloudList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, displayPointCloudList]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxes.length > 0) {
      setCopiedBoxes(_.cloneDeep(selectedBoxes));
    } else {
      setCopiedBoxes([]);
      message.error(t('CopyEmptyInPointCloud'));
    }
  }, [selectedIDs, displayPointCloudList, i18n.language]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error(t('PasteEmptyInPointCloud'));
      return;
    }

    // const hasDuplicate = hasDuplicateID(copiedBoxes);
    const hasDuplicate = false; // Temporarily hide the duplicate check;

    if (hasDuplicate) {
      message.error(t('HasDuplicateID'));
    } else {
      /** Paste succeed and empty */
      const newPointCloudResult = [...displayPointCloudList, ...copiedBoxes];

      setPointCloudResult(newPointCloudResult);
      pointCloudBoxListUpdated?.(newPointCloudResult);
      setCopiedBoxes([]);
    }
  }, [copiedBoxes, displayPointCloudList, i18n.language]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
