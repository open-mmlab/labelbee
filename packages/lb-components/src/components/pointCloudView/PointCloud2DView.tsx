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
import { useSingleBox } from './hooks/useSingleBox';
import { ViewOperation } from '@labelbee/lb-annotation';
import { useTranslation } from 'react-i18next';

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
  const viewRef = useRef<{ toolInstance: ViewOperation }>();
  const { selectedBox } = useSingleBox();
  const size = useSize(ref);
  const { t } = useTranslation();

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
                  id: pointCloudBox.id,
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

  useEffect(() => {
    const toolInstance = viewRef.current?.toolInstance;

    if (!selectedBox || !toolInstance) {
      return;
    }
    const selected2data = annotations2d.find((v) => v.annotation.id === selectedBox.info.id);

    if (selected2data?.annotation.pointList?.length > 0) {
      toolInstance.focusPositionByPointList(selected2data?.annotation.pointList);
    }
  }, [selectedBox, viewRef.current, annotations2d]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-2d-container')}
      title={t('2DView')}
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
      style={{ display: hiddenData ? 'none' : 'flex' }}
    >
      <div className={getClassName('point-cloud-2d-image')} ref={ref}>
        <AnnotationView
          src={mappingData?.url ?? ''}
          annotations={annotations2d}
          size={size}
          ref={viewRef}
          globalStyle={{ display: hiddenData ? 'none' : 'block' }}
        />
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
