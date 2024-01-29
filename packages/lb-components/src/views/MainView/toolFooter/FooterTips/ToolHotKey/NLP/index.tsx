import { backward, forward } from '../common';
import ForwardSvg from '@/assets/annotation/toolHotKeyIcon/icon_next_kj.svg';

export const forwardWithEnter = {
  name: 'Save',
  icon: ForwardSvg,
  shortCut: ['Ctrl', 'Enter'],
};

const NLPShortCutTable = [backward, forward, forwardWithEnter];

export default NLPShortCutTable;
