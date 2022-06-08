import { EMessage } from '../constants';

const message: Record<string, string> = {
  [EMessage.NoRotateNotice]: 'This Image contains data and cannot be rotated',
  [EMessage.RectErrorSizeNotice]: 'The drawing frame size is smaller than the minimum drawing size',
  [EMessage.TextCheckNumberErrorNotice]: 'Please enter in number-only format',
  [EMessage.TextCheckEnglishErrorNotice]: 'Please enter in English only format',
  [EMessage.TextCheckCustomErrorNotice]: 'Please enter in the required format',
  [EMessage.UpperLimitErrorNotice]: 'The number of vertices is not more than',
  [EMessage.LowerLimitErrorNotice]: 'The number of vertices is not less than',
  [EMessage.InvalidImage]: 'Invalid image, please skip this image',
  [EMessage.DisableDelete]: 'Disable delete',
  [EMessage.ClearPartialData]: 'Clear partial data',
  [EMessage.MarkerFinish]: 'ListAnnotation is finished',
  [EMessage.LowerLimitPoint]: 'The maximum number of points has been reached', // 缺少国际化
  [EMessage.NoRotateInDependence]: 'Disallow rotation in dependent cases',
  [EMessage.UnableToReannotation]: 'Unabled to reannotation',
  [EMessage.ForbiddenCreationOutsideBoundary]: 'Fobid creation outside boundary',
  [EMessage.SuccessfulEdgeAdsorption]: 'Successful edge adsorption',
};
export default message;
