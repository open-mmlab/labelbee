/**
 * @file Used to cover container and prompt
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2024.03.13
 */
import React from 'react';
export default ({ message, style }: { message: string; style?: React.CSSProperties }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        background: 'rgba(255, 87, 34, 1)',
        overflow: 'hidden',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        opacity: '0.7',
        zIndex: 30,
        ...style,
      }}
    >
      {message}
    </div>
  );
};
