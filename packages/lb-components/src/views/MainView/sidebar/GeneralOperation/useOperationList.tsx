import { IOperationConfig } from './ActionsConfirm';
import clearResultSvg from '@/assets/annotation/common/icon_clear.svg';
import clearResultASvg from '@/assets/annotation/common/icon_clear_a.svg';
import copyBackStepSvg from '@/assets/annotation/common/icon_invalid.svg';
import copyBackStepASvg from '@/assets/annotation/common/icon_invalid_a.svg';
import { StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { CopyBackWordResult } from '@/store/annotation/actionCreators';
import { store } from '@/index';

/**
 * Hooks for sidebar common operations' config
 * @param toolInstance
 * @returns
 */
const useOperationList = (toolInstance: any) => {
  const { t } = useTranslation();
  const iconStyle = {
    height: '25px',
    lineHeight: '25px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  /**
   * Empty current file result
   */
  const empty: IOperationConfig = {
    name: t('ClearLabel'),
    key: 'empty',
    imgSvg: clearResultSvg,
    hoverSvg: clearResultASvg,
    onClick: () => {
      toolInstance?.clearResult();
    },
  };

  /**
   * Set set validity for current file
   */
  const setValidity: IOperationConfig = {
    name: t(toolInstance?.valid === true ? 'SetAsInvalid' : 'SetAsValid'),
    key: 'setValidity',
    imgSvg: <StopOutlined style={iconStyle} />,
    hoverSvg: <StopOutlined style={{ color: '#666fff', ...iconStyle }} />,
    onClick: () => {
      toolInstance.setValid(!toolInstance.valid);
    },
  };

  /**
   * Copy previous file result
   */
  const copyPrevious: IOperationConfig = {
    name: t('CopyThePrevious'),
    key: 'copyPrevious',
    imgSvg: copyBackStepSvg,
    hoverSvg: copyBackStepASvg,
    onClick: () => {
      store.dispatch(CopyBackWordResult());
    },
  };

  return useMemo(() => {
    return {
      empty,
      setValidity,
      copyPrevious,
    };
  }, [toolInstance]);
};

export default useOperationList;
