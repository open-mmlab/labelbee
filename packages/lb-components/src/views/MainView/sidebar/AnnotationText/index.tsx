import React, { useEffect, useState } from 'react';
import { message } from 'antd/es';
import TextAreaFormat from '@/views/MainView/sidebar/TextAreaFormat';
import { TextUtils } from '@/utils/TextUtils';
import { AppState } from '@/store';
import { GraphToolInstance } from '@/store/annotation/types';
import { connect } from 'react-redux';
import { LabelBeeContext } from '@/store/ctx';

interface IProps {
  toolInstance: GraphToolInstance;
}

const AnnotationText: React.FC<IProps> = ({ toolInstance }) => {
  const [, forceRender] = useState<number>(0);
  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('selectedChange', () => {
        forceRender((s) => s + 1);
      });
      toolInstance.singleOn('updateTextAttribute', () => {
        // 文本属性的更新

        forceRender((s) => s + 1);
      });

      toolInstance.singleOn('messageError', (error: string) => {
        message.error(error);
      });
    }
  }, [toolInstance]);

  if (!toolInstance) {
    return null;
  }

  const { config, selectedID } = toolInstance;
  if (config?.textConfigurable && selectedID) {
    return (
      <TextAreaFormat
        onChange={toolInstance.textChange}
        textValue={toolInstance.selectedText}
        checkString={TextUtils.checkString(config?.textCheckType, config?.customFormat)}
        textCheckType={config.textCheckType}
      />
    );
  }
  return null;
};

function mapStateToProps(state: AppState) {
  return { toolInstance: state.annotation.toolInstance };
}

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(AnnotationText);
