/**
 * @file POINTCLOUD - ALPHA - DEMO
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

/*eslint import/no-unresolved: 0*/
import * as THREE from 'three';
import {
  PerspectiveShiftUtils,
  TMatrix4Tuple,
  EPerspectiveView,
  IVolume,
  IPointCloudBox,
  I3DSpaceCoord,
  IPointCloudConfig,
  toolStyleConverter,
} from '@labelbee/lb-utils';
import { BufferAttribute, PointsMaterial, Shader } from 'three';
import HighlightWorker from 'web-worker:./highlightWorker.js';
import FilterBoxWorker from 'web-worker:./filterBoxWorker.js';
import { isInPolygon } from '@/utils/tool/polygonTool';
import { IPolygonPoint } from '@/types/tool/polygon';
import uuid from '@/utils/uuid';
import { PCDLoader } from './PCDLoader';
import { OrbitControls } from './OrbitControls';
import { PointCloudCache } from './cache';
import { getCuboidFromPointCloudBox } from './matrix';

interface IOrthographicCamera {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}

interface IProps {
  container: HTMLElement;
  noAppend?: boolean; // temporary;
  isOrthographicCamera?: boolean;
  orthographicParams?: IOrthographicCamera;
  backgroundColor?: string;

  config?: IPointCloudConfig;
}

const DEFAULT_DISTANCE = 30;
const highlightWorker = new HighlightWorker({ type: 'module' });

export class PointCloud {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  // public camera: THREE.PerspectiveCamera;

  public controls: OrbitControls;

  public axesHelper: THREE.AxesHelper;

  public pcdLoader: PCDLoader;

  public config?: IPointCloudConfig;

  /**
   * zAxis Limit for filter point over a value
   */
  public zAxisLimit: number = 10;

  public initCameraPosition = this.DEFAULT_INIT_CAMERA_POSITION; // It will init when the camera position be set

  private container: HTMLElement;

  private isOrthographicCamera = false;

  private pointsUuid = '';

  private sideMatrix?: THREE.Matrix4;

  private backgroundColor: string;

  private pointCloudObjectName = 'pointCloud';

  private rangeObjectName = 'range';

  private cacheInstance: PointCloudCache; // PointCloud Cache Map

  private showDirection: boolean = true; // Whether to display the direction of box

  private currentPCDSrc?: string; // Record the src of PointCloud

  /**
   * Record the src of Highlight PCD.
   *
   * Avoiding src error problems caused by asynchronous
   */
  private highlightPCDSrc?: string;

  constructor({
    container,
    noAppend,
    isOrthographicCamera,
    orthographicParams,
    backgroundColor = 'black',
    config,
  }: IProps) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.backgroundColor = backgroundColor;
    this.config = config;

    // TODO
    if (isOrthographicCamera && orthographicParams) {
      this.isOrthographicCamera = true;
      this.camera = new THREE.OrthographicCamera(
        orthographicParams.left,
        orthographicParams.right,
        orthographicParams.top,
        orthographicParams.bottom,
        orthographicParams.near,
        orthographicParams.far,
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(30, this.containerWidth / this.containerHeight, 1, 1000);
    }
    // this.camera = new THREE.OrthographicCamera(-500, 500, 500, -500, 100, -100);
    this.initCamera();

    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.pcdLoader = new PCDLoader();

    this.axesHelper = new THREE.AxesHelper(1000);

    // For Developer
    // this.scene.add(this.axesHelper);

    this.scene.add(this.camera);
    // TODO
    if (!noAppend) {
      container.appendChild(this.renderer.domElement);
    }

    this.init();

    this.cacheInstance = PointCloudCache.getInstance();
  }

  get DEFAULT_INIT_CAMERA_POSITION() {
    return new THREE.Vector3(-0.01, 0, 10);
  }

  get containerWidth() {
    return this.container.clientWidth;
  }

  get containerHeight() {
    return this.container.clientHeight;
  }

  public setInitCameraPosition(vector: THREE.Vector3) {
    this.initCameraPosition = vector;
  }

  public setConfig(config: IPointCloudConfig) {
    this.config = config;
  }

  /**
   * Init OrthographicCamera to default config by size
   * @param orthographicParams
   * @returns
   */
  public initOrthographicCamera(orthographicParams: IOrthographicCamera) {
    if (this.camera.type !== 'OrthographicCamera') {
      return;
    }

    const { left, right, top, bottom, near, far } = orthographicParams;

    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.near = near;
    this.camera.far = far;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Init PerspectiveCamera to default config by size
   * @returns
   */
  public initPerspectiveCamera() {
    if (this.camera.type !== 'PerspectiveCamera') {
      return;
    }
    this.camera.fov = 30;
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.near = 1;
    this.camera.far = 1000;
    this.camera.updateProjectionMatrix();
  }

  public initCamera() {
    // Camera setting must be set before Control's initial.
    const { camera } = this;

    // TODO
    if (this.isOrthographicCamera) {
      const { x, y, z } = this.initCameraPosition;
      camera.position.set(x, y, z);
    } else {
      camera.position.set(-1, 0, 500);
    }
    camera.up.set(0, 0, 1);
  }

  public initControls() {
    const { controls } = this;
    controls.addEventListener('change', () => {
      this.render();
    }); // use if there is no animation loop
    this.setDefaultControls();
  }

  public setDefaultControls() {
    const { controls } = this;
    const centerPoint = [0, 0, 0];
    controls.target = new THREE.Vector3(...centerPoint); // Camera watching?
    controls.addEventListener('change', () => {
      this.render();
    }); // use if there is no animation loop
    controls.maxPolarAngle = Math.PI / 2; // Forbid orbit vertically over 90°
    controls.update();
  }

  public initRenderer() {
    const { renderer } = this;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.containerWidth, this.containerHeight);
  }

  public init() {
    const { scene } = this;
    // Background
    scene.background = new THREE.Color(this.backgroundColor);

    this.initControls();
    this.initRenderer();
  }

  public removeObjectByName(name: string) {
    const oldBox = this.scene.getObjectByName(name);
    // Remove Old Box
    if (oldBox) {
      oldBox.removeFromParent();
      // if (name === this.pointCloudObjectName) {
      //   // debugger;
      //   this.removeObjectByName(name);
      // }
    }
  }

  /**
   * Render box by params
   * @param boxParams
   * @param color
   */
  public generateBox(boxParams: IPointCloudBox, color = 0xffffff) {
    const newColor = color;
    // Temporarily turn the Box white
    // if (this.config?.attributeList && this.config?.attributeList?.length > 0 && boxParams.attribute) {
    //   newColor =
    //     toolStyleConverter.getColorFromConfig(
    //       { attribute: boxParams.attribute },
    //       { ...this.config, attributeConfigurable: true },
    //       {},
    //     )?.hex ?? color;
    // }

    this.AddBoxToSense(boxParams, newColor);
    this.render();
  }

  public getAllAttributeColor(boxes: IPointCloudBox[]) {
    return boxes.reduce((acc: { [k: string]: any }, box) => {
      acc[box.attribute] = toolStyleConverter.getColorFromConfig(
        { attribute: box.attribute },
        { ...this.config, attributeConfigurable: true },
        {},
      );
      return acc;
    }, {});
  }

  /*
   * Remove exist box and add new one to scene
   * @param boxParams
   * @param id
   * @param color
   */
  public AddBoxToSense = (boxParams: IPointCloudBox, color = 0xffffff) => {
    const id = boxParams.id ?? uuid();

    this.removeObjectByName(id);

    const { center, width, height, depth, rotation } = boxParams;
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 'blue' });
    const cube = new THREE.Mesh(geometry, material);
    const box = new THREE.BoxHelper(cube, color);
    const arrow = this.generateBoxArrow(boxParams);

    // Temporarily hide
    // const boxID = this.generateBoxTrackID(boxParams);
    // if (boxID) {
    //   group.add(boxID);
    // }

    group.add(box);
    group.add(arrow);
    group.position.set(center.x, center.y, center.z);

    group.rotation.set(0, 0, rotation);

    group.name = id;
    this.scene.add(group);
  };

  public generateBoxes(boxes: IPointCloudBox[]) {
    boxes.forEach((box) => {
      this.generateBox(box);
    });
    this.render();
  }

  /**
   * Get OrthographicCamera Params to Change
   * @param boxParams
   * @returns
   */
  public getOrthographicCamera(boxParams: IPointCloudBox) {
    const { center, width, height } = boxParams;
    const offset = 10;
    const left = center.x - width / 2 - offset;
    const right = center.x - width / 2 + offset;
    const top = center.y + height / 2 + offset;
    const bottom = center.y - height / 2 - offset;

    const near = 100;
    const far = -100;
    const zoom = 500 / near;

    return {
      left,
      right,
      top,
      bottom,
      near,
      far,
      zoom,
    };
  }

  public updateCameraZoom(zoom: number) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Update Camera position & target
   * @param boxParams
   * @param perspectiveView
   */
  public updateCameraByBox(boxParams: IPointCloudBox, perspectiveView: EPerspectiveView) {
    const { center, width, height, depth, rotation } = boxParams;
    const cameraPositionVector = this.getCameraVector(center, rotation, { width, height, depth }, perspectiveView);
    this.updateCamera(cameraPositionVector, center);
    return cameraPositionVector;
  }

  public updateOrthoCamera(boxParams: IPointCloudBox, perspectiveView: EPerspectiveView) {
    const cameraPositionVector = this.updateCameraByBox(boxParams, perspectiveView);

    // Initialize the camera zoom to get right projectionMatrix.(like functin - getBoxPolygon2DCoordinate)
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    return {
      cameraPositionVector,
    };
  }

  /**
   * Initialize the camera to the initial position
   */
  public updateTopCamera() {
    this.setInitCameraPosition(this.DEFAULT_INIT_CAMERA_POSITION);
    this.camera.zoom = 1;
    this.initCamera();
    this.setDefaultControls();
    this.camera.updateProjectionMatrix();
    this.render();
  }

  /**
   * Update camera position & target
   * @param position
   * @param target
   */
  public updateCamera(position: I3DSpaceCoord, target: I3DSpaceCoord) {
    this.camera.position.set(position.x, position.y, position.z);
    this.controls.target = new THREE.Vector3(target.x, target.y, target.z);
    this.controls.update();
  }

  /**
   * Reset camera to center-top
   */
  public resetCamera() {
    this.updateCamera(this.DEFAULT_INIT_CAMERA_POSITION, { x: 0, y: 0, z: 0 });
  }

  public createThreeMatrix4(matrix4: TMatrix4Tuple) {
    return new THREE.Matrix4().set(...matrix4);
  }

  /**
   * For pcd filter point under box
   * @param boxParams
   * @param points
   * @param color
   * @returns
   */
  public filterPointsByBox(
    boxParams: IPointCloudBox,
    points?: Float32Array,
    color?: Float32Array,
  ): Promise<{ geometry: any; num: number } | undefined> {
    if (!points) {
      const originPoints = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;

      if (!originPoints) {
        console.error('There is no corresponding point cloud object');
        return Promise.resolve(undefined);
      }

      points = originPoints?.geometry?.attributes?.position?.array as Float32Array;
    }

    if (window.Worker) {
      const { zMin, zMax, polygonPointList } = getCuboidFromPointCloudBox(boxParams);
      const position = points;
      color = color ?? new Float32Array([]); // If the color is not existed, it can be recreated by default.
      const params = {
        boxParams,
        zMin,
        zMax,
        polygonPointList,
        color,
        position,
      };

      return new Promise((resolve) => {
        const filterBoxWorker = new FilterBoxWorker();
        filterBoxWorker.postMessage(params);
        filterBoxWorker.onmessage = (e: any) => {
          const { color: newColor, position: newPosition, num } = e.data;

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPosition, 3));
          geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColor, 3));
          geometry.computeBoundingSphere();

          filterBoxWorker.terminate();
          resolve({ geometry, num });
        };
      });
    }

    return Promise.resolve(undefined);
  }

  public getCameraVector(
    centerPoint: I3DSpaceCoord,
    rotationZ: number,
    volume: IVolume,
    perspectiveView: EPerspectiveView = EPerspectiveView.Front,
    defaultDistance = DEFAULT_DISTANCE,
  ) {
    let TcMatrix4 = PerspectiveShiftUtils.frontViewMatrix4(defaultDistance);

    switch (perspectiveView) {
      case EPerspectiveView.Front:
        break;
      case EPerspectiveView.Back:
        TcMatrix4 = PerspectiveShiftUtils.backViewMatrix4(defaultDistance);
        break;
      case EPerspectiveView.Left:
        TcMatrix4 = PerspectiveShiftUtils.leftViewMatrix4(defaultDistance);
        break;
      case EPerspectiveView.Right:
        TcMatrix4 = PerspectiveShiftUtils.rightViewMatrix4(defaultDistance);
        break;
      case EPerspectiveView.Top:
        TcMatrix4 = PerspectiveShiftUtils.topViewMatrix4(defaultDistance);
        break;
      case EPerspectiveView.LFT:
        TcMatrix4 = PerspectiveShiftUtils.leftFrontTopViewMatrix4(defaultDistance, volume);
        break;
      case EPerspectiveView.RBT:
        TcMatrix4 = PerspectiveShiftUtils.rightBackTopViewMatrix4(defaultDistance, volume);
        break;
      default: {
        break;
      }
    }

    const Tc = this.createThreeMatrix4(TcMatrix4); // Camera Position - Transformation Matrix

    const TFrom = new THREE.Matrix4().makeTranslation(-centerPoint.x, -centerPoint.y, -centerPoint.z);
    const TBack = new THREE.Matrix4().makeTranslation(centerPoint.x, centerPoint.y, centerPoint.z);
    const Rz = new THREE.Matrix4().makeRotationZ(rotationZ);

    const centerVector = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z);
    const cameraVector = centerVector.clone().applyMatrix4(Tc).applyMatrix4(TFrom).applyMatrix4(Rz).applyMatrix4(TBack);
    return cameraVector;
  }

  public createRange(radius: number) {
    this.removeObjectByName(this.rangeObjectName);
    const curve = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0, // aRotation
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the final object to add to the scene
    const ellipse = new THREE.Line(geometry, material);
    ellipse.name = this.rangeObjectName;
    return ellipse;
  }

  public overridePointShader = (shader: Shader) => {
    shader.vertexShader = `
    attribute float sizes;
    attribute float visibility;
    varying float vVisible;
  ${shader.vertexShader}`.replace(
      `gl_PointSize = size;`,
      `gl_PointSize = size;
      vVisible = visibility;
    `,
    );
    shader.fragmentShader = `
    varying float vVisible;
  ${shader.fragmentShader}`.replace(
      `#include <clipping_planes_fragment>`,
      `
      if (vVisible < 0.5) discard;
    #include <clipping_planes_fragment>`,
    );
  };

  public renderPointCloud(points: THREE.Points, radius?: number) {
    points.name = this.pointCloudObjectName;

    const pointsMaterial = new THREE.PointsMaterial({
      vertexColors: true,
    });

    pointsMaterial.onBeforeCompile = this.overridePointShader;
    pointsMaterial.size = 1.2;

    if (radius) {
      // @ts-ignore
      this.generateRange(radius);
    }

    this.pointsUuid = points.uuid;
    points.material = pointsMaterial;
    this.filterZAxisPoints(points);

    this.scene.add(points);

    this.render();
  }

  public clearPointCloud() {
    this.removeObjectByName(this.pointCloudObjectName);
  }

  public clearPointCloudAndRender() {
    this.clearPointCloud();
    this.render();
  }

  /**
   *
   * @param src
   * @param radius Render the range of circle
   */
  public loadPCDFile = async (src: string, radius?: number) => {
    this.clearPointCloud();
    this.currentPCDSrc = src;

    /**
     * Create the new THREE.Points by cachePCD.
     */
    const { points, color } = (await this.cacheInstance.loadPCDFile(src)) as any;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));

    const newPoints = new THREE.Points(geometry);
    this.renderPointCloud(newPoints, radius);
  };

  /**
   * It needs to be updated after load PointCloud's data.
   * @param boxParams
   * @returns
   */
  public highlightOriginPointCloud(pointCloudBoxList?: IPointCloudBox[]) {
    const oldPointCloud = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
    if (!oldPointCloud) {
      return;
    }
    this.highlightPCDSrc = this.currentPCDSrc;

    return new Promise<BufferAttribute[] | undefined>((resolve) => {
      if (window.Worker) {
        const newPointCloudBoxList = pointCloudBoxList ? [...pointCloudBoxList] : [];

        const cuboidList = newPointCloudBoxList.map((v) => getCuboidFromPointCloudBox(v));
        const colorList = this.getAllAttributeColor(cuboidList);
        const params = {
          cuboidList,
          position: oldPointCloud.geometry.attributes.position.array,
          color: oldPointCloud.geometry.attributes.color.array,
          colorList,
        };

        highlightWorker.postMessage(params);
        highlightWorker.onmessage = (e: any) => {
          const { color } = e.data;
          const colorAttribute = new THREE.BufferAttribute(color, 3);

          if (this.highlightPCDSrc) {
            // Save the new highlight color.
            this.cacheInstance.updateColor(this.highlightPCDSrc, color);

            // Clear
            this.highlightPCDSrc = undefined;
          }

          colorAttribute.needsUpdate = true;
          oldPointCloud.geometry.setAttribute('color', colorAttribute);
          resolve(color);
          this.render();
        };
      }
    });
  }

  public updateColor(color: any[]) {
    const oldPointCloud = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
    if (oldPointCloud) {
      const colorAttribute = new THREE.BufferAttribute(color, 3);
      colorAttribute.needsUpdate = true;
      oldPointCloud.geometry.setAttribute('color', colorAttribute);

      this.render();
    }
  }

  /**
   * Load PCD File by box
   * @param src
   * @param boxParams
   * @param scope
   */
  public loadPCDFileByBox = async (
    src: string,
    boxParams: IPointCloudBox,
    scope?: Partial<{ width: number; height: number; depth: number }>,
  ) => {
    const cb = async (points: Float32Array, color: Float32Array) => {
      const { width = 0, height = 0, depth = 0 } = scope ?? {};

      // TODO. Speed can be optimized.
      const filterData = await this.filterPointsByBox(
        {
          ...boxParams,
          width: boxParams.width + width,
          height: boxParams.height + height,
          depth: boxParams.depth + depth,
        },
        points,
        color,
      );
      if (!filterData) {
        console.error('filter Error');
        return;
      }

      this.clearPointCloud();

      this.currentPCDSrc = src;
      const newPoints = new THREE.Points(filterData.geometry);
      newPoints.name = this.pointCloudObjectName;
      this.scene.add(newPoints);
      this.render();
    };
    const { points, color } = await this.cacheInstance.loadPCDFile(src);
    cb(points, color);
  };

  public setShowDirection(showDirection: boolean) {
    this.showDirection = showDirection;
    this.scene.children.forEach((v) => {
      if (v.type === 'Group') {
        v.children.forEach((object) => {
          if (object.type === 'ArrowHelper') {
            object.visible = showDirection;
          }
        });
      }
    });
    this.render();
  }

  public generateRange = (radius: number) => {
    const circle = this.createRange(radius);
    this.scene.add(circle);
  };

  public generateBoxArrow = ({ width }: IPointCloudBox) => {
    const dir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(width / 2, 0, 0);
    const arrowLen = 2;
    const hex = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, arrowLen, hex);
    arrowHelper.visible = this.showDirection;

    return arrowHelper;
  };

  public generateBoxTrackID = (boxParams: IPointCloudBox) => {
    if (!boxParams.trackID) {
      return;
    }

    const texture = new THREE.Texture(this.getTextCanvas(boxParams.trackID.toString()));
    texture.needsUpdate = true;
    const sprite = new THREE.SpriteMaterial({ map: texture, depthWrite: false });
    const boxID = new THREE.Sprite(sprite);
    boxID.scale.set(5, 5, 5);
    boxID.position.set(-boxParams.width / 2, 0, boxParams.depth / 2 + 0.5);
    return boxID;
  };

  public getTextCanvas(text: string) {
    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${50}px " bold`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    return canvas;
  }

  public getSensesPointZAxisInPolygon(polygon: IPolygonPoint[], zScope?: [number, number]) {
    const points = this.scene.children.find((i) => i.uuid === this.pointsUuid) as THREE.Points;
    let minZ = 0;
    let maxZ = 0;
    let count = 0; // The count of scope
    let zCount = 0; // The Count of Polygon range

    if (points && points?.geometry) {
      const pointPosArray = points?.geometry.attributes.position.array;

      for (let idx = 0; idx < pointPosArray.length; idx += 3) {
        const x = pointPosArray[idx];
        const y = pointPosArray[idx + 1];
        const z = pointPosArray[idx + 2];

        const inPolygon = isInPolygon({ x, y }, polygon);

        if (inPolygon && z) {
          maxZ = Math.max(z, maxZ);
          minZ = Math.min(z, minZ);

          zCount++;

          if (zScope) {
            if (z >= zScope[0] && z <= zScope[1]) {
              count++;
            }
          }
        }
      }
    }

    return { maxZ, minZ, count, zCount };
  }

  /**
   * ViewPort - Transformation
   * @param vector
   * @returns
   */
  public getBasicCoordinate2Canvas(vector: THREE.Vector3) {
    const w = this.containerWidth / 2;
    const h = this.containerHeight / 2;
    return {
      x: vector.x * w + w,
      y: vector.y * h + h,
      z: vector.z,
    };
  }

  public get basicCoordinate2CanvasMatrix4() {
    const w = this.containerWidth / 2;
    const h = this.containerHeight / 2;
    return new THREE.Matrix4().set(w, 0, 0, w, 0, h, 0, h, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  /**
   * ViewPort - Transformation
   * @param vector
   * @returns
   */
  public getCanvas2BasicCoordinate(vector: THREE.Vector3) {
    const w = this.containerWidth / 2;
    const h = this.containerHeight / 2;
    return new THREE.Vector3(vector.x / w - w / 2, -(vector.y / h - h / 2), 1);
  }

  /**
   * The order of pointList is lt => lb => rb => rt
   * The basic coordinate is top view(senseBee pointCloud topView coordinate)
   * @param boxParams
   * @returns
   */
  public getPolygonSidePoints(boxParams: IPointCloudBox) {
    const {
      center: { x, y, z },
      height,
      width,
      depth,
    } = boxParams;

    const lfb = {
      x: x + width / 2,
      y: y + height / 2,
      z: z - depth / 2,
    };
    const lft = {
      x: x + width / 2,
      y: y + height / 2,
      z: z + depth / 2,
    };
    const lbt = {
      x: x - width / 2,
      y: y + height / 2,
      z: z + depth / 2,
    };
    const lbb = {
      x: x - width / 2,
      y: y + height / 2,
      z: z - depth / 2,
    };
    const vectorList = [lfb, lft, lbt, lbb]; // Important order

    return vectorList;
  }

  public getPolygonBackPoints(boxParams: IPointCloudBox) {
    const {
      center: { x, y, z },
      height,
      width,
      depth,
    } = boxParams;
    const lbt = {
      x: x - width / 2,
      y: y + height / 2,
      z: z + depth / 2,
    };
    const lbb = {
      x: x - width / 2,
      y: y + height / 2,
      z: z - depth / 2,
    };
    const rbb = {
      x: x - width / 2,
      y: y - height / 2,
      z: z - depth / 2,
    };
    const rbt = {
      x: x - width / 2,
      y: y - height / 2,
      z: z + depth / 2,
    };
    const vectorList = [lbt, lbb, rbb, rbt];

    return vectorList;
  }

  public getPolygonTopPoints(boxParams: IPointCloudBox) {
    const {
      center: { x, y, z },
      height,
      width,
      depth,
    } = boxParams;

    const lft = {
      x: x + width / 2,
      y: y + height / 2,
      z: z + depth / 2,
    };
    const rft = {
      x: x + width / 2,
      y: y - height / 2,
      z: z + depth / 2,
    };
    const rbt = {
      x: x - width / 2,
      y: y - height / 2,
      z: z + depth / 2,
    };
    const lbt = {
      x: x - width / 2,
      y: y + height / 2,
      z: z + depth / 2,
    };
    const vectorList = [lft, rft, rbt, lbt];

    return vectorList;
  }

  public getModelTransformationMatrix(boxParams: IPointCloudBox) {
    const {
      center: { x, y, z },
      rotation,
    } = boxParams;
    // viewPort Transformation
    const TFrom = new THREE.Matrix4().makeTranslation(-x, -y, -z);
    const TBack = new THREE.Matrix4().makeTranslation(x, y, z);
    const Rz = new THREE.Matrix4().makeRotationZ(rotation);

    return new THREE.Matrix4().multiply(TBack).multiply(Rz).multiply(TFrom);
  }

  /**
   * Get Polygon from boxParams
   *
   * Notice.
   * 1. You need to rotate camera to correct direction base because it uses matrixWorldInverse & projectionMatrix from camera
   * @param boxParams
   * @returns
   */
  public getBoxSidePolygon2DCoordinate(boxParams: IPointCloudBox) {
    return this.getBoxPolygon2DCoordinate(boxParams, EPerspectiveView.Left);
  }

  public getBoxBackPolygon2DCoordinate(boxParams: IPointCloudBox) {
    return this.getBoxPolygon2DCoordinate(boxParams, EPerspectiveView.Back);
  }

  public boxParams2ViewPolygon(boxParams: IPointCloudBox, perspectiveView: EPerspectiveView) {
    switch (perspectiveView) {
      case EPerspectiveView.Left:
        return this.getPolygonSidePoints(boxParams);

      case EPerspectiveView.Back:
        return this.getPolygonBackPoints(boxParams);

      default: {
        return this.getPolygonTopPoints(boxParams);
      }
    }
  }

  /**
   * Box to 2d Coordinate.
   *
   * Flow:
   * 1. Model Translation
   * 2. View Translation
   * 3. Projection Translation
   * 4. Viewport Translation
   *
   *
   * @param boxParams
   * @param perspectiveView
   * @returns
   */
  public getBoxPolygon2DCoordinate(boxParams: IPointCloudBox, perspectiveView: EPerspectiveView) {
    const vectorList = this.boxParams2ViewPolygon(boxParams, perspectiveView);
    const { width, height } = boxParams;
    const projectMatrix = new THREE.Matrix4()
      .premultiply(this.camera.matrixWorldInverse) // View / Camera Translation
      .premultiply(this.camera.projectionMatrix); // Projection Translation

    const boxSideMatrix = new THREE.Matrix4()
      .premultiply(this.getModelTransformationMatrix(boxParams)) // Model Translation
      .premultiply(projectMatrix) // View Translation + Projection Translation
      .premultiply(this.basicCoordinate2CanvasMatrix4); // Viewport Translation
    this.sideMatrix = boxSideMatrix;

    const polygon2d = vectorList
      .map((vector) => new THREE.Vector3(vector.x, vector.y, vector.z))
      .map((vector) => vector.applyMatrix4(this.sideMatrix as any));

    const wZoom = this.containerWidth / width;
    const hZoom = this.containerHeight / height;

    return {
      polygon2d,
      zoom: Math.min(wZoom, hZoom) / 2,
    };
  }

  public getBoxTopPolygon2DCoordinate(boxParams: IPointCloudBox) {
    const { width, height } = boxParams;
    const vectorList = this.getPolygonTopPoints(boxParams);
    // TODO. Need to update
    const polygon2d = vectorList
      .map((vector) => new THREE.Vector3(vector.x, vector.y, vector.z))
      // .map((vector) => vector.applyMatrix4(invertMatrix)); // Direct invertMatrix
      // Model Transformation
      .map((vector) => vector.applyMatrix4(this.getModelTransformationMatrix(boxParams)))
      // rotate coordinate
      .map((vector) => {
        return {
          x: vector.y,
          y: vector.x,
        };
      })
      // viewport transformation
      .map((vector) => {
        return {
          x: -(vector.x - this.containerWidth / 2),
          y: -(vector.y - this.containerHeight / 2),
        };
      });
    const wZoom = this.containerWidth / width;
    const hZoom = this.containerHeight / height;
    return {
      polygon2d,
      zoom: Math.min(wZoom, hZoom) / 2,
    };
  }

  public getNewBoxBySideUpdate(
    offsetCenterPoint: { x: number; y: number; z: number }, // Just use x now.
    offsetWidth: number,
    offsetDepth: number,
    selectedPointCloudBox: IPointCloudBox,
  ) {
    const Rz = new THREE.Matrix4().makeRotationZ(selectedPointCloudBox.rotation);

    // Because the positive direction of 2DView is -x, but the positive direction of 2DView is x.
    const offsetVector = new THREE.Vector3(-offsetCenterPoint.x, 0, 0).applyMatrix4(Rz);

    // need to Change offset to world side
    let newBoxParams = selectedPointCloudBox;
    newBoxParams.center = {
      x: newBoxParams.center.x + offsetVector.x,
      y: newBoxParams.center.y + offsetVector.y,
      z: newBoxParams.center.z - offsetCenterPoint.z, // It is the same with moving.
    };

    newBoxParams = {
      ...newBoxParams,
      width: newBoxParams.width + offsetWidth,
      height: newBoxParams.height,
      depth: newBoxParams.depth + offsetDepth,
    };
    return { newBoxParams };
  }

  public getNewBoxByBackUpdate(
    offsetCenterPoint: { x: number; y: number; z: number },
    offsetWidth: number,
    offsetDepth: number,
    selectedPointCloudBox: IPointCloudBox,
  ) {
    const Rz = new THREE.Matrix4().makeRotationZ(selectedPointCloudBox.rotation);
    const offsetVector = new THREE.Vector3(0, -offsetCenterPoint.x, 0).applyMatrix4(Rz);

    // need to Change offset to world side
    let newBoxParams = selectedPointCloudBox;
    newBoxParams.center = {
      x: newBoxParams.center.x + offsetVector.x,
      y: newBoxParams.center.y + offsetVector.y,
      z: newBoxParams.center.z - offsetCenterPoint.z,
    };

    newBoxParams = {
      ...newBoxParams,
      width: newBoxParams.width,
      height: newBoxParams.height + offsetWidth,
      depth: newBoxParams.depth + offsetDepth,
    };
    return { newBoxParams };
  }

  /**
   * Get new Box by matrix , but it's work.
   *
   * Use it later.
   * @param pointList
   * @param offsetHeight
   * @param offsetZ
   * @returns
   */
  public getNewBoxBySideUpdateByPoints(
    pointList: any[],
    offsetHeight: number,
    offsetZ: number,
    selectedPointCloudBox: IPointCloudBox,
  ) {
    const invertMatrix = this.sideMatrix?.invert();
    if (!this.sideMatrix || !invertMatrix) {
      console.error('No sideMatrix');

      return;
    }

    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();

    const polygonWorld = pointList
      .map((vector) => new THREE.Vector3(vector.x, vector.y, vector.z))
      .map((vector) => vector.applyMatrix4(invertMatrix)); // Direct invertMatrix

    // .map((vector) => this.getCanvas2BasicCoordinate(vector))
    // .map((vector) => vector.unproject(this.camera));

    const [p1v, p2v, p3v, p4v] = polygonWorld;

    // const width = p1v.x - p2v.x < 0.0001 ? Math.abs(p1v.x - p3v.x) : Math.abs(p1v.x - p2v.x);
    const width = Math.max(Math.abs(p1v.x - p3v.x), Math.abs(p1v.x - p2v.x));

    // const depth = p1v.z - p2v.z < 0.0001 ? Math.abs(p1v.z - p3v.z) : Math.abs(p1v.z - p2v.z);
    const centerVector = p2v.add(p4v).applyMatrix3(new THREE.Matrix3().set(1 / 2, 0, 0, 0, 1 / 2, 0, 0, 0, 1 / 2));

    const offsetVector = centerVector
      .clone()
      .applyMatrix3(new THREE.Matrix3().set(-1, 0, 0, 0, -1, 0, 0, 0, -1))
      .add(
        new THREE.Vector3(
          selectedPointCloudBox.center.x,
          selectedPointCloudBox.center.y,
          selectedPointCloudBox.center.z,
        ),
      );

    const newBoxParams = {
      ...selectedPointCloudBox,
      center: {
        x: selectedPointCloudBox.center.x - offsetVector.x,
        y: selectedPointCloudBox.center.y - offsetVector.y,
        // y: centerVector.y,
        z: selectedPointCloudBox.center.z - offsetZ,
      },
      width,
      height: selectedPointCloudBox.height,
      depth: selectedPointCloudBox.depth + offsetHeight,
      // depth,
      rotation: selectedPointCloudBox.rotation,
    };

    return { newBoxParams };
  }

  /**
   * Filter Point by z-aixs
   */
  public filterZAxisPoints(pcdPoints?: any) {
    const points: any = pcdPoints || this.scene.children.find((i) => i.uuid === this.pointsUuid);

    if (points) {
      const { attributes } = points.geometry;
      const { position } = attributes;
      const visibility = [];
      const { count } = position;

      for (let i = 0; i < count; i++) {
        const z = position.getZ(i);
        visibility.push(z > this.zAxisLimit ? 0 : 1);
      }

      points.geometry.setAttribute('visibility', new THREE.Float32BufferAttribute(visibility, 1));
      points.geometry.attributes.visibility.needsUpdate = true;
    }
  }

  public applyZAxisPoints = (zAxisLimit: number) => {
    this.zAxisLimit = zAxisLimit;
    this.filterZAxisPoints();
    this.render();
  };

  /**
   * Update point size
   * @param zoomIn
   */
  public updatePointSize = (zoomIn: boolean) => {
    const points = this.scene.getObjectByName(this.pointCloudObjectName) as { material: PointsMaterial } | undefined;

    if (!points) {
      return;
    }

    const preSize = points.material.size;

    if (zoomIn) {
      points.material.size = Math.min(preSize * 1.2, 10);
    } else {
      points.material.size = Math.max(preSize / 1.2, 1);
    }

    this.render();
  };

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export * from './matrix';
export * from './annotation';
