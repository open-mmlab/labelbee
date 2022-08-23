import React, { useState } from 'react';
import { Col, Popconfirm } from 'antd/es';
import { useTranslation } from 'react-i18next';

export interface IOperationConfig {
  name: string;
  key: string;
  imgSvg: string | React.ReactElement;
  hoverSvg: string | React.ReactElement;
  onClick: () => void;
}

const PopconfirmTitle = ({ info }: { info: IOperationConfig }) => {
  const { t } = useTranslation();
  if (info.key.startsWith('sure')) {
    return <div key={info.key}>{`${t('ConfirmTo')}${info.name.slice(0)}？`}</div>;
  }

  return <span>{info.name}</span>;
};

const ActionIcon = ({ icon }: { icon: React.ReactElement | string }) => {
  if (typeof icon === 'string') {
    return <img width={23} height={25} src={icon} />;
  }
  return icon;
};

const ActionsConfirm: React.FC<{ allOperation: IOperationConfig[] }> = ({ allOperation }) => {
  const [isHover, setHover] = useState<string | null>(null);
  const { t } = useTranslation();
  const annotationLength = Math.floor(24 / allOperation.length);

  return (
    <div className='generalOperation'>
      {allOperation.map((info, index) => (
        <Col span={annotationLength} key={index}>
          <div
            key={info.key}
            className='item'
            onMouseEnter={() => {
              setHover(info.key);
            }}
            onMouseLeave={() => {
              setHover(null);
            }}
          >
            <Popconfirm
              title={<PopconfirmTitle info={info} />}
              disabled={!info.key.startsWith('sure')}
              placement='topRight'
              okText={t('Confirm')}
              cancelText={t('Cancel')}
              onConfirm={info.onClick}
            >
              <div className='icon'>
                <ActionIcon icon={info.key === isHover ? info.hoverSvg : info.imgSvg} />
              </div>
              <div className='toolName' style={{ color: info.key === isHover ? '#666fff' : '' }}>
                {info.name}
              </div>
            </Popconfirm>
          </div>
        </Col>
      ))}
    </div>
  );
};

export default ActionsConfirm;
