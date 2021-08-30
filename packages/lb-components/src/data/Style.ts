export const COLORS_ARRAY = [
  'rgba(128, 12, 249, 1)', // 6
  'rgba(0, 255, 48, 1)', // 3
  'rgba(255, 136, 247, 1)', // 7
  'rgba(255, 226, 50, 1)', // 2
  'rgba(153, 66, 23, 1)', // 8
  'rgba(2, 130, 250, 1)', // 5
  'rgba(255, 35, 35, 1)', // 1
  'rgba(0, 255, 234, 1)', // 4
];

export const NULL_COLOR = 'rgba(204, 204, 204, 1)';

export const DEFAULT_COLOR = {
  valid: {
    stroke: 'rgba(102, 111, 255, 0.6)',
    fill: 'rgba(102, 111, 255, 0.3)',
  },
  invalid: {
    stroke: 'rgba(255, 153, 102,1)',
    fill: 'rgba(255, 153, 102, 0.5)',
  },
  validSelected: {
    stroke: 'rgba(0, 15, 255, 0.8)',
    fill: 'rgba(0, 15, 255, 0.4)',
  },
  invalidSelected: {
    stroke: 'rgba(255,153,102,0.8)',
    fill: 'rgba(255,153,102,0.3)',
  },
  validHover: {
    stroke: 'rgba(0, 15, 255, 1)',
    fill: 'rgba(0, 15, 255, 0.5)',
  },

  invalidHover: {
    stroke: 'rgba(255,153,102,1)',
    fill: 'rgba(255,153,102,0.5)',
  },
};

export const CHANGE_COLOR: { [a: number]: any } = {
  1: {
    valid: 'rgba(0, 0, 255, 0.5)',
    select: {
      stroke: 'rgba(0, 15, 255, 1)',
      fill: 'rgba(0,15,255, 1)',
    },
    hover: 'rgba(0, 15, 255, 0.8)',
    line: 'rgba(102, 111, 255, 1 )',
  },
  3: {
    valid: 'rgba(0, 255, 255, 0.5)',
    select: {
      stroke: 'rgba(0, 212, 255,  1)',
      fill: 'rgba(0,212,255, 1)',
    },
    hover: 'rgba(0, 212, 255, 0.8)',
    line: 'rgba(102, 230, 255, 1)',
  },
  5: {
    valid: 'rgba(0, 255, 0, 0.5)',
    select: {
      stroke: 'rgba(149, 255, 1)',
      fill: 'rgba(149,255,0, 1)',
    },
    hover: 'rgba(149, 255, 0, 0.8)',
    line: 'rgba(191, 255, 102, 1)',
  },
  7: {
    valid: 'rgba(255, 255, 0, 0.5)',
    select: {
      stroke: 'rgba(255, 230, 102, 1)',
      fill: 'rgba(255,213,0, 1)',
    },
    hover: 'rgba(255, 230, 102, 0.8)',
    line: 'rgba(255, 230, 102, 1)',
  },
  9: {
    valid: 'rgba(255, 0, 255, 0.5)',
    select: {
      stroke: 'rgba(230, 102, 255, 1)',
      fill: 'rgba(213,0,255, 1)',
    },
    hover: 'rgba(230, 102, 255, 0.8)',
    line: 'rgba(230, 102, 255, 1)',
  },
};

export const BORDER_OPACITY_LEVEL: { [a: number]: number } = {
  1: 0.2,
  3: 0.4,
  5: 0.6,
  7: 0.8,
  9: 1.0,
};

export const FILL_OPACITY_LEVEL: { [a: number]: number } = {
  1: 0,
  3: 0.2,
  5: 0.4,
  7: 0.6,
  9: 0.8,
};
