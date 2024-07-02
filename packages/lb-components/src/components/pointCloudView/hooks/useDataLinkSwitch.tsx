import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLatest } from 'ahooks';

import { PointCloudContext } from '../PointCloudContext';
import LinkIcon from '@/assets/annotation/icon_link.svg';
import UnlinkIcon from '@/assets/annotation/icon_unlink.svg';
import { BatchSwitchConnectionEventBusEvent } from '@/views/MainView/toolFooter/BatchSwitchConnectIn2DView';
import { EventBus } from '@labelbee/lb-annotation';
import { useSyncRectPositionDimensionToPointCloudList } from './usePointCloudViews';
import { IPointCloud2DRectOperationViewRect, IPointCloudBoxRect } from '@labelbee/lb-utils';

const useShownIcon = (imageName?: string) => {
  const { imageNamePointCloudBoxMap, linkageImageNameRectMap } = useContext(PointCloudContext);

  const hasImageNameInPointCloudBox = useMemo(() => {
    if (!imageName) {
      console.error('Missing image name');
      return false;
    }

    return imageNamePointCloudBoxMap.has(imageName);
  }, [imageName, imageNamePointCloudBoxMap]);

  const hasItemInRect = useMemo(() => {
    if (!imageName) return false;

    return (linkageImageNameRectMap.get(imageName)?.size ?? 0) > 0;
  }, [linkageImageNameRectMap, imageName]);

  const visible = useMemo(() => {
    return hasImageNameInPointCloudBox || hasItemInRect;
  }, [hasImageNameInPointCloudBox, hasItemInRect]);

  const visibleRef = useLatest(visible);

  return {
    visible,
    visibleRef,
  };
};

const iconSize = { width: 16, height: 16 };

export interface UseDataLinkSwitchOptions {
  /** DOM显示层级 */
  zIndex: number;

  /** 是否2d框 */
  is2DView: boolean;

  /**
   * 用来判断图片项,
   * 具体参考：packages/lb-components/src/components/pointCloud2DRectOperationView/index.tsx, getRectListByBoxList函数
   *
   * 基于上参考，此值需确保唯一性！
   */
  imageName: string;
}

const useDataLinkSwitch = (opts: UseDataLinkSwitchOptions) => {
  if (!opts.imageName) {
    console.warn('missing imageName');
  }

  /** 连接 或 断开连接 */
  const [isLinking, setIsLinking] = useState(true);

  const imageNameRef = useLatest(opts.imageName);

  const {
    addRectFromPointCloudBoxByImageName,
    removeRectByPointCloudBoxId,
    linkageImageNameRectMap,
    pointCloudBoxList,
    rectList,
    updateRectListByReducer,
  } = useContext(PointCloudContext);

  const { visible: visibleLinkageIcon, visibleRef: visibleLinkageIconRef } = useShownIcon(
    opts.imageName,
  );
  const { syncToPointCloudBoxList } = useSyncRectPositionDimensionToPointCloudList();

  const addRect = useLatest(addRectFromPointCloudBoxByImageName);
  const removeRect = useLatest(removeRectByPointCloudBoxId);

  /** @private */
  const handleFromDisconnectToConnect = useLatest(() => {
    //  When switch from disconnect to connect,
    //  should merge the `rectList`(x,y,width,height) to `pointCloudBoxList` rects
    return syncToPointCloudBoxList();
  });

  const fireSwitch = useCallback((isLinking: boolean) => {
    // Just ignore in no image-name condition when flush the state in that moment
    if (!visibleLinkageIconRef.current) {
      return;
    }

    const imageName = imageNameRef.current;
    // Check image name
    if (!imageName) {
      console.warn('invalid image name');
      return;
    }

    setIsLinking(isLinking);

    if (isLinking) {
      removeRect.current(imageName);
    } else {
      addRect.current(imageName);
    }
  }, []);

  const handleManualSwitch = useLatest((targetSwitch: boolean) => {
    // DEBUG
    // console.log(targetSwitch);
    if (targetSwitch) {
      handleFromDisconnectToConnect.current();
    }

    fireSwitch(targetSwitch);
  });

  // const handleSwitch = useCallback(() => {
  //   const targetSwitch = !isLinking;
  //   handleManualSwitch.current(targetSwitch)
  // }, [isLinking]);

  /** Connect/disconnect button render */
  const rendered = useMemo(() => {
    if (!opts.is2DView) {
      return null;
    }

    /** No pointCloudBox match is meaning no connect relative */
    if (!visibleLinkageIcon) {
      return null;
    }

    const zIndex = opts.zIndex ?? 999;
    const style: CSSProperties = {
      zIndex,
      position: 'absolute',
      top: 16,
      right: 16 + 28 + 12 /* {the right sibling boundary} + {gap} */,
      background: 'rgba(0, 0, 0, 0.74)',
      color: 'white',
      borderRadius: 2,
      padding: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      // cursor: 'pointer',
    };

    return (
      <div
        style={style}
        //  onClick={handleSwitch}
      >
        {isLinking && <img src={LinkIcon} style={iconSize} />}
        {!isLinking && <img src={UnlinkIcon} style={iconSize} />}
      </div>
    );
  }, [
    isLinking,
    opts.is2DView,
    opts.zIndex, // handleSwitch,
    visibleLinkageIcon,
  ]);

  const linkageImageNameRectMapRef = useLatest(linkageImageNameRectMap);
  const syncIsLinking = useCallback(() => {
    if (!opts.is2DView) return;

    const imageName = imageNameRef.current;
    if (!imageName) {
      console.warn('invalid image name');
      return;
    }

    const linkageImageNameRectMap = linkageImageNameRectMapRef.current;

    // All matched's imageName `extId`s
    const imageNameMatchedExtIds = [...(linkageImageNameRectMap.get(imageName)?.keys() ?? [])];

    let initIsLinking = true;
    if (imageNameMatchedExtIds.length) {
      initIsLinking = false;
    }

    fireSwitch(initIsLinking);
  }, [opts.is2DView, fireSwitch]);

  // const syncIsLinkingRef = useLatest(syncIsLinking)

  // Read the latest `isLinking`
  useEffect(() => {
    syncIsLinking();
  }, [syncIsLinking, pointCloudBoxList, rectList]);


  // Set to normal rect when has no matching-pointCloudBox owner
  useEffect(() => {
    const ids = pointCloudBoxList.map(item => item.id);
    const set = new Set(ids);

    updateRectListByReducer((prevRectList, pickRectObject) => {
      const filteredUnLinkageItems: IPointCloudBoxRect[] = [];
      const otherItems: IPointCloudBoxRect[] = [];

      prevRectList.forEach((item) => {
        const extId = item.extId;
        if (extId !== undefined && set.has(extId) === false) {
          filteredUnLinkageItems.push(item);
        } else {
          otherItems.push(item);
        }
      });

      if (filteredUnLinkageItems.length) {
        return [
          ...filteredUnLinkageItems.map(item => pickRectObject(item as IPointCloud2DRectOperationViewRect)),
          ...otherItems
        ]
      }

      return prevRectList;
    })
  }, [pointCloudBoxList])

  useEffect(() => {
    const fn = (isConnect: boolean) => {
      handleManualSwitch.current(isConnect);
    };

    EventBus.on(BatchSwitchConnectionEventBusEvent.switchConnect, fn);
    return () => EventBus.unbind(BatchSwitchConnectionEventBusEvent.switchConnect, fn);
  }, []);

  return {
    rendered,
    isLinking,
    // swapSwitch: handleManualSwitch,
    // syncIsLinking,
  };
};

export default useDataLinkSwitch;
