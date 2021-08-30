declare interface IAnnotationTaskInfo {
  id: string;
  name: string;
  type: number;
  desc: string;
  status: number;
  dataset: {
    id: string;
    name: string;
    fileCount: number;
    totalSize: number;
    tags: string[];
  };
  currentStep: number;
}
