import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { GraphToolInstance } from 'src/store/annotation/types';
import AttributeList from '@/components/attributeList';
import AttributeInputEditor from '@/components/attributeInputEditor';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import SubAttributeList from '@/components/subAttributeList';
import { IInputList } from '@labelbee/lb-utils';
import { Divider } from 'antd';

interface IProps {
  toolInstance?: GraphToolInstance;
  stepInfo?: IStepInfo;
}

const VideoClipToolAttributeList: React.FC<IProps> = (props) => {
  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const { toolInstance } = props;
  const { t } = useTranslation();

  // Resolve configuration, use empty object if stepInfo does not exist
  const config = props.stepInfo ? jsonParser(props.stepInfo.config) : {};
  const selectedAttribute = toolInstance?.defaultAttribute ?? '';
  const videoClipContext = (toolInstance as any)?.exportContext;
  const selectedID = videoClipContext?.selectedID;
  const result = videoClipContext?.result;
  const subAttributeList = config?.inputList ?? [];

  const selectedTimeSlice = useMemo(() => {
    if (selectedID && result) {
      return result.find((i: any) => i.id === selectedID);
    }
    return undefined;
  }, [selectedID, result]);

  const setAttributeLockList = (list: string[]) => {
    toolInstance?.setAttributeLockList(list);
  };

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

  // If the attribute configuration is not enabled, return null
  if (config.attributeConfigurable !== true) {
    return null;
  }

  const attributeChanged = (v: string) => {
    if (toolInstance) {
      toolInstance.setDefaultAttribute(v);
      forceRender((s) => s + 1);
    }
  };

  const setSubAttribute = (key: string, value: string) => {
    if (toolInstance && (toolInstance as any).setSubAttribute) {
      (toolInstance as any).setSubAttribute(key, value);
      forceRender((s) => s + 1);
    }
  };

  const getSubAttributeValue = (subAttribute: IInputList) => {
    if (selectedTimeSlice?.subAttribute) {
      return selectedTimeSlice.subAttribute[subAttribute.value];
    }
    return undefined;
  };

  const shouldShowSubAttribute =
    selectedAttribute &&
    selectedID &&
    selectedTimeSlice &&
    subAttributeList.length > 0 &&
    config?.secondaryAttributeConfigurable === true;

  // Render custom attribute input mode
  const renderCustomAttributeInput = () => {
    return (
      <div style={{ height: 0, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {selectedID && (
          <AttributeInputEditor
            selectedAttribute={selectedAttribute}
            attributeChanged={attributeChanged}
          />
        )}
        {shouldShowSubAttribute && (
          <>
            <Divider style={{ margin: 0 }} />
            <SubAttributeList
              subAttributeList={subAttributeList}
              setSubAttribute={setSubAttribute}
              getValue={getSubAttributeValue}
              lang='cn'
            />
          </>
        )}
      </div>
    );
  };

  // First, execute the custom attribute input mode
  if (config.customAttributeInput) {
    return renderCustomAttributeInput();
  }

  // Otherwise, the original owner attribute list selection mode will be used, with no changes to the original logic
  if (!config?.attributeList) {
    return null;
  }

  const list = config.attributeList.map((i: any) => ({
    label: i.key,
    value: i.value,
    color: i?.color,
  }));

  list.unshift({ label: t('NoAttribute'), value: '' });

  return (
    <div>
      <AttributeList
        list={list}
        attributeChanged={attributeChanged}
        selectedAttribute={selectedAttribute}
        ref={listRef}
        attributeLockChange={setAttributeLockList}
      />
      {shouldShowSubAttribute && (
        <>
          <Divider style={{ margin: 0 }} />
          <SubAttributeList
            subAttributeList={subAttributeList}
            setSubAttribute={setSubAttribute}
            getValue={getSubAttributeValue}
            lang='cn'
          />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  VideoClipToolAttributeList,
);

