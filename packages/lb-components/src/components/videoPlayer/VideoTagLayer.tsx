import React from 'react';
import { result2LabelKey } from './utils';
import type { ITagLabelsArray } from './types';
import { IInputList } from '@/types/main';

interface IVideoTagLayerProps {
  result: Array<{ result: { [key: string]: string } }>;
  inputList: IInputList[];
  hasPromptLayer?: boolean;
}

export const VideoTagLayer: React.FC<IVideoTagLayerProps> = ({ result, inputList, hasPromptLayer }) => {
  const tagsLabel: ITagLabelsArray = result2LabelKey(result, inputList);
  const tagLayerCSSProperty: React.CSSProperties = {
    position: 'absolute',
    zIndex: 20,
    padding: '0 20px',
    color: 'white',
    fontSize: 15,
    lineHeight: '32px',
    background: 'rgba(0, 255, 255, 0.32)',
    top: hasPromptLayer ? 40 : 0,
    right: 0,
    maxHeight: 'calc(100% - 80px)',
    overflowY: 'scroll',
  };
  return (
    <div style={tagLayerCSSProperty}>
      <table>
        <tbody>
          {tagsLabel.map(({ keyLabel, valuesLabelArray }) => (
            <tr key={keyLabel}>
              <td style={{ paddingRight: 8 }}>{`${keyLabel}:`}</td>
              <td>{`${valuesLabelArray.join('、')}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
