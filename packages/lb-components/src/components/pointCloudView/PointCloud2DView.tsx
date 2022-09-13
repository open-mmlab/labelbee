import { getClassName } from '@/utils/dom';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import AnnotationView from '@/components/AnnotationView';
import { PointCloudContext } from './PointCloudContext';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { IFileItem } from '@/types/data';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import useSize from '@/hooks/useSize';

interface IProps {
  imgInfo: IFileItem;
}

const Toolbar = ({
  onNext,
  onPrev,
  imgLength,
  imgIndex,
}: {
  onNext: () => void;
  onPrev: () => void;
  imgLength: number;
  imgIndex: number;
}) => {
  return (
    <div>
      <LeftOutlined onClick={onPrev} />
      <span>
        {' '}
        {imgIndex + 1} / {imgLength}{' '}
      </span>

      <RightOutlined onClick={onNext} />
    </div>
  );
};

// TODO, It will be deleted when the exported type of lb-annotation is work.
interface IAnnotationDataTemporarily {
  type: string;
  annotation: any;
}

const PointCloud2DView = ({ imgInfo }: IProps) => {
  const [annotations2d, setAnnotations2d] = useState<IAnnotationDataTemporarily[]>([]);
  const { pointCloudBoxList, topViewInstance } = useContext(PointCloudContext);
  const [mappingIndex, setMappingIndex] = useState(0);
  const ref = useRef(null);
  const size = useSize(ref);

  const mappingData = imgInfo?.mappingImgList?.[mappingIndex];

  useEffect(() => {
    setMappingIndex(0);
  }, [imgInfo]);

  useEffect(() => {
    if (topViewInstance && mappingData) {
      const { pointCloudInstance } = topViewInstance;
      const defaultViewStyle = {
        fill: 'transparent',
        color: 'green',
      };
      const newAnnotations2d: IAnnotationDataTemporarily[] = pointCloudBoxList.reduce(
        (acc: IAnnotationDataTemporarily[], pointCloudBox) => {
          const viewDataPointList = pointCloudInstance.pointCloudLidar2image(
            pointCloudBox,
            mappingData.calib,
          );
          return [
            ...acc,
            ...viewDataPointList.map((v: any) => {
              return {
                type: v.type,
                annotation: {
                  pointList: v.pointList,
                  ...defaultViewStyle,
                },
              };
            }),
          ];
        },
        [],
      );

      setAnnotations2d(newAnnotations2d);
    }
  }, [pointCloudBoxList, mappingData]);

  const hiddenData = !imgInfo || !imgInfo?.mappingImgList || !(imgInfo?.mappingImgList?.length > 0);

  const annotationView = (
    <AnnotationView src={mappingData?.url ?? ''} annotations={annotations2d} size={size} />
  );

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-2d-container')}
      title='2D视图'
      toolbar={
        hiddenData ? undefined : (
          <Toolbar
            imgIndex={mappingIndex}
            imgLength={imgInfo.mappingImgList?.length ?? 0}
            onNext={() => {
              if (!imgInfo || !imgInfo?.mappingImgList) {
                return;
              }

              if (mappingIndex >= imgInfo?.mappingImgList?.length - 1) {
                return;
              }
              setMappingIndex((v) => v + 1);
            }}
            onPrev={() => {
              if (mappingIndex <= 0) {
                return;
              }
              setMappingIndex((v) => v - 1);
            }}
          />
        )
      }
    >
      <div className={getClassName('point-cloud-2d-image')} ref={ref}>
        {hiddenData ? null : annotationView}
      </div>
    </PointCloudContainer>
  );
};

const mapStateToProps = (state: AppState) => {
  const { imgList, imgIndex } = state.annotation;

  return {
    imgInfo: imgList[imgIndex],
  };
};

export default connect(mapStateToProps)(PointCloud2DView);
