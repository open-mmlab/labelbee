import React, { useRef, useState } from 'react';
import { Col, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import { prefix } from '@/constant';

export interface IOperationConfig {
  name: string;
  key: string;
  imgSvg: string | React.ReactElement;
  hoverSvg: string | React.ReactElement;
  onClick?: () => void;
  forbidConfirm?: boolean; // 是否禁止二次确认
  forbidOperation?: boolean; // 禁止操作,会有置灰操作（该部分由用户自己更改 ImgSvg 进行展示）
}

// 禁止的样式
const forbidStyle = {
  color: '#CCCCCC',
};

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

const ShowIcon = ({ isHover, info }: { isHover: string | null; info: IOperationConfig }) => {
  const disabled = !!info.forbidOperation;

  const _isHover = info.key === isHover && !disabled;

  let textStyle = {
    color: _isHover ? '#666fff' : '',
  };

  if (disabled) {
    textStyle = forbidStyle;
  }

  return (
    <div
      style={{ cursor: disabled ? 'not-allowed' : 'default' }}
      onClick={() => info?.forbidConfirm && !disabled && info?.onClick?.()}
    >
      <div className='icon'>
        <ActionIcon icon={_isHover ? info.hoverSvg : info.imgSvg} />
      </div>
      <div className='toolName' style={textStyle}>
        {info.name}
      </div>
    </div>
  );
};

const ActionsConfirm: React.FC<{ allOperation: IOperationConfig[] }> = ({ allOperation }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHover, setHover] = useState<string | null>(null);
  const { t } = useTranslation();
  const annotationLength = Math.floor(24 / allOperation.length);

  return (
    <div className='generalOperation' ref={ref}>
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
            {info.forbidConfirm ? (
              <ShowIcon info={info} isHover={isHover} />
            ) : (
              <Popconfirm
                title={<PopconfirmTitle info={info} />}
                placement='topRight'
                okText={t('Confirm')}
                cancelText={t('Cancel')}
                getPopupContainer={() => ref.current ?? document.body}
                onConfirm={info.onClick}
                overlayClassName={`${prefix}-pop-confirm`}
              >
                <div>
                  <ShowIcon info={info} isHover={isHover} />
                </div>
              </Popconfirm>
            )}
          </div>
        </Col>
      ))}
    </div>
  );
};

export default ActionsConfirm;
