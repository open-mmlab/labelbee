import React from 'react';
import { TagOperation } from '@labelbee/lb-annotation';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { LabelBeeContext } from '@/store/ctx';
import { prefix } from '@/constant';
import SwitchAttributeList from '../SwitchAttributeList';
import GeneralOperation from '../GeneralOperation';
import NLPAnnotatedList from './NLPAnnotatedList';

interface IProps {
  imgIndex: number;
  toolInstance: TagOperation;
  checkMode?: boolean;
}

export const sidebarCls = `${prefix}-sidebar`;
const NLPSidebar: React.FC<IProps> = ({ toolInstance, checkMode }) => {
  const setAttributeLockList = (list: string[]) => {
    toolInstance?.setAttributeLockList(list);
  };

  const attributeList = <SwitchAttributeList attributeLockChange={setAttributeLockList} />;
  const operation = <GeneralOperation />;
  const annotatedList = <NLPAnnotatedList />;

  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        {attributeList}
        {annotatedList}
      </div>
      {!checkMode && operation}
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return { toolInstance: state.annotation.toolInstance, imgIndex: state.annotation.imgIndex };
}

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(NLPSidebar);
