import { IPointCloudBoxList } from '@labelbee/lb-utils';
import { useCallback, useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import { usePointCloudViews } from './usePointCloudViews';
import { PointCloudContext } from '../PointCloudContext';

/**
 * Actions for selected boxes
 */
export const useBoxes = () => {
  const { selectedIDs, pointCloudBoxList, setPointCloudResult } = useContext(PointCloudContext);
  const [copiedBoxes, setCopiedBoxes] = useState<IPointCloudBoxList>([]);
  const { pointCloudBoxListUpdated } = usePointCloudViews();

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
      message.error('复制内容为空，请选择对应的点云数据');
    }
  }, [selectedIDs, pointCloudBoxList]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error('选者对应的点云数据并进行复制');
      return;
    }

    const hasDuplicate = hasDuplicateID(copiedBoxes);

    if (hasDuplicate) {
      message.error('存在重复ID,复制失败');
    } else {
      /** Paste succeed and empty */
      setPointCloudResult(copiedBoxes);
      pointCloudBoxListUpdated?.(copiedBoxes);
      setCopiedBoxes([]);
    }
  }, [copiedBoxes, pointCloudBoxList]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
