import { ReactElement, RefObject } from 'react';

interface Common {
  defaultHeight?: number;
  minTopHeight?: number;
  minBottomHeight?: number;
  axis?: 'x' | 'y';
  localKey?: string;
  customDivider?: ReactElement;
  isShortcutButton?: boolean;
}

export interface DynamicResizerProps extends Common {
  children: ReactElement[] | Element[] | Boolean[];
}

export interface DragProps extends Common {
  containerRef: RefObject<HTMLDivElement>;
}
