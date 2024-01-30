import React from 'react';
import { TagOperation } from '@labelbee/lb-annotation';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { LabelBeeContext } from '@/store/ctx';
import { prefix } from '@/constant';
import SwitchAttributeList from '../SwitchAttributeList';
import GeneralOperation from '../GeneralOperation';
import NLPAnnotatedList from './NLPAnnotatedList';
import IndicatorDetermineList from './indicatorDetermine';

interface IProps {
  imgIndex: number;
  toolInstance: TagOperation;
  checkMode?: boolean;
}

/**
 * nlp tool attribute option list
 * @param param0
 * @returns
 */
const NlpAttributeList = ({
  setAttributeLockList,
  checkMode,
}: {
  setAttributeLockList: (list: string[]) => void;
  checkMode?: boolean;
}) => {
  if (checkMode) {
    return null;
  }

  return <SwitchAttributeList attributeLockChange={setAttributeLockList} />;
};

export const sidebarCls = `${prefix}-sidebar`;
const NLPSidebar: React.FC<IProps> = ({ toolInstance, checkMode }) => {
  const setAttributeLockList = (list: string[]) => {
    toolInstance?.setAttributeLockList(list);
  };

  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        <IndicatorDetermineList checkMode={checkMode} />
        <NlpAttributeList setAttributeLockList={setAttributeLockList} checkMode={checkMode} />
        <NLPAnnotatedList />;
      </div>
      {!checkMode && <GeneralOperation />}
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    toolInstance: state.annotation.toolInstance,
    imgIndex: state.annotation.imgIndex,
  };
}

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(NLPSidebar);
