/**
 * The component which provides the batch operation for connection/disconnection
 */

import React, { FC, useCallback, useContext } from 'react';
import { Button, Popconfirm } from 'antd';
import type { PopconfirmProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { EventBus } from '@labelbee/lb-annotation';

type Confirm = NonNullable<PopconfirmProps['onConfirm']>;
type Cancel = NonNullable<PopconfirmProps['onCancel']>;

export enum EventBusEvent {
  switchConnect = 'batch:switch-connect',
}

const BatchSwitchConnectIn2DView: FC = () => {
  const { cuboidBoxIn2DView } = useContext(PointCloudContext);
  const { t } = useTranslation();

  const confirm = useCallback((e: Parameters<Confirm>[0], isConnect: boolean) => {
    // window.console.log('confirm: ', e, isConnect)
    EventBus.emit(EventBusEvent.switchConnect, isConnect);
  }, []);

  const conncectConfirm: Confirm = useCallback(
    (e) => {
      confirm(e, true);
    },
    [confirm],
  );

  const disconnectConfirm: Confirm = useCallback(
    (e) => {
      confirm(e, false);
    },
    [confirm],
  );

  // NOTE only support the `SwitchCuboidBoxIn2DView` is switched to "2D Rect"
  if (cuboidBoxIn2DView) {
    return null;
  }

  return (
    <div style={{ margin: '0 10px' }}>
      {t('2DImageBatch')} &nbsp;
      <Popconfirm
        title={t('ConfirmToBatchConnect')}
        onConfirm={conncectConfirm}
        okText={t('Confirm')}
        cancelText={t('Cancel')}
      >
        <Button size='small'>{t('Connect')}</Button>
      </Popconfirm>
      &nbsp;
      <Popconfirm
        title={t('ConfirmToBatchDisconnect')}
        onConfirm={disconnectConfirm}
        okText={t('Confirm')}
        cancelText={t('Cancel')}
      >
        <Button size='small'>{t('Disconnect')}</Button>
      </Popconfirm>
    </div>
  );
};

export default BatchSwitchConnectIn2DView;
