declare module '*.svg';
declare module '*.module.scss';
declare module '@labelbee/wavesurfer';
declare module '@labelbee/wavesurfer/dist/plugin/wavesurfer.regions.js';
declare module '@labelbee/wavesurfer/dist/plugin/wavesurfer.cursor.js';
declare module 'web-worker:./highlightSegmentWorker.js' {
  const content: any;
  export default content;
}
