onmessage = function onmessage(e) {
  const { cacheMap, indexes, color } = e.data;
  const dataList = [];
  const len = indexes.length;
  const annotation = [];
  for (let i = 0; i < len; i = i + 1) {
    const point2d = cacheMap[indexes[i]];
    if (point2d) {
      annotation.push({
        ...point2d,
        color,
      });
    }
  }
  postMessage({ annotations: [{ type: 'pixelPoints', annotation }] });
};
