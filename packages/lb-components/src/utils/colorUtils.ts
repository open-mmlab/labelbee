/**
 * transform rgba(a,g,b), to {r,g,b,a}
 * @param color
 */
export const toRGBAObj = (rgbStr: string | undefined) => {
  if (!rgbStr) {
    return;
  }
  const match = rgbStr.replace(/[rgba()]/g, '').split(',');
  if (match) {
    const [r, g, b, a] = match;
    return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
  }
  return undefined;
};

/**
 * transform {a,g,b,a} to rgba{r,g,b,a}
 * @param color
 */
export const toRGBAStr = (color: { r: number; g: number; b: number; a: number }) =>
  `rgba(${color.r},${color.g},${color.b},${color.a})`;
