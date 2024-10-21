import { useLatest, useMemoizedFn, useDebounceEffect } from 'ahooks';
import { Spin } from 'antd/es';
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { connect } from 'react-redux';
import { usePointCloudViews } from '@/components/pointCloudView/hooks/usePointCloudViews';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { IMappingImg } from '@/types/data';
import { ImgUtils, PointCloud2DRectOperation, uuid, MathUtils } from '@labelbee/lb-annotation';
import {
  IPointCloudBoxRect,
  IPointCloud2DRectOperationViewRect,
  IPointCloudBox,
} from '@labelbee/lb-utils';
import { selectSpecifiedRectsFromTopViewSelectedIds } from './util';
import { useUpdateRectList } from './useUpdateRectList';

import { TAfterImgOnLoad } from '../AnnotationView';
import _ from 'lodash';
import { useToolStyleContext } from '@/hooks/useToolStyle';
import useToolConfigStore from '@/store/toolConfig';

interface IPointCloud2DRectOperationViewProps {
  mappingData?: IMappingImg;
  size: {
    width: number;
    height: number;
  };
  config: any;
  checkMode?: boolean;
  afterImgOnLoad: TAfterImgOnLoad;

  shouldExcludePointCloudBoxListUpdate?: boolean;
}

const PointCloud2DRectOperationView = (props: IPointCloud2DRectOperationViewProps) => {
  const {
    mappingData,
    size,
    config,
    checkMode,
    afterImgOnLoad,
    shouldExcludePointCloudBoxListUpdate,
  } = props;
  const { selectBoxVisibleSwitch } = useToolConfigStore();

  const imageUrl = mappingData?.url ?? '';
  const fallbackUrl = mappingData?.fallbackUrl ?? '';

  const {
    pointCloudBoxList,
    setPointCloudResult,
    defaultAttribute,
    rectList,
    addRectIn2DView,
    updateRectIn2DView,
    removeRectIn2DView,
    updateRectListByReducer,
    selectedIDs,
    setSelectedIDs,
    selectedID,
  } = useContext(PointCloudContext);

  const { value: toolStyle } = useToolStyleContext();

  const lastSelectedIds = useLatest(selectedIDs);

  const { update2DViewRect, remove2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const update2DViewRectFn = useMemoizedFn<any>(update2DViewRect);
  const remove2DViewRectFn = useMemoizedFn<any>(remove2DViewRect);
  const newPointCloudResult = useRef(null);

  const [loading, setLoading] = useState(true);

  const [rightClickRectId, setRightClickRectId] = useState<string>('');
  // Peugeot used to record the status of boxes that need to be updated
  const [isMemoryChange, setIsMemoryChange] = useState<boolean>(false);
  const [needUpdateCenter, setNeedUpdateCenter] = useState(true);

  const rectListInImage = useMemo(
    () => rectList?.filter((item: IPointCloudBoxRect) => item.imageName === mappingData?.path),
    [mappingData?.path, rectList],
  );

  // Save the previous rectListSnImage using useRef
  const prevRectListRef = useRef(rectListInImage);

  const mappingDataPath = useLatest(mappingData?.path);

  const recoverSelectedIds = useCallback(
    async (fn: (() => IPointCloudBox[] | null) | (() => Promise<IPointCloudBox[] | null>)) => {
      try {
        const cloned = lastSelectedIds.current.slice(0);

        const result = await Promise.resolve(fn());
        if (!result || result.length === 0) {
          return result;
        }

        if (cloned.length) {
          const set = new Set(cloned);
          const newSelectedIDs = (result as IPointCloudBox[])
            .filter((item) => set.has(item.id))
            .map((item) => item.id);

          setSelectedIDs(newSelectedIDs);
        }

        return result;
      } catch (err) {}
    },
    [setSelectedIDs],
  );

  const handleUpdateDragResult = (rect: IPointCloud2DRectOperationViewRect) => {
    const { boxID } = rect;
    setNeedUpdateCenter(false);
    if (!shouldExcludePointCloudBoxListUpdate) {
      if (boxID) {
        recoverSelectedIds(() => {
          // NOTE maybe change selectIds
          const result = update2DViewRectFn?.(rect);

          if (result) {
            newPointCloudResult.current = result;
            setPointCloudResult(result);

            return result as IPointCloudBox[];
          }

          return null;
        });

        return;
      }
    }

    updateRectIn2DView(rect, true);
  };

  const handleAddRect = (rect: IPointCloud2DRectOperationViewRect) => {
    if (mappingDataPath.current) {
      addRectIn2DView({ ...rect, imageName: mappingDataPath.current });
    }
  };

  const handleRemoveRect = (rectList: IPointCloud2DRectOperationViewRect[]) => {
    if (rectList.length === 0) {
      return;
    }

    if (!shouldExcludePointCloudBoxListUpdate) {
      const hasBoxIDRect = rectList.find((rect) => rect.boxID);
      if (hasBoxIDRect) {
        recoverSelectedIds(() => {
          // NOTE maybe change selectIds
          const result = remove2DViewRectFn?.(hasBoxIDRect);

          if (result) {
            newPointCloudResult.current = result;
            setPointCloudResult(result);
            updateRectList();

            return result;
          }

          return null;
        });

        return;
      }
    }

    // Remove the matching item from the point cloud result(list)
    // @ts-ignore
    const matchedExtIdIDRect = rectList.find((rect) => rect.extId);
    if (matchedExtIdIDRect) {
      recoverSelectedIds(() => {
        // @ts-ignore
        const { imageName, extId: boxID } = matchedExtIdIDRect;
        // NOTE maybe change selectIds
        const result = remove2DViewRectFn?.({ boxID, imageName });

        if (result) {
          newPointCloudResult.current = result;
          setPointCloudResult(result);
          return result;
        }

        return null;
      });
    }

    removeRectIn2DView(rectList);
  };

  const getRectListByBoxList = useMemoizedFn(() => {
    let allRects: IPointCloud2DRectOperationViewRect[] = [];
    pointCloudBoxList.forEach((pointCloudBox) => {
      const { rects = [], id, attribute, trackID } = pointCloudBox;
      const rect = rects.find((rect) => rect.imageName === mappingDataPath.current);
      const rectID = id + '_' + mappingDataPath.current;
      if (rect) {
        allRects = [...allRects, { ...rect, boxID: id, id: rectID, attribute, order: trackID }];
      }
    });
    return allRects;
  });

  const updateRectList = useUpdateRectList(() => {
    const rectListByBoxList = shouldExcludePointCloudBoxListUpdate ? [] : getRectListByBoxList();
    const selectedRectID = operation.current?.selectedRectID;

    // Case 1: Show all ids
    // const img2dResult = [...rectListByBoxList, ...rectListInImage]

    // Case 2: Only show the selected ids
    const clonedSelectedIDs = selectedIDs.slice(0);
    const img2dResult = selectBoxVisibleSwitch
      ? selectSpecifiedRectsFromTopViewSelectedIds(
          clonedSelectedIDs,
          rectListByBoxList,
          rectListInImage,
        )
      : [...rectListByBoxList, ...rectListInImage];

    let highLightList: any = [];

    // When the switch is turned off, highlight the 2D box of the corresponding 2D view in the selected top-down view
    if (!selectBoxVisibleSwitch && selectedIDs?.length) {
      highLightList = rectListByBoxList.filter((item) => {
        // When selecting a rectangle, filter out the selected rectangle
        if (selectedRectID) {
          return selectedIDs.includes(item.boxID) && !selectedRectID.includes(item.boxID);
        } else {
          return selectedIDs.includes(item.boxID);
        }
      });
    }

    operation.current?.setHighLightRectList(highLightList);
    operation.current?.setResult(img2dResult);

    if (rightClickRectId) {
      operation.current?.setSelectedRectID(rightClickRectId);
      setRightClickRectId('');
    } else {
      /**
       *  In addition to right-click selection, special scenarios require recording the state of the box before resetting,
       *  The setResult method will reset the state of all boxes in the current instance, and then use the setSelectedRectID method to reset the state of the previous boxes
       */
      if (isMemoryChange && selectedRectID) {
        operation.current?.setSelectedRectID(selectedRectID);
        setIsMemoryChange(false);
      }
    }
  });

  const onRightClick = ({ targetId, id }: { targetId: string; id: string }) => {
    setNeedUpdateCenter(false);
    setSelectedIDs(targetId);
    setRightClickRectId(id);
  };

  useEffect(() => {
    if (ref.current) {
      const toolInstance = new PointCloud2DRectOperation({
        container: ref.current,
        size,
        config: { ...config, isShowOrder: true, attributeConfigurable: true },
        checkMode,
      });

      operation.current = toolInstance;
      operation.current.init();
      operation.current.on('updateDragResult', handleUpdateDragResult);
      operation.current.on('afterAddingDrawingRect', handleAddRect);
      operation.current.on('deleteSelectedRects', handleRemoveRect);
      operation.current.on('onRightClick', onRightClick);

      return () => {
        operation.current?.unbind('updateDragResult', handleUpdateDragResult);
        operation.current?.unbind('afterAddingDrawingRect', handleAddRect);
        operation.current?.unbind('deleteSelectedRects', handleRemoveRect);
        operation.current?.unbind('onRightClick', onRightClick);
        operation.current?.destroy();
      };
    }
  }, []);

  useEffect(() => {
    const loadImage = async (url: string) => {
      try {
        const imgNode = await ImgUtils.load(url);
        return imgNode;
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }
    };

    const handleImageLoad = async () => {
      setLoading(true);
      let imgNode = await loadImage(imageUrl);

      if (!imgNode && fallbackUrl) {
        // If the primary URL fails and an alternate URL exists, try loading the alternate URL
        imgNode = await loadImage(fallbackUrl);
      }

      if (imgNode) {
        operation.current?.setImgNode(imgNode);
        afterImgOnLoad(imgNode);
      }

      setLoading(false);
    };

    if (operation.current && (imageUrl || fallbackUrl)) {
      handleImageLoad();
    }
  }, [imageUrl, fallbackUrl]);

  useEffect(() => {
    operation.current?.setSize(size);
  }, [size]);

  useEffect(() => {
    // Avoid repeated rendering
    if (pointCloudBoxList !== newPointCloudResult.current) {
      updateRectList();
    }
  }, [pointCloudBoxList]);

  useEffect(() => {
    const rect = rectListInImage.find((i) => i.id === operation.current.selectedRectID);
    operation.current?.setDefaultAttribute?.(defaultAttribute);

    if (rect) {
      // updateRectIn2DView({ ...operation.current?.selectedRect, attribute: defaultAttribute });
      updateRectListByReducer((preRectList) => {
        const filtered: IPointCloudBoxRect[] = [];
        let matched: any = null;

        preRectList.forEach((item: IPointCloudBoxRect) => {
          if (item.id !== operation.current.selectedRectID) {
            filtered.push(item);
          } else {
            matched = item;
          }
        });

        if (rect.extId === undefined) {
          matched = operation.current?.selectedRect;
        }

        return [
          ...filtered,
          {
            ...(matched || {}),
            attribute: defaultAttribute,
          },
        ];
      });
    }
    // When the attribute changes, it is necessary to record the status of the previous clicks
    setIsMemoryChange(true);
    updateRectList();
  }, [defaultAttribute]);

  useEffect(() => {
    const prevRectList = prevRectListRef.current;
    /**
     *  When there are changes related to box content such as deletion, movement, size change, etc.,
     *  it is necessary to record the previous state and maintain it
     */
    if (!_.isEqual(prevRectList, rectListInImage)) {
      setIsMemoryChange(true);
      updateRectList();
      // Record the latest list of rectangles
      prevRectListRef.current = rectListInImage;
    }
  }, [rectListInImage]);

  useEffect(() => {
    updateRectList();
  }, [shouldExcludePointCloudBoxListUpdate]);

  useEffect(() => {
    const preConfig = operation.current?.config ?? {};
    const newConfig = { ...preConfig, attributeList: config.attributeList ?? [] };

    operation.current?.setConfig(JSON.stringify(newConfig));
  }, [config.attributeList]);

  useEffect(() => {
    // Only enable add rect when no selected item
    operation.current?.setEnableAddRect(selectedIDs.length === 0);
    updateRectList();
  }, [selectedIDs]);

  useDebounceEffect(
    () => {
      // Center the view by selectedID
      if (!selectedID || !needUpdateCenter) {
        setNeedUpdateCenter(true);
        return;
      }
      const { rectList, size, zoom } = operation.current;
      // Use boxId for a normal connection, and use extId when disconnected.
      const rect = rectList.find((el: any) => el.boxID === selectedID || el.extId === selectedID);
      if (!rect) {
        setNeedUpdateCenter(true);
        return;
      }
      const centerPoint = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
      const currentPos = MathUtils.getCurrentPosFromRectCenter(size, centerPoint, zoom);
      operation.current.setHoverRectID(rect.id);
      operation.current.setCurrentPos(currentPos);
      operation.current.renderBasicCanvas();
      operation.current.render();
    },
    [selectedID],
    {
      wait: 200,
    },
  );

  useEffect(() => {
    const { hiddenText } = toolStyle || {};
    if (hiddenText === undefined) {
      return;
    }

    const instance = operation.current;
    if (!instance) {
      return;
    }

    // Merge with prev style
    const newStyle = {
      ...instance.style,
      ...toolStyle,
    };

    // Set style and re-render `PointCloud2DRectOperation`
    instance.setStyle(newStyle);
  }, [toolStyle]);

  useEffect(() => {
    updateRectList();
  }, [selectBoxVisibleSwitch]);

  return (
    <Spin spinning={loading}>
      <div ref={ref} style={{ position: 'relative', ...size }} />
    </Spin>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DRectOperationView,
);
