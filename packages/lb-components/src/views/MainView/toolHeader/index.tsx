import React from 'react';
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

interface IProps {
  goBack?: (imgList?: IFileItem[]) => void;
  exportData?: (data: any[]) => void;
  headerName?: string;
  imgList: IFileItem[];
}

const ToolHeader: React.FC<IProps> = ({
  goBack, exportData, headerName, imgList,
}) => {
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

  return (
    <div className={classNames(`${prefix}-header`)}>
      <div className={`${prefix}-header__title`}>
        <LeftOutlined className={`${prefix}-header__icon`} onClick={closeAnnotation} />
        {headerName ? <span className={`${prefix}-header__name`}>{headerName}</span> : ''}
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
});

export default connect(mapStateToProps)(ToolHeader);
