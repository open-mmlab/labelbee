/**
 * transform rgba(a,g,b), to {r,g,b,a} / [r,g,b,a]
 * @param color
 */
export const toRGBAObj = (rgbStr: string, toArray?: boolean) => {
  const match = rgbStr.replace(/[rgba()]/g, '').split(',');
  if (match) {
    const [r, g, b, a] = match;
    if (toArray) {
      return [r, g, b, a];
    }
    return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
  }
  return '';
};

/**
 * transform {a,g,b,a} to rgba{r,g,b,a}
 * @param color
 */
export const toRGBAStr = (color: { r: number; g: number; b: number; a: number }) =>
  `rgba(${color.r},${color.g},${color.b},${color.a})`;
