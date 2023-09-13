onmessage = function onmessage(e) {
  const { cacheMap, indexes, color } = e.data;
  const dataList = [];
  const len = indexes.length;
  for (let i = 0; i < len; i = i + 1) {
    const point2d = cacheMap[indexes[i]];
    point2d &&
      dataList.push({
        type: 'rect',
        annotation: {
          ...point2d,
          width: 1,
          height: 1,
          fill: color,
          stroke: color,
          hiddenText: true,
        },
      });
  }
  postMessage({ annotations: dataList });
};
