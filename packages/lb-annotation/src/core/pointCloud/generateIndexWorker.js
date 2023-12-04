onmessage = function onmessage(e) {
  const { points } = e.data;

  const indexMap = new Map();

  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    const key = `${Math.ceil(x)}@${Math.ceil(y)}@${Math.ceil(z)}`;

    if (!indexMap.has(key)) {
      indexMap.set(key, []);
    }
    indexMap.get(key).push({
      x,
      y,
      z,
    });
  }

  this.postMessage({ indexMap });
};
