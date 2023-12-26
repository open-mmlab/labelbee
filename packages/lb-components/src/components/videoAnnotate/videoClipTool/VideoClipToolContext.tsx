/**
 * @author whq <752342314@qq.com>
 * @file Store for VideoClipTool
 * @date 2023-12-12
 */
import React from 'react';
import { EClipStatus } from './constant';
import { IInputList, IVideoTimeSlice } from '@labelbee/lb-utils';

interface IVideoClipToolContext {
  result: IVideoTimeSlice[];
  selectedID: string;
  attributeList: IInputList[];
  videoPlayer?: any;
  clipStatus: EClipStatus;
  selectedAttribute?: string;
  contextToCancel?: (e: any) => void;
}

export const VideoClipToolContext = React.createContext<IVideoClipToolContext>({
  result: [],
  selectedID: '',
  attributeList: [],
  clipStatus: EClipStatus.Stop,
});

export const VideoClipToolContextProvider = VideoClipToolContext.Provider;

interface IVideoClipAnnotatedListContext {
  onSelectedTimeSlice: (timeSlice: IVideoTimeSlice) => void;
  removeTimeSlice: (timeSlice: IVideoTimeSlice) => void;
  updateSelectedSliceTimeProperty: (val: number, key: 'start' | 'end') => void;
}

export const VideoClipAnnotatedListContext = React.createContext<IVideoClipAnnotatedListContext>({
  onSelectedTimeSlice: () => {},
  removeTimeSlice: () => {},
  updateSelectedSliceTimeProperty: () => {},
});

export const VideoClipAnnotatedListContextProvider = VideoClipAnnotatedListContext.Provider;
