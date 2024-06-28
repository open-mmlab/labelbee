import { useLatest, useMemoizedFn } from 'ahooks';
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
import { ImgUtils, PointCloud2DRectOperation, uuid } from '@labelbee/lb-annotation';
import { IPointCloudBoxRect, IPointCloud2DRectOperationViewRect } from '@labelbee/lb-utils';

import { TAfterImgOnLoad } from '../AnnotationView';
import _ from 'lodash';

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
  } = useContext(PointCloudContext);

  const { update2DViewRect, remove2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const update2DViewRectFn = useMemoizedFn<any>(update2DViewRect);
  const remove2DViewRectFn = useMemoizedFn<any>(remove2DViewRect);
  const newPointCloudResult = useRef(null);

  const [loading, setLoading] = useState(true);

  const rectListInImage = useMemo(
    () => rectList?.filter((item: IPointCloudBoxRect) => item.imageName === mappingData?.path),
    [mappingData?.path, rectList],
  );

  const mappingDataPath = useLatest(mappingData?.path);

  const handleUpdateDragResult = (rect: IPointCloud2DRectOperationViewRect) => {
    const { boxID } = rect;

    if (!shouldExcludePointCloudBoxListUpdate) {
      if (boxID) {
        const result = update2DViewRectFn?.(rect);
        newPointCloudResult.current = result;
        setPointCloudResult(result || []);
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
      return
    }

    if (!shouldExcludePointCloudBoxListUpdate) {
      const hasBoxIDRect = rectList.find((rect) => rect.boxID);
      if (hasBoxIDRect) {
        const result = remove2DViewRectFn?.(hasBoxIDRect);
        newPointCloudResult.current = result;
        setPointCloudResult(result || []);
        updateRectList();
        return;
      }
    }

    // Remove the matching item from the point cloud result(list)
    // @ts-ignore
    const matchedExtIdIDRect = rectList.find((rect) => rect.extId);
    if (matchedExtIdIDRect) {
      // @ts-ignore
      const { imageName, extId: boxID } = matchedExtIdIDRect
      const result = remove2DViewRectFn?.({ boxID, imageName });
      if (result) {
        newPointCloudResult.current = result;
        setPointCloudResult(result);
      }
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

  const updateRectList = useMemoizedFn(() => {
    const rectListByBoxList = shouldExcludePointCloudBoxListUpdate ? [] : getRectListByBoxList();
    const selectedRectID = operation.current?.selectedRectID;

    operation.current?.setResult([...rectListByBoxList, ...rectListInImage]);
    if (selectedRectID) {
      operation.current?.setSelectedRectID(selectedRectID);
    }
  });

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

      return () => {
        operation.current?.unbind('updateDragResult', handleUpdateDragResult);
        operation.current?.unbind('afterAddingDrawingRect', handleAddRect);
        operation.current?.unbind('deleteSelectedRects', handleRemoveRect);
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
    updateRectList();
  }, [defaultAttribute]);

  useEffect(() => {
    updateRectList();
  }, [rectListInImage]);

  useEffect(() => {
    updateRectList();
  }, [shouldExcludePointCloudBoxListUpdate])

  useEffect(() => {
    const preConfig = operation.current?.config ?? {};
    const newConfig = { ...preConfig, attributeList: config.attributeList ?? [] }

    operation.current?.setConfig(
      JSON.stringify(newConfig),
    );
  }, [config.attributeList]);

  return (
    <Spin spinning={loading}>
      <div ref={ref} style={{ position: 'relative', ...size }} />
    </Spin>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DRectOperationView,
);
