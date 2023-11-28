declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'color-rgba' {
  const content: (a: string) => any[];
  export default content;
}

declare module 'web-worker:./highlightWorker.js' {
  const content: any;
  export default content;
}
declare module 'web-worker:./filterBoxWorker.js' {
  const content: any;
  export default content;
}

declare module 'web-worker:./MathUtilsWorker.js' {
  const content: any;
  export default content;
}

declare module 'web-worker:./generateIndexWorker.js' {
  const content: any;
  export default content;
}
