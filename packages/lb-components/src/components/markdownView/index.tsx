/*
 * @file markdown view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-10-08
 */

import React from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css';
import styles from './index.module.scss';
import { classnames } from '@/utils';

interface IProps {
  value: string;
  transformImageUri?: (uri: string) => string;
  transformLinkUri?: (uri: string) => string;
  components?: Components;
}
const MarkdownView = (props: IProps) => {
  const { value, transformImageUri, transformLinkUri, components } = props;

  const code = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      /**
       * Difference version' React cause type error
       * https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/539
       */
      // @ts-ignore
      <SyntaxHighlighter
        {...props}
        className='markdown-code-viewer'
        language={match[1]}
        style={docco}
        PreTag='div'
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    );
  };

  return (
    <Markdown
      className={classnames({
        'markdown-body': true,
        [styles.markdownView]: true,
      })}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [
          rehypeKatex,
          {
            output: 'mathml',
          },
        ],
      ]}
      transformImageUri={transformImageUri}
      transformLinkUri={transformLinkUri}
      components={{
        code,
        ...components,
      }}
    >
      {value}
    </Markdown>
  );
};

export default MarkdownView;
