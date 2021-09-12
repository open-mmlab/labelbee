import React, { useCallback, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
// import styles from './index.scss';
import { connect } from 'react-redux';
import { store } from 'src';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IFileItem } from '@/types/data';
import { AppState } from '@/store';
import classNames from 'classnames';
import { ESubmitType, prefix } from '@/constant';
import ExportData from './ExportData';
import HeaderOption from './headerOption';
import { EToolName } from '@/data/enums/ToolType';
import { AnnotationEngine } from '@sensetime/annotation';

interface IProps {
  goBack?: (imgList?: IFileItem[]) => void;
  exportData?: (data: any[]) => void;
  headerName?: string;
  imgList: IFileItem[];
  annotationEngine: AnnotationEngine;
}

const ToolHeader: React.FC<IProps> = ({
  goBack,
  exportData,
  headerName,
  imgList,
  annotationEngine,
}) => {
  const [, forceRender] = useState(0);

  // render 数据展示
  const currentOption = <ExportData exportData={exportData} />;

  const closeAnnotation = () => {
    store.dispatch({
      type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA,
      payload: {
        submitType: ESubmitType.Quit,
      },
    });
    if (goBack) {
      goBack(imgList);
    }
  };

  const transformToolname = useCallback(() => {
    let newToolName = EToolName.Polygon;

    if (annotationEngine.toolName === EToolName.Polygon) {
      newToolName = EToolName.Rect;
    }

    annotationEngine.setToolName(newToolName);
    forceRender((s) => s + 1);
  }, [annotationEngine]);

  return (
    <div className={classNames(`${prefix}-header`)}>
      <div className={`${prefix}-header__title`}>
        <LeftOutlined className={`${prefix}-header__icon`} onClick={closeAnnotation} />
        {headerName ? <span className={`${prefix}-header__name`}>{headerName}</span> : ''}
        {annotationEngine && (
          <>
            <span style={{ margin: 10 }}>{annotationEngine.toolName}</span>
            <button onClick={transformToolname}>切换当前工具(临时）</button>
          </>
        )}
        {currentOption}
        <div
          id='operationNode'
          className={`${prefix}-header__operationNode`}
          style={{ left: window.innerWidth / 2 - 174 / 2 }}
        >
          <HeaderOption />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  imgList: state.annotation.imgList,
  annotationEngine: state.annotation.annotationEngine,
});

export default connect(mapStateToProps)(ToolHeader);
