/*
 * @file LLM tool score
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */
import React from 'react';
import { prefix } from '@/constant';
import { Radio } from 'antd';

interface IProps {
  title: React.ReactNode;
  score?: number;
  selectScore?: number;
  isDisableAll?: boolean;
  updateScore: (score: number) => void;
}

const ScoreGroupButton = (props: IProps) => {
  const { title, score = 5, selectScore, updateScore, isDisableAll } = props;
  const scoreLists = Array.from({ length: score }, (val, i) => i + 1);
  return (
    <div className={`${prefix}-LLMSidebar-contentBox`}>
      <span style={{ width: '100px' }}>{title}</span>
      <Radio.Group
        value={selectScore}
        onChange={(e) => updateScore(Number(e.target.value))}
        disabled={isDisableAll}
      >
        {scoreLists.map((i, index) => (
          <Radio.Button value={i} key={index} style={{ padding: '0px 16px' }}>
            {i}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
};

export default ScoreGroupButton;
