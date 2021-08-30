import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { ToolInstance } from 'src/store/annotation/types';
import AttributeList from '@/components/attributeList';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';

interface IProps {
  toolInstance: ToolInstance;
  stepInfo: IStepInfo;
}

const SwitchAttributeList: React.FC<IProps> = (props) => {
  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { toolInstance } = props;

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('changeAttributeSidebar', (index: number) => {
        forceRender((s) => s + 1);

        if (!listRef.current) {
          return;
        }

        listRef.current.children[index]?.scrollIntoView({ block: 'center' });
      });
    }
  }, [toolInstance, listRef]);

  if (!props.stepInfo) {
    return null;
  }

  const config = jsonParser(props.stepInfo.config);
  if (config.attributeConfigurable !== true) {
    return null;
  }

  if (toolInstance?.config?.attributeList) {
    const list = toolInstance.config.attributeList.map((i: any) => ({ label: i.key, value: i.value }));
    list.unshift({ label: '无属性', value: '' });
    const attributeChanged = (v) => {
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
        />
      </div>
    );
  }

  return null;
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(
    state.annotation?.step,
    state.annotation?.stepList,
  );

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps)(SwitchAttributeList);
