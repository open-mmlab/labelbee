import { IPointCloudBoxList, IPointCloudConfig } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import { message, Modal } from 'antd';
import { usePointCloudViews } from './usePointCloudViews';
import { PointCloudContext } from '../PointCloudContext';
import { useTranslation } from 'react-i18next';

/**
 * Actions for selected boxes
 */
export const useBoxes = ({ config }: { config: IPointCloudConfig }) => {
  const { selectedIDs, pointCloudBoxList, setPointCloudResult, syncAllViewPointCloudColor } =
    useContext(PointCloudContext);
  const [copiedBoxes, setCopiedBoxes] = useState<IPointCloudBoxList>([]);
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
    return pointCloudBoxList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, pointCloudBoxList]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxes.length > 0) {
      setCopiedBoxes(_.cloneDeep(selectedBoxes));
    } else {
      setCopiedBoxes([]);
      message.error(t('CopyEmptyInPointCloud'));
    }
  }, [selectedIDs, pointCloudBoxList, i18n.language]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error(t('PasteEmptyInPointCloud'));
      return;
    }

    const hasDuplicate = hasDuplicateID(copiedBoxes);

    const updatePointCloudResult = (newPointCloudBoxList: IPointCloudBoxList) => {
      /** Paste succeed and empty */
      setPointCloudResult(newPointCloudBoxList);
      pointCloudBoxListUpdated?.(newPointCloudBoxList);
      setCopiedBoxes([]);

      // TODO: It need to update in global.
      syncAllViewPointCloudColor(newPointCloudBoxList);
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
              if (copiedBoxes.find((c) => c.trackID === v.trackID)) {
                return false;
              }
              return true;
            })
            .concat(copiedBoxes);

          updatePointCloudResult(newPointCloudResult);
        },
      });
    } else {
      /** Paste succeed and empty */
      const newPointCloudResult = [...pointCloudBoxList, ...copiedBoxes];

      updatePointCloudResult(newPointCloudResult);
    }
  }, [copiedBoxes, pointCloudBoxList, i18n.language]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
