import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { ICustomToolInstance } from '@/hooks/annotation';
import { prefix } from '@/constant';
import { classnames } from '@/utils';
import { INLPTextAnnotation } from '@/components/NLPToolView/types'

interface IProps {
  toolInstance: ICustomToolInstance;
  stepInfo: IStepInfo;
}

export const sidebarCls = `${prefix}-sidebar`;

const NLPAnnotatedList: React.FC<IProps> = (props) => {

  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const { toolInstance } = props;
  const { t } = useTranslation();

  const [highlight, setHighlight] = useState<string>('')

  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('changeAttributeSidebar', (index: number) => {
        forceRender((s) => s + 1);
      });
    }
    return () => {
      toolInstance?.unbindAll('changeAttributeSidebar');
    };
  }, [toolInstance, listRef]);

  const [result] = toolInstance.exportData()
  const annotatedList = result?.[0]?.textAnnotation ?? []

  const setHighlightKey = (key: string) => {
    toolInstance?.setHighlightKey(key)
    setHighlight(key)
  }

  if (annotatedList?.length === 0) return null
  return <div className={`${sidebarCls}__content__NLPList`}>
    {
      annotatedList.map((v: INLPTextAnnotation, k: number) => {
        const active = highlight === v.id
        return <div
          key={k}
          className={classnames({
            [`${sidebarCls}__content__NLPList__item`]: true,
            [`${sidebarCls}__content__NLPList__item__active`]: active,
          })}
          onClick={() => setHighlightKey(v.id)}
        >
          {`${k + 1}、${v.text}`}
        </div>
      })
    }
  </div>
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  NLPAnnotatedList,
);
