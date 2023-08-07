import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import PointCloudBackView from '../../PointCloudBackView';
import PointCloudSideView from '../../PointCloudSideView';
import { getClassName } from '@/utils/dom';
import { useTranslation } from 'react-i18next';

interface IProps {
  selectAndEnlarge: boolean;
  checkMode?: boolean;
}
const SideAndBackOverView = (props: IProps) => {
  const { t } = useTranslation();
  const { selectAndEnlarge, checkMode } = props;

  const BACK_SIDE_CONTAIN_WIDTH = 360;
  const BACK_SIDE_CONTAIN_HEIGHT = 400;
  const initPositionX = window.innerWidth - BACK_SIDE_CONTAIN_WIDTH;
  const initPositionY = window.innerHeight - BACK_SIDE_CONTAIN_HEIGHT;

  const [position, setPosition] = useState({
    x: initPositionX,
    y: initPositionY,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      setPosition({
        x: initPositionX,
        y: initPositionY,
      });
      setOffset({ x: 0, y: 0 });
    };
  }, []);

  const onResize = () => {
    const initPositionX = window.innerWidth - BACK_SIDE_CONTAIN_WIDTH;
    const initPositionY = window.innerHeight - BACK_SIDE_CONTAIN_HEIGHT;

    setPosition({
      x: initPositionX,
      y: initPositionY,
    });
  };

  return (
    <div
      className={classNames({
        [getClassName('point-cloud-container', 'left-bottom')]: true,
        [getClassName('point-cloud-container', 'left-bottom-float')]: selectAndEnlarge,
      })}
      style={{
        top: position.y,
        left: position.x,
        width: 360,
      }}
    >
      {selectAndEnlarge && (
        <div
          className={getClassName('point-cloud-container', 'left-bottom-floatHeader')}
          draggable={'true'}
          onDragStart={(event) => {
            if (selectAndEnlarge) {
              setOffset({
                x: event.clientX - position.x,
                y: event.clientY - position.y,
              });
            }
          }}
          onDrag={(e: any) => {
            const moveX = e.clientX - offset.x;
            const moveY = e.clientY - offset.y;
            setPosition({ x: moveX, y: moveY });
          }}
          onDragEnd={(e: any) => {
            const moveX = e.clientX - offset.x;
            const moveY = e.clientY - offset.y;
            setPosition({ x: moveX, y: moveY });
          }}
        >
          {t('DragAndDrop')}
        </div>
      )}
      <PointCloudBackView checkMode={checkMode} />
      <PointCloudSideView checkMode={checkMode} />
    </div>
  );
};
export default SideAndBackOverView;
