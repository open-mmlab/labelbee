import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { GraphToolInstance } from 'src/store/annotation/types';
import AttributeList from '@/components/attributeList';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { useTranslation } from 'react-i18next';

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
      toolInstance.unbindAll('changeAttributeSidebar');
    };
  }, [toolInstance, listRef]);

  const attributeChanged = useCallback(
    (v: string) => {
      toolInstance.setDefaultAttribute(v);
      forceRender((s) => s + 1);
    },
    [toolInstance],
  );

  if (!props.stepInfo) {
    return null;
  }

  const config = jsonParser(props.stepInfo.config);
  if (config.attributeConfigurable !== true) {
    return null;
  }

  if (toolInstance?.config?.attributeConfigurable === true && toolInstance?.config?.attributeList) {
    const list = toolInstance.config.attributeList.map((i: any) => ({
      label: i.key,
      value: i.value,
    }));
    list.unshift({ label: t('NoAttribute'), value: '' });

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
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps)(SwitchAttributeList);
