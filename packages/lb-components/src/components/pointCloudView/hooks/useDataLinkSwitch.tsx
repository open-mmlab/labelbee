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

  const imageNameRef = useRef(opts.imageName);
  imageNameRef.current = opts.imageName;

  const { unlinkImageItems, addRectFromPointCloudBoxByImageName, removeRectByPointCloudBoxId } =
    useContext(PointCloudContext);

  const addRect = useLatest(addRectFromPointCloudBoxByImageName);
  const removeRect = useLatest(removeRectByPointCloudBoxId);

  const fireSwitch = useCallback((isLinking: boolean) => {
    const imageName = imageNameRef.current;
    // Should has the image name
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

  const handleSwitch = useCallback(() => {
    fireSwitch(!isLinking);
  }, [fireSwitch, isLinking]);

  const rendered = useMemo(() => {
    // Hide the switch temporarily
    if (!opts.is2DView || opts.is2DView) {
      return null
    }

    if (!opts.is2DView) {
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
      cursor: 'pointer',
    };

    return (
      <div style={style} onClick={handleSwitch}>
        {isLinking && <img src={LinkIcon} style={iconSize} />}
        {!isLinking && <img src={UnlinkIcon} style={iconSize} />}
      </div>
    );
  }, [isLinking, opts.is2DView, opts.zIndex, handleSwitch]);

  const syncIsLinking = useCallback(() => {
    if (!opts.is2DView) return;

    const imageName = imageNameRef.current;
    if (!imageName) {
      console.warn('invalid image name');
      return;
    }

    const set = new Set(unlinkImageItems);
    const initIsLinking = set.has(imageName) === false;

    fireSwitch(initIsLinking);
  }, [opts.is2DView, unlinkImageItems, fireSwitch])

  // const syncIsLinkingRef = useLatest(syncIsLinking)

  // 读取内部`isLinking`
  useEffect(() => {
    syncIsLinking()
  }, [syncIsLinking]);

  return {
    rendered,
    isLinking,
    swapSwitch: fireSwitch,
    syncIsLinking
  };
};

export default useDataLinkSwitch;
