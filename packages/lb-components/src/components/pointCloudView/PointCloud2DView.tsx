import { getClassName } from '@/utils/dom';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import AnnotationView from '@/components/AnnotationView';
import { PointCloudContext } from './PointCloudContext';
import { connect } from 'react-redux';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import useSize from '@/hooks/useSize';
import { useSingleBox } from './hooks/useSingleBox';
import { ViewOperation, pointCloudLidar2image } from '@labelbee/lb-annotation';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { toolStyleConverter } from '@labelbee/lb-utils';

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

const PointCloud2DView = ({ currentData, config }: IA2MapStateProps) => {
  const [annotations2d, setAnnotations2d] = useState<IAnnotationDataTemporarily[]>([]);
  const { topViewInstance, displayPointCloudList } = useContext(PointCloudContext);
  const [selectedID, setSelectedID] = useState('');
  const [mappingIndex, setMappingIndex] = useState(0);
  const ref = useRef(null);
  const viewRef = useRef<{ toolInstance: ViewOperation }>();
  const { selectedBox } = useSingleBox();
  const size = useSize(ref);
  const { t } = useTranslation();

  const mappingData = currentData?.mappingImgList?.[mappingIndex];

  useEffect(() => {
    setMappingIndex(0);
  }, [currentData]);

  useEffect(() => {
    if (topViewInstance && mappingData) {
      const defaultViewStyle = {
        fill: 'transparent',
        color: 'green',
      };

      const newAnnotations2d: IAnnotationDataTemporarily[] = displayPointCloudList.reduce(
        (acc: IAnnotationDataTemporarily[], pointCloudBox) => {
          const { transferViewData: viewDataPointList, viewRangePointList } = pointCloudLidar2image(
            pointCloudBox,
            mappingData.calib,
          );

          const stroke = toolStyleConverter.getColorFromConfig(
            { attribute: pointCloudBox.attribute },
            {
              ...config,
              attributeConfigurable: true,
            },
            {},
          )?.stroke;

          const newArr = [
            ...acc,
            ...viewDataPointList!.map((v: any) => {
              return {
                type: v.type,
                annotation: {
                  id: pointCloudBox.id,
                  pointList: v.pointList,
                  ...defaultViewStyle,
                  stroke,
                },
              };
            }),
          ];

          if (pointCloudBox.id === selectedID) {
            newArr.push({
              type: 'polygon',
              annotation: {
                id: selectedID,
                pointList: viewRangePointList,
                ...defaultViewStyle,
                stroke,
                fill: 'rgba(255, 255, 255, 0.6)',
              },
            });
          }

          return newArr;
        },
        [],
      );

      setAnnotations2d(newAnnotations2d);
    }
  }, [displayPointCloudList, mappingData, selectedID]);

  const hiddenData =
    !currentData || !currentData?.mappingImgList || !(currentData?.mappingImgList?.length > 0);

  const afterImgOnLoad = useCallback(() => {
    const toolInstance = viewRef.current?.toolInstance;

    // Clear Selected.
    setSelectedID('');

    if (!selectedBox || !toolInstance) {
      return;
    }
    const selected2data = annotations2d.find((v) => v.annotation.id === selectedBox.info.id);

    let id = '';
    if (selected2data?.annotation.pointList?.length > 0) {
      toolInstance.focusPositionByPointList(selected2data?.annotation.pointList);
      id = selectedBox.info.id;
      setSelectedID(id);
    }
  }, [selectedBox, viewRef.current, annotations2d, mappingIndex]);

  /**
   * If the status is updated, it needs to
   */
  useEffect(() => {
    afterImgOnLoad();
  }, [afterImgOnLoad]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-2d-container')}
      title={t('2DView')}
      toolbar={
        hiddenData ? undefined : (
          <Toolbar
            imgIndex={mappingIndex}
            imgLength={currentData.mappingImgList?.length ?? 0}
            onNext={() => {
              if (!currentData || !currentData?.mappingImgList) {
                return;
              }

              if (mappingIndex >= currentData?.mappingImgList?.length - 1) {
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
      style={hiddenData ? { display: 'none' } : { display: 'flex', minHeight: 200, maxHeight: 500 }}
    >
      <div className={getClassName('point-cloud-2d-image')} ref={ref}>
        <AnnotationView
          src={mappingData?.url ?? ''}
          annotations={annotations2d}
          size={size}
          ref={viewRef}
          globalStyle={{
            display: hiddenData ? 'none' : 'block',
          }}
          afterImgOnLoad={afterImgOnLoad}
          zoomInfo={{
            min: 0.01,
            max: 1000,
            ratio: 0.4,
          }}
        />
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DView,
);
