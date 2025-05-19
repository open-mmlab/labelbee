/**
 * 2.5D QuadTree implementation
 * For efficient indexing and querying of cuboids in point cloud data
 * Uses quadtree division on XY plane, while storing Z-axis range information in each node
 */

/**
 * Preprocess cuboid by adding bounding box information and color
 * @param {Object} cuboid - Cuboid object
 * @param {Object} colorList - Color list
 * @returns {Object} - Cuboid object with boundary info and color
 */
export function preprocessCuboid(cuboid, colorList) {
  const { polygonPointList, zMin, zMax, attribute, valid, id } = cuboid;

  // Calculate XY plane bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const pointCount = polygonPointList.length;
  for (let i = 0; i < pointCount; i++) {
    const { x, y } = polygonPointList[i];
    minX = x < minX ? x : minX;
    maxX = x > maxX ? x : maxX;
    minY = y < minY ? y : minY;
    maxY = y > maxY ? y : maxY;
  }

  // Precalculate color info - optimization
  let colorInfo;
  if (valid === false) {
    // Use precalculated constants to avoid division
    colorInfo = [1, 0.4039, 0.4]; // Corresponds to [1, 103/255, 102/255]
  } else if (colorList && colorList[attribute]) {
    // Avoid creating temporary arrays and function calls
    const { rgba } = colorList[attribute];
    colorInfo = [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255];
  } else {
    colorInfo = [1, 0, 0];
  }

  // Return cuboid with boundary info
  return {
    id,
    minX,
    maxX,
    minY,
    maxY,
    zMin,
    zMax,
    width: maxX - minX,
    height: maxY - minY,
    depth: zMax - zMin,
    centerX: (minX + maxX) * 0.5,
    centerY: (minY + maxY) * 0.5,
    centerZ: (zMin + zMax) * 0.5,
    polygonPointList,
    colorInfo,
    attribute,
    valid,
  };
}

/**
 * Calculate point cloud boundaries
 * @param {Array} points - Point cloud data array
 * @returns {Object} - Boundary information
 */
export function getBoundaryFromPoints(points) {
  if (!points || points.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1, width: 1, height: 1, depth: 1 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  // Batch process points for better performance
  const pointCount = points.length;
  for (let i = 0; i < pointCount; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    // Use conditional checks instead of Math.min/max for better performance
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  // Add small padding
  const padding = Math.max(maxX - minX, maxY - minY) * 0.01;

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const depth = maxZ - minZ;

  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
    minZ,
    maxZ,
    width,
    height,
    depth,
    centerX: (minX + maxX) * 0.5,
    centerY: (minY + maxY) * 0.5,
  };
}

/**
 * 2.5D QuadTree class - High performance implementation
 */
export class QuadTree25D {
  /**
   * Create quadtree node
   * @param {Object} boundary - Boundary
   * @param {number} capacity - Node capacity
   * @param {number} maxLevel - Max depth
   * @param {number} level - Current depth
   */
  constructor(boundary, capacity = 16, maxLevel = 6, level = 0) {
    // Flatten boundary representation to reduce property access
    this.minX = boundary.minX;
    this.maxX = boundary.maxX;
    this.minY = boundary.minY;
    this.maxY = boundary.maxY;
    this.minZ = boundary.minZ || -Infinity;
    this.maxZ = boundary.maxZ || Infinity;

    this.width = boundary.width || this.maxX - this.minX;
    this.height = boundary.height || this.maxY - this.minY;
    this.centerX = boundary.centerX || (this.minX + this.maxX) * 0.5;
    this.centerY = boundary.centerY || (this.minY + this.maxY) * 0.5;

    this.capacity = capacity;
    this.maxLevel = maxLevel;
    this.level = level;
    this.cuboids = []; // Store cuboid objects
    this.divided = false;
    this.children = null; // Use array to store child nodes
    this.pointCount = 0; // Track point count
  }

  /**
   * Check if point is within boundary - Inline version
   */
  containsPoint(x, y, z) {
    return (
      (x - this.minX) * (this.maxX - x) >= 0 &&
      (y - this.minY) * (this.maxY - y) >= 0 &&
      (z - this.minZ) * (this.maxZ - z) >= 0
    );
  }

  /**
   * Check if cuboid intersects with current boundary - Inline version
   */
  intersectsCuboid(cuboid) {
    return !(
      cuboid.maxX < this.minX ||
      cuboid.minX > this.maxX ||
      cuboid.maxY < this.minY ||
      cuboid.minY > this.maxY ||
      cuboid.zMax < this.minZ ||
      cuboid.zMin > this.maxZ
    );
  }

  /**
   * Split node into four child nodes - Optimized version
   */
  subdivide() {
    if (this.divided) return;

    const halfWidth = this.width * 0.5;
    const halfHeight = this.height * 0.5;
    const nextLevel = this.level + 1;

    // Create child nodes
    this.children = [
      // Create child nodes in NW, NE, SW, SE order
      new QuadTree25D(
        {
          minX: this.minX,
          maxX: this.centerX,
          minY: this.minY,
          maxY: this.centerY,
          minZ: this.minZ,
          maxZ: this.maxZ,
          width: halfWidth,
          height: halfHeight,
        },
        this.capacity,
        this.maxLevel,
        nextLevel,
      ),

      new QuadTree25D(
        {
          minX: this.centerX,
          maxX: this.maxX,
          minY: this.minY,
          maxY: this.centerY,
          minZ: this.minZ,
          maxZ: this.maxZ,
          width: halfWidth,
          height: halfHeight,
        },
        this.capacity,
        this.maxLevel,
        nextLevel,
      ),

      new QuadTree25D(
        {
          minX: this.minX,
          maxX: this.centerX,
          minY: this.centerY,
          maxY: this.maxY,
          minZ: this.minZ,
          maxZ: this.maxZ,
          width: halfWidth,
          height: halfHeight,
        },
        this.capacity,
        this.maxLevel,
        nextLevel,
      ),

      new QuadTree25D(
        {
          minX: this.centerX,
          maxX: this.maxX,
          minY: this.centerY,
          maxY: this.maxY,
          minZ: this.minZ,
          maxZ: this.maxZ,
          width: halfWidth,
          height: halfHeight,
        },
        this.capacity,
        this.maxLevel,
        nextLevel,
      ),
    ];

    this.divided = true;

    // Distribute cuboids to child nodes
    const len = this.cuboids.length;
    for (let i = 0; i < len; i++) {
      const cuboid = this.cuboids[i];
      for (let j = 0; j < 4; j++) {
        if (this.children[j].intersectsCuboid(cuboid)) {
          this.children[j].insert(cuboid);
        }
      }
    }

    // Root node keeps a copy, non-root nodes can clear
    if (this.level > 0) {
      this.cuboids = [];
    }
  }

  /**
   * Insert cuboid into quadtree - Optimized version
   */
  insert(cuboid) {
    // Quick check if intersects with boundary
    if (!this.intersectsCuboid(cuboid)) {
      return false;
    }

    // Non-leaf node: pass down to child nodes
    if (this.divided) {
      let inserted = false;
      for (let i = 0; i < 4; i++) {
        if (this.children[i].insert(cuboid)) {
          inserted = true;
        }
      }

      // Root node keeps all cuboids
      if (this.level === 0) {
        this.cuboids.push(cuboid);
      }

      return inserted;
    }

    // Leaf node: add to current node
    this.cuboids.push(cuboid);
    this.pointCount++;

    // If over capacity and not at max depth, subdivide
    if (this.pointCount > this.capacity && this.level < this.maxLevel) {
      this.subdivide();
    }

    return true;
  }

  /**
   * Find cuboid containing given point - Internal method
   * @returns {Object|null} Returns first cuboid containing point, or null if not found
   */
  _findCuboidContainingPoint(x, y, z) {
    const len = this.cuboids.length;

    for (let i = 0; i < len; i++) {
      const cuboid = this.cuboids[i];

      // First check if within z-axis range
      if (z < cuboid.zMin || z > cuboid.zMax) {
        continue;
      }

      // Quick AABB test as initial filter to exclude points obviously out of range
      if (x < cuboid.minX || x > cuboid.maxX || y < cuboid.minY || y > cuboid.maxY) {
        continue;
      }

      // Use ray-casting to determine if point is in polygon on XY plane
      const points = cuboid.polygonPointList;
      let inside = false;

      // Ray-Casting Algorithm to determine if point is inside polygon
      for (let j = 0, k = points.length - 1; j < points.length; k = j++) {
        const xj = points[j].x;
        const yj = points[j].y;
        const xk = points[k].x;
        const yk = points[k].y;

        // Check if ray from point horizontally to right intersects with polygon edge
        const intersect = yj > y !== yk > y && x < ((xk - xj) * (y - yj)) / (yk - yj) + xj;
        if (intersect) {
          inside = !inside;
        }
      }

      if (inside) {
        return { cuboid, colorInfo: cuboid.colorInfo };
      }
    }

    return null;
  }

  /**
   * Query cuboid and color info containing point - High performance version
   * @returns {Object|null} Returns cuboid info containing point, or null if not found
   */
  queryPoint(point) {
    // Extract coordinates using object destructuring
    const { x, y, z } = point;

    // Quick boundary check
    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY || z < this.minZ || z > this.maxZ) {
      return null;
    }

    // If leaf node, check cuboids in current node
    if (!this.divided) {
      return this._findCuboidContainingPoint(x, y, z);
    }

    // Calculate quadrant index containing point
    // 0: NW, 1: NE, 2: SW, 3: SE
    const quadrantIndex = (y < this.centerY ? 0 : 2) + (x < this.centerX ? 0 : 1);

    // First query the quadrant likely containing the point
    let result = this.children[quadrantIndex].queryPoint(point);

    // If no result found, query other quadrants (point might be on boundary)
    if (!result) {
      for (let i = 0; i < 4; i++) {
        if (i !== quadrantIndex) {
          result = this.children[i].queryPoint(point);
          if (result) break;
        }
      }
    }

    // If children found no result and this is root node, check root node's cuboids
    if (!result && this.level === 0) {
      result = this._findCuboidContainingPoint(x, y, z);
    }

    return result;
  }

  /**
   * Clear quadtree
   */
  clear() {
    this.cuboids = [];
    this.pointCount = 0;

    if (this.divided) {
      for (let i = 0; i < 4; i++) {
        if (this.children[i]) {
          this.children[i].clear();
        }
      }
      this.divided = false;
      this.children = null;
    }
  }
}
