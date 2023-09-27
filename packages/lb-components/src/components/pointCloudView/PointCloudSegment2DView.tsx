import { IA2MapStateProps, a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AnnotationView from '@/components/AnnotationView';
import { connect } from 'react-redux';
import { PointCloudContext } from './PointCloudContext';
import TitleButton from './components/TitleButton';
import {
  EPointCloudSegmentStatus,
  ICalib,
  IPointCloudSegmentation,
  ISize,
} from '@labelbee/lb-utils';
import { Spin } from 'antd';
import HighlightSegmentWorker from 'web-worker:./highlightSegmentWorker.js';
import { pointMappingLidar2image } from '@labelbee/lb-annotation';
import { debounce } from 'lodash';

interface IProps extends IA2MapStateProps {
  checkMode?: boolean;
}

const PointCloudSegment2DSingleView = ({
  path,
  url,
  calib,
  pcdUrl,
  highlightAttribute,
}: {
  path: string;
  url: string;
  calib: ICalib;
  pcdUrl?: string;
  highlightAttribute?: string;
}) => {
  const { ptSegmentInstance, cacheImageNodeSize, imageSizes } = useContext(PointCloudContext);
  const ref = useRef(null);
  const dataLoadedRef = useRef(0);
  const pcdMapping = useRef({});
  const imgSizeRef = useRef<ISize | undefined>();

  const [annotations, setAnnotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const highlightWorkerRef = useRef<Worker | undefined>(undefined);

  useEffect(() => {
    return () => {
      dataLoadedRef.current = 0;
      pcdMapping.current = {};
      imgSizeRef.current = undefined;
    };
  }, [pcdUrl]);

  // 1. Init CacheMap after pcdLoaded & imgLoaded.
  const cacheMappingPCD2Img = useCallback(() => {
    dataLoadedRef.current = dataLoadedRef.current + 1;
    // Need to load two resource: pcd & img
    if (dataLoadedRef.current === 2) {
      const points = ptSegmentInstance?.store?.originPoints; // Get the origin
      if (!points || !imgSizeRef.current) {
        console.error('cacheMappingPCD2Img Error', {
          path,
          points,
          filterSize: imgSizeRef.current,
        });
        return;
      }

      pcdMapping.current = pointMappingLidar2image(points, calib, imgSizeRef.current).pcdMapping;
    }
  }, [ptSegmentInstance]);

  // Highlight the points by indexes & pcdMapping.
  const highlight2DPoints = useMemo(() => {
    const func = (indexes: number[], defaultRGBA: string) => {
      if (indexes) {
        if (imgSizeRef.current) {
          if (highlightWorkerRef.current) {
            highlightWorkerRef.current?.terminate?.();
          }

          const cacheMap = pcdMapping.current;
          const highlightWorker = new HighlightSegmentWorker();
          highlightWorker.current = highlightWorker;
          setLoading(true);
          highlightWorker.postMessage({ cacheMap, indexes, defaultRGBA });
          highlightWorker.onmessage = (e: any) => {
            setAnnotations(e.data.annotations);
            highlightWorker.terminate();
            setLoading(false);
            highlightWorker.current = undefined;
          };
        }
      }
    };

    return debounce(func, 100);
  }, []);

  // Highlight Data by 'highlightAttribute';
  useEffect(() => {
    if (!ptSegmentInstance?.store) {
      return;
    }

    const indexesList = ptSegmentInstance.store.getHighlightAttribute(highlightAttribute ?? '');
    const toolStyle = ptSegmentInstance?.getColorFromConfig(highlightAttribute ?? '');
    highlight2DPoints(indexesList.flat(), toolStyle.stroke);
  }, [highlightAttribute, ptSegmentInstance]);

  /**
   * Listen the defaultAttribute Updated.
   */
  useEffect(() => {
    if (ptSegmentInstance) {
      const updateDefaultAttributeColor = ({ newAttribute }: { newAttribute: string }) => {
        const toolStyle = ptSegmentInstance?.getColorFromConfig(newAttribute);
        if (toolStyle) {
          setAnnotations(
            annotations.map((v) => ({
              ...v,
              defaultRGBA: toolStyle.stroke,
            })),
          );
        }
      };
      ptSegmentInstance.on('updateDefaultAttribute', updateDefaultAttributeColor);

      return () => {
        ptSegmentInstance.unbind('updateDefaultAttribute', updateDefaultAttributeColor);
      };
    }
  }, [ptSegmentInstance, annotations]);

  /**
   * Listen the ptSegmentInstance event.
   */
  useEffect(() => {
    if (ptSegmentInstance) {
      const highlightPointsByCachePoints = (data: {
        segmentStatus: EPointCloudSegmentStatus;
        cacheSegData: IPointCloudSegmentation;
      }) => {
        if (data.cacheSegData) {
          // 1. get filterPoints: number[] [x,y,z,x,y,z,...]; Test first one.
          const { cacheSegData } = data;
          if (cacheSegData?.indexes) {
            const toolStyle = ptSegmentInstance.getColorFromConfig(cacheSegData.attribute);
            highlight2DPoints(cacheSegData?.indexes, toolStyle.stroke);
          }
        } else {
          // clear annotations.
          setAnnotations([]);
        }
      };
      ptSegmentInstance.on('syncPointCloudStatus', highlightPointsByCachePoints);
      ptSegmentInstance.on('loadPCDFileEnd', cacheMappingPCD2Img);

      return () => {
        ptSegmentInstance.unbind('syncPointCloudStatus', highlightPointsByCachePoints);
        ptSegmentInstance.unbind('loadPCDFileEnd', cacheMappingPCD2Img);
      };
    }
  }, [ptSegmentInstance, pcdUrl, imageSizes]);

  const afterImgOnLoad = (imgNode: HTMLImageElement) => {
    cacheImageNodeSize({
      path,
      imgNode,
    });

    // Save the imgSize in current hook.
    imgSizeRef.current = { width: imgNode.width, height: imgNode.height };
    cacheMappingPCD2Img();
  };

  return (
    <div key={path} style={{ position: 'relative' }} ref={ref}>
      <TitleButton
        title={calib.calName}
        style={{
          background: 'rgba(0, 0, 0, 0.74)',
          color: '#FFFFFF',
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
        }}
      />
      <Spin spinning={loading} delay={1000}>
        <AnnotationView
          size={{
            width: 300,
            height: 200,
          }}
          key={path}
          src={url}
          annotations={annotations}
          afterImgOnLoad={afterImgOnLoad}
        />
      </Spin>
    </div>
  );
};

/**
 * The whole segment 2DView.
 * @param param0
 * @returns
 */
const PointCloudSegment2DView = ({ currentData, highlightAttribute }: IProps) => {
  const mappingImgList = currentData.mappingImgList ?? [];

  if (mappingImgList?.length > 0) {
    return (
      <div
        style={{
          position: 'absolute',
          height: '100%',
          overflowY: 'scroll',
          zIndex: 100,
          width: 300,
        }}
      >
        {mappingImgList?.map(
          (data, i) =>
            data.calib && (
              <PointCloudSegment2DSingleView
                key={data.path + i}
                path={data.path}
                url={data.url}
                calib={data.calib}
                pcdUrl={currentData.url}
                highlightAttribute={highlightAttribute}
              />
            ),
        )}
      </div>
    );
  }
  return null;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSegment2DView,
);
