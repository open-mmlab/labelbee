import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { GraphToolInstance } from 'src/store/annotation/types';
import AttributeList from '@/components/attributeList';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { useTranslation } from 'react-i18next';
import { EToolName } from '@/data/enums/ToolType';
import { LabelBeeContext } from '@/store/ctx';

interface IProps {
  toolInstance: GraphToolInstance;
  stepInfo: IStepInfo;
}

const SwitchAttributeList: React.FC<IProps> = (props) => {
  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const { toolInstance } = props;
  const { t } = useTranslation();

  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('changeAttributeSidebar', (index: number) => {
        forceRender((s) => s + 1);

        if (!listRef.current) {
          return;
        }

        listRef.current.children[index]?.scrollIntoView({ block: 'center' });
      });
    }
    return () => {
      toolInstance?.unbindAll('changeAttributeSidebar');
    };
  }, [toolInstance, listRef]);

  if (!props.stepInfo) {
    return null;
  }

  const config = jsonParser(props.stepInfo.config);
  const isScribbleTool = props.stepInfo.tool === EToolName.ScribbleTool;

  if (config.attributeConfigurable !== true && !isScribbleTool) {
    return null;
  }

  if ((config.attributeConfigurable === true || isScribbleTool) && config?.attributeList) {
    const list = config.attributeList.map((i: any) => ({
      label: i.key,
      value: i.value,
      color: i?.color,
    }));

    if (!isScribbleTool) {
      list.unshift({ label: t('NoAttribute'), value: '' });
    }

    const attributeChanged = (v: string) => {
      toolInstance.setDefaultAttribute(v);
      forceRender((s) => s + 1);
    };

    return (
      <div>
        <AttributeList
          list={list}
          attributeChanged={attributeChanged}
          selectedAttribute={toolInstance?.defaultAttribute ?? ''}
          ref={listRef}
          forbidDefault={isScribbleTool}
        />
      </div>
    );
  }

  return null;
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  SwitchAttributeList,
);
