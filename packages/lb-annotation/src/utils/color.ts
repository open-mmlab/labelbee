export const getColorValues = (rgbString: string) => {
  const values = rgbString.substring(4, rgbString.length - 1).split(',');
  return {
    red: parseInt(values[0], 10),
    green: parseInt(values[1], 10),
    blue: parseInt(values[2], 10),
  };
};
