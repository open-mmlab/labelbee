import React, { useEffect, useState } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { ToolInstance } from '@/store/annotation/types';
import { Divider } from 'antd/es';
import { useTranslation } from 'react-i18next';

interface IProps {
  toolInstance: ToolInstance;
}

const HiddenTips = (props: IProps) => {
  const { toolInstance } = props;
  const [_, forceRender] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('hiddenChange', () => {
        forceRender((s) => s + 1);
      });
    }
  }, [toolInstance]);

  if (!toolInstance) {
    return null;
  }

  const isHidden = toolInstance.isHidden;

  if (isHidden) {
    return (
      <span>
        {t('HideDrawnAnnotation')}
        <Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} />
      </span>
    );
  }

  return null;
};

const mapStateToProps = (state: AppState) => {
  return {
    toolInstance: state.annotation?.toolInstance,
  };
};

export default connect(mapStateToProps)(HiddenTips);
