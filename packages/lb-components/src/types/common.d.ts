declare interface AnyObject {
  [a: string]: any;
}

declare module 'web-worker:./highlightSegmentWorker.js' {
  const content: any;
  export default content;
}