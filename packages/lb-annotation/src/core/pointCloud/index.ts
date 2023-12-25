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
  IPointCloudSphere,
  I3DSpaceCoord,
  IPointCloudConfig,
  toolStyleConverter,
  PointCloudUtils,
  DEFAULT_SPHERE_PARAMS,
  ICalib,
} from '@labelbee/lb-utils';
import { BufferAttribute, OrthographicCamera, PerspectiveCamera } from 'three';
import HighlightWorker from 'web-worker:./highlightWorker.js';
import FilterBoxWorker from 'web-worker:./filterBoxWorker.js';
import { isInPolygon } from '@/utils/tool/polygonTool';
import { IPolygonPoint } from '@/types/tool/polygon';
import uuid from '@/utils/uuid';
import MathUtils from '@/utils/MathUtils';
import ImgUtils from '@/utils/ImgUtils';
import { PCDLoader } from './PCDLoader';
import { OrbitControls } from './OrbitControls';
import { PointCloudCache, TIndexMap } from './cache';
import { getCuboidFromPointCloudBox, getHighlightIndexByPoints, mergeHighlightList } from './matrix';
import { PointCloudSegmentOperation } from './segmentation';
import PointCloudStore from './store';
import PointCloudRender from './render';
import EventListener from '../toolOperation/eventListener';

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

  isSegment?: boolean;
  checkMode?: boolean;
}

export interface IEventBus {
  on: EventListener['on'];
  emit: EventListener['emit'];
  unbind: EventListener['unbind'];
}

export interface IPointCloudDelegate extends IEventBus {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  container: HTMLElement;
  checkMode: boolean;
  config?: IPointCloudConfig;
}

const DEFAULT_DISTANCE = 30;
const highlightWorker = new HighlightWorker({ type: 'module' });

export class PointCloud extends EventListener {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  // public camera: THREE.PerspectiveCamera;

  public controls: OrbitControls;

  public axesHelper: THREE.AxesHelper;

  public pcdLoader: PCDLoader;

  public config?: IPointCloudConfig;

  public store?: PointCloudStore; // TODO. Need to transfer all data to here

  public pointCloudRender?: PointCloudRender;

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

  private highlightGroupName = 'highlightBoxes';

  private cacheInstance: PointCloudCache; // PointCloud Cache Map

  private showDirection: boolean = true; // Whether to display the direction of box

  private currentPCDSrc?: string; // Record the src of PointCloud

  private pointsMaterialSize: number = 1;

  /**
   * Record the src of Highlight PCD.
   *
   * Avoiding src error problems caused by asynchronous
   */
  private highlightPCDSrc?: string;

  private segmentOperation?: PointCloudSegmentOperation;

  private isSegment = false;

  private checkMode = false;

  constructor({
    container,
    noAppend,
    isOrthographicCamera,
    orthographicParams,
    backgroundColor = '#4C4C4C', // GRAY_BACKGROUND
    config,
    isSegment,
    checkMode,
  }: IProps) {
    super();
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.backgroundColor = backgroundColor;
    this.config = config;
    this.checkMode = checkMode ?? false;

    // TODO: Need to extracted.
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
    this.initCamera();
    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, isSegment ? this.container : this.renderer.domElement);

    this.pcdLoader = new PCDLoader();

    this.axesHelper = new THREE.AxesHelper(1000);

    // For Developer
    // this.scene.add(this.axesHelper);

    this.scene.add(this.camera);
    /**
     * Temporary: Avoid domElement mounted
     */
    if (!noAppend) {
      container.appendChild(this.renderer.domElement);
    }

    this.init();

    this.cacheInstance = PointCloudCache.getInstance();

    if (isSegment === true) {
      this.initSegment();
      this.isSegment = true;
    }
  }

  public initSegment() {
    this.store = new PointCloudStore(this.pointCloudDelegate);
    this.controls.enablePan = false;
    this.controls.addEventListener('start', this.orbiterStart.bind(this));
    this.controls.addEventListener('change', this.orbiterChange.bind(this));
    this.controls.addEventListener('end', this.orbiterEnd.bind(this));
    this.segmentOperation = new PointCloudSegmentOperation({
      dom: this.container,
      store: this.store,
      ...this.eventBus,
    });

    this.pointCloudRender = new PointCloudRender({
      store: this.store,
      ...this.eventBus,
      nextTick: this.nextTick,
    });
    this.initMsg();
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
  }

  public orbiterStart() {
    // Reserved.
  }

  public orbiterChange() {
    if (!this.store) {
      return;
    }
    this.store.orbiting = true;
  }

  public orbiterEnd() {
    if (!this.store) {
      return;
    }
    this.store.orbiting = false;
  }

  public get currentSegmentTool() {
    return this.segmentOperation?.currentToolName;
  }

  public get pointCloudObject() {
    return this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
  }

  public initMsg() {
    if (!this.segmentOperation) {
      return;
    }

    this.on('CircleSelector', this.segmentOperation.updateSelector2Circle.bind(this.segmentOperation));
    this.on('LassoSelector', this.segmentOperation.updateSelector2Lasso.bind(this.segmentOperation));
    this.on('RectSelector', this.segmentOperation.updateSelector2Rect.bind(this.segmentOperation));
    this.on('clearPointCloud', this.clearPointCloud.bind(this));
    this.on('loadPCDFile', this.loadPCDFile.bind(this));
  }

  public unbindMsg() {
    if (!this.segmentOperation) {
      return;
    }

    this.unbind('CircleSelector', this.segmentOperation.updateSelector2Circle.bind(this.segmentOperation));
    this.unbind('LassoSelector', this.segmentOperation.updateSelector2Lasso.bind(this.segmentOperation));
    this.unbind('RectSelector', this.segmentOperation.updateSelector2Rect.bind(this.segmentOperation));
    this.unbind('clearPointCloud', this.clearPointCloud.bind(this));
    this.unbind('loadPCDFile', this.loadPCDFile.bind(this));
  }

  public nextTick = () => {
    if (!this.segmentOperation) {
      return;
    }

    this.segmentOperation._raycasting();
  };

  public keydown = (e: KeyboardEvent) => {
    if (!this.store) {
      return;
    }
    switch (e.key) {
      case ' ':
        this.controls.enablePan = true;
        this.store.setForbidOperation(true);
        break;

      default: {
        break;
      }
    }
  };

  public keyup = (e: KeyboardEvent) => {
    if (!this.store) {
      return;
    }

    switch (e.key) {
      case ' ':
        this.controls.enablePan = false;
        this.store.setForbidOperation(false);

        break;

      default: {
        break;
      }
    }
  };

  public get eventBus() {
    return {
      on: this.on.bind(this),
      emit: this.emit.bind(this),
      unbind: this.unbind.bind(this),
    };
  }

  public get pointCloudDelegate() {
    return {
      container: this.container,
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      checkMode: this.checkMode,
      config: this.config,
      ...this.eventBus,
    };
  }

  get DEFAULT_INIT_CAMERA_POSITION() {
    // The z-axis of camera's position is important to control the camera's frustum.
    return new THREE.Vector3(-0.01, 0, 1000);
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

    this.store?.setConfig(config);
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

    // TODO: Need to change it to a better way.
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

  public removeObjectByName(name: string, prefix = '') {
    const oldBox = this.scene.getObjectByName(prefix + name);
    // Remove Old Box
    if (oldBox) {
      oldBox.removeFromParent();
    }
  }

  public getColorFromConfig(attribute: string) {
    return toolStyleConverter.getColorFromConfig({ attribute }, { ...this.config, attributeConfigurable: true }, {});
  }

  /**
   * Render box by params
   * @param boxParams
   * @param color
   */
  public generateBox(boxParams: IPointCloudBox, color: THREE.ColorRepresentation = 0xffffff) {
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

    this.addBoxToSense(boxParams, newColor);
    this.render();
  }

  public getAllAttributeColor(boxes: IPointCloudBox[]) {
    return boxes.reduce((acc: { [k: string]: any }, box) => {
      acc[box.attribute] = this.getColorFromConfig(box.attribute);
      return acc;
    }, {});
  }

  /**
   * add new sphere just like adding new box
   * @param sphereParams
   */
  public addSphereToSense = (sphereParams: IPointCloudSphere, color = 'blue') => {
    const id = sphereParams.id ?? uuid();

    this.removeObjectByName(id, 'sphere');

    const { radius, widthSegments, heightSegments } = DEFAULT_SPHERE_PARAMS;
    const { center } = sphereParams;
    const group = new THREE.Group();
    const spGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const spMaterial = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(spGeo, spMaterial);
    sphere.position.set(center.x, center.y, center.z);
    group.add(sphere);
    group.name = `sphere${id}`;
    this.scene.add(group);
  };

  public generateSphere = (sphereParams: IPointCloudSphere) => {
    const { fill } = this.getColorFromConfig(sphereParams.attribute);
    this.addSphereToSense(sphereParams, fill);
    this.render();
  };

  public generateSpheres = (spheres: IPointCloudSphere[]) => {
    spheres.forEach((sphere) => {
      const { fill } = this.getColorFromConfig(sphere.attribute);
      this.addSphereToSense(sphere, fill);
    });
    this.render();
  };

  /*
   * Remove exist box and add new one to scene
   * @param boxParams
   * @param id
   * @param color
   */
  public addBoxToSense = (boxParams: IPointCloudBox, color: THREE.ColorRepresentation = 0xffffff) => {
    const id = boxParams.id ?? uuid();

    this.removeObjectByName(id, 'box');

    const { center, width, height, depth, rotation } = boxParams;
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 'blue' });
    const cube = new THREE.Mesh(geometry, material);
    const box = new THREE.BoxHelper(cube, color);
    const arrow = this.generateBoxArrow(boxParams);

    // Temporarily hide
    const boxID = this.generateBoxTrackID(boxParams);
    if (boxID) {
      group.add(boxID);
    }

    group.add(box);
    group.add(arrow);
    if (center) {
      group.position.set(center.x, center.y, center.z);
    }
    if (rotation) {
      group.rotation.set(0, 0, rotation);
    }
    group.name = `box${id}`;
    this.scene.add(group);
  };

  public generateBoxes(boxes: IPointCloudBox[]) {
    boxes.forEach((box) => {
      this.addBoxToSense(box);
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
   * @param customCameraVector Provide a custom way.
   */
  public updateCameraByBox(
    boxParams: IPointCloudBox,
    perspectiveView: EPerspectiveView,
    customCameraVector?: I3DSpaceCoord,
  ) {
    const { center, width, height, depth, rotation } = boxParams;
    const cameraPositionVector = this.getCameraVector(center, rotation, { width, height, depth }, perspectiveView);
    if (customCameraVector) {
      this.updateCamera(customCameraVector, center);
      return new THREE.Vector3(customCameraVector.x, customCameraVector.y, customCameraVector.z);
    }
    this.updateCamera(cameraPositionVector, center);
    return cameraPositionVector;
  }

  public updateCameraBySphere(sphereParams: IPointCloudSphere, perspectiveView: EPerspectiveView) {
    const { center } = sphereParams;
    const { radius } = DEFAULT_SPHERE_PARAMS;
    const cameraPositionVector = this.getCameraVector(
      center,
      0,
      { width: radius * 2, height: radius * 2, depth: radius * 2 },
      perspectiveView,
    );
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

  public updateOrthoCameraBySphere(sphereParams: IPointCloudSphere, perspectiveView: EPerspectiveView) {
    const cameraPositionVector = this.updateCameraBySphere(sphereParams, perspectiveView);

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

  /**
   * Get camera target from matrix
   * @param camera
   * @returns
   */
  public getOrthographicCameraTarget(camera: OrthographicCamera) {
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const target = camera.position.clone().add(direction);
    return target;
  }

  public applyCameraTarget = (camera: OrthographicCamera | PerspectiveCamera) => {
    if (this.camera.type !== 'OrthographicCamera') {
      return;
    }

    if (camera) {
      const cameraTarget = this.getOrthographicCameraTarget(camera as OrthographicCamera);
      this.updateCameraZoom(camera.zoom);
      this.updateCamera(camera.position, cameraTarget);
    }
  };

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

  public initShaderMaterial = () => {
    return {
      vertexShader: `
      attribute vec3 dimensions;
      varying vec3 vDimensions;
      uniform float pointSize;
      attribute float visibility;

      void main() {
        // Pass the vertex coordinates to the fragment shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

          // Pass the dimensions to the fragment shader
          vDimensions = dimensions;
          gl_PointSize = pointSize;

          if (visibility < 0.5) {
            gl_Position = vec4(0.0, 0.0, 0.0, 1.0);  // Invalid Position.
          }
      }`,
      fragmentShader: `
      varying vec3 vDimensions;
      void main() {
        // Calculate color based on dimensions
        vec3 color = vec3(vDimensions.x, vDimensions.y, vDimensions.z);

        // If vDimensions is default value, the color change to white-rgb(255,255,255)
        if (vDimensions.x == 0.0 && vDimensions.y == 0.0 && vDimensions.z == 0.0) {
          color = vec3(255, 255, 255);
        }

        // Output the final color        
        gl_FragColor = vec4(color, 1.0);
      }`,
      uniforms: {
        pointSize: { value: this.pointsMaterialSize }, // Init size.
      },
    };
  };

  public renderPointCloud(points: THREE.Points, radius?: number) {
    points.name = this.pointCloudObjectName;

    /**
     * Custom ShaderMaterial.
     *
     * 1. Filter the invisible points in vertexShader.
     * 2. If the color is not found, set Color to (255, 255, 255)
     */
    const material = new THREE.ShaderMaterial(this.initShaderMaterial());

    if (radius) {
      // @ts-ignore
      this.generateRange(radius);
    }

    this.pointsUuid = points.uuid;
    points.material = material;
    this.filterZAxisPoints(points);

    this.scene.add(points);

    this.render();
  }

  public clearAllBox() {
    this.clearAllGroupByPrefix('box');
  }

  public clearAllSphere() {
    this.clearAllGroupByPrefix('sphere');
  }

  public clearAllGroupByPrefix(prefix = '') {
    const child = this.scene.children;
    /**
     * Notice：
     * When performing bulk deletion, it is important to delete from the end backwards.
     */
    for (let i = child.length - 1; i >= 0; i--) {
      const v = child[i];
      if (v.type === 'Group' && v.name.startsWith(prefix)) {
        this.removeObjectByName(v.name);
      }
    }
  }

  public clearPointCloud() {
    this.removeObjectByName(this.pointCloudObjectName);
  }

  public clearPointCloudAndRender() {
    this.clearPointCloud();
    this.render();
  }

  public initCloudData(points: Float32Array) {
    if (!this.store) {
      return;
    }
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      this.store.cloudData.set(`${x}@${y}@${z}`, { visible: false });
    }
    this.store.setOriginPoints(points);
  }

  /**
   *
   * @param src
   * @param radius Render the range of circle
   */
  public loadPCDFile = async (src: string | undefined = this.currentPCDSrc, radius?: number) => {
    if (!src) return;
    this.clearPointCloud();
    /**
     * Clear Img Cache.
     */
    this.cacheInstance.clearCache2DHighlightIndex();

    this.currentPCDSrc = src;

    /**
     * Create the new THREE.Points by cachePCD.
     */
    const { points, color } = (await this.cacheInstance.loadPCDFile(src)) as any;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    if (!this.isSegment) {
      geometry.setAttribute('dimensions', new THREE.BufferAttribute(color, 3));
    }

    // TODO: Need to move to store.
    this.initCloudData(points);

    const newPoints = new THREE.Points(geometry);
    this.renderPointCloud(newPoints, radius);

    this.emit('loadPCDFileEnd');
  };

  /**
   * Highlight PointCloud by MappingImgList.
   * @param param0
   * @returns
   */
  public getHighlightIndexByMappingImgList = async ({
    mappingImgList,
    points,
  }: {
    mappingImgList: Array<{ url: string; calib?: ICalib }>;
    points: ArrayLike<number>;
  }) => {
    /**
     * The img is loaded, so it can use cache in browser.
     */
    const imgNodeList =
      mappingImgList.length === 0 ? [] : await Promise.all(mappingImgList.map((v) => ImgUtils.load(v.url)));
    const highlightIndexList = mappingImgList.map((v, i) => {
      if (this.cacheInstance.cache2DHighlightIndex.has(v.url)) {
        return this.cacheInstance.cache2DHighlightIndex.get(v.url) ?? [];
      }
      const h = getHighlightIndexByPoints({
        points,
        calib: v.calib,
        width: imgNodeList[i].width,
        height: imgNodeList[i].height,
      });

      // Cache highlightIndex.
      this.cacheInstance.cache2DHighlightIndex.set(v.url, h);
      return h;
    });
    const mergeList = mergeHighlightList(highlightIndexList);
    return mergeList;
  };

  public filterPreResult = async (src: string, config: any, boxParamsList: IPointCloudBox[]) => {
    const { points } = await this.cacheInstance.loadPCDFile(src);
    const indexMap = (await this.cacheInstance.loadIndexMap(src, points as Float32Array)) as TIndexMap;

    return new Promise((resolve) => {
      const boxes = boxParamsList.map((boxParams: IPointCloudBox) => {
        const count = MathUtils.calculatePointsInsideBox({
          indexMap,
          polygon: getCuboidFromPointCloudBox(boxParams).polygonPointList as IPolygonPoint[],
          zScope: [boxParams.center.z - boxParams.depth / 2, boxParams.center.z + boxParams.depth / 2],
          box: boxParams,
        });
        const valid = count >= config.lowerLimitPointsNumInBox;

        return { ...boxParams, valid, count };
      });
      resolve(boxes);
    });
  };

  /**
   * It needs to be updated after load PointCloud's data.
   * @param boxParams
   * @returns
   */
  public highlightOriginPointCloud(pointCloudBoxList?: IPointCloudBox[], highlightIndex: number[] = []) {
    const oldPointCloud = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
    if (!oldPointCloud) {
      return;
    }
    this.highlightPCDSrc = this.currentPCDSrc;

    return new Promise<BufferAttribute[] | undefined>((resolve, reject) => {
      if (window.Worker) {
        const newPointCloudBoxList = pointCloudBoxList ? [...pointCloudBoxList] : [];

        const cuboidList = newPointCloudBoxList.map((v) => getCuboidFromPointCloudBox(v));
        const colorList = this.getAllAttributeColor(cuboidList);
        const params = {
          cuboidList,
          position: oldPointCloud.geometry.attributes.position.array,
          color: oldPointCloud.geometry.attributes.dimensions.array,
          colorList,
          highlightIndex,
        };

        highlightWorker.postMessage(params);
        highlightWorker.onmessage = (e: any) => {
          const { color } = e.data;
          const colorAttribute = new THREE.BufferAttribute(color, 3);

          /**
           * Need to return;
           *
           * 1. Not exist highlightPCDSrc
           * 2. HighlightPCDSrc is not same with currentPCDSrc.
           * 3. If the calculate color is not same with origin Points length.
           */
          if (
            !this.highlightPCDSrc ||
            this.highlightPCDSrc !== this.currentPCDSrc ||
            oldPointCloud.geometry.attributes.position.array.length !== color.length
          ) {
            reject(new Error('Error Path'));
            return;
          }

          // Save the new highlight color.
          this.cacheInstance.updateColor(this.highlightPCDSrc, color);

          // Clear
          this.highlightPCDSrc = undefined;

          colorAttribute.needsUpdate = true;

          oldPointCloud.geometry.setAttribute('dimensions', colorAttribute);
          oldPointCloud.geometry.attributes.dimensions.needsUpdate = true;
          resolve(color);
          this.render();
        };
      }
    });
  }

  /**
   * Clean all highlightBox
   */
  public clearHighlightBoxes() {
    this.removeObjectByName(this.highlightGroupName);
  }

  public clearHighlightBoxesAndRender() {
    this.clearHighlightBoxes();
    this.render();
  }

  public highlightBoxes(boxes: IPointCloudBox[]) {
    const group = new THREE.Group();

    // 1. Highlight all box.
    boxes.forEach((box) => {
      const {
        center: { x, y, z },
        width,
        height,
        depth,
        rotation,
      } = box;
      const { fill } = toolStyleConverter.getColorFromConfig(
        { attribute: box.attribute },
        { ...this.config, attributeConfigurable: true },
        {},
      );

      // 1-1. Add Transparent Box.
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshBasicMaterial({
        color: fill,
        transparent: true,
        opacity: 0.2,
        depthTest: false,
      });
      geometry.rotateZ(rotation);
      geometry.translate(x, y, z);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // 1-2. Add plane for direction.
      const planeGeo = new THREE.PlaneGeometry(depth, height);
      planeGeo.rotateY(Math.PI / 2);
      planeGeo.rotateZ(rotation);
      // The plane center Offset
      const vector = new THREE.Vector3(width / 2, 0, 0);
      const rM = new THREE.Matrix4().makeRotationY(Math.PI / 2).makeRotationZ(rotation);
      vector.applyMatrix4(rM);
      planeGeo.translate(x + vector.x, y + vector.y, z + vector.z);
      const plainMaterial = new THREE.MeshBasicMaterial({
        color: fill,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
      });
      const plainMesh = new THREE.Mesh(planeGeo, plainMaterial);
      group.add(plainMesh);
    });

    group.name = this.highlightGroupName;
    this.scene.add(group);
    this.render();
  }

  public updateColor(color: any[]) {
    const oldPointCloud = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
    if (oldPointCloud) {
      const colorAttribute = new THREE.BufferAttribute(color, 3);
      oldPointCloud.geometry.setAttribute('dimensions', colorAttribute);
      oldPointCloud.geometry.attributes.dimensions.needsUpdate = true;

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

      // TODO. Speed can be optimized. It can use octree to optimize it.
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

  /**
   * Filter road points and noise in all directions
   * 1. The first 5% of the z-axis is used as the road coordinate
   * 2. Filter out points 10cm above the road surface.
   * 3. Filter out the first 0.5% of noise points in other directions
   */
  public filterNoise(innerPointList: I3DSpaceCoord[]) {
    let newPointList = [...innerPointList];
    newPointList.sort((a, b) => a.z - b.z);

    const startIndexZ = Math.floor(newPointList.length * 0.05);
    const roadPoint = newPointList[startIndexZ];
    newPointList = newPointList.filter(({ z }) => z > roadPoint.z + 0.1);

    const noisePercent = 0.005;
    const endIndexZ = Math.floor(newPointList.length * (1 - noisePercent));
    newPointList = newPointList.slice(0, endIndexZ);

    newPointList.sort((a, b) => a.x - b.x);
    const startIndexX = Math.floor(newPointList.length * noisePercent);
    const endIndexX = Math.floor(newPointList.length * (1 - noisePercent));
    newPointList = newPointList.slice(startIndexX, endIndexX);

    newPointList.sort((a, b) => a.y - b.y);
    const startIndexY = Math.floor(newPointList.length * noisePercent);
    const endIndexY = Math.floor(newPointList.length * (1 - noisePercent));
    newPointList = newPointList.slice(startIndexY, endIndexY);

    return newPointList.length > 100 ? newPointList : innerPointList;
  }

  // Get the polygon coordinates after fitting
  public getFittedCoordinates(polygon: IPolygonPoint[], innerPointList: ICoordinate[]) {
    const minDistanceList: Array<{ distance: number; point: ICoordinate }> = [];
    let _polygon = [...polygon, polygon[0]];
    innerPointList.forEach(({ x, y }) => {
      polygon.forEach((p1, index) => {
        const p2 = _polygon[index + 1];
        const distance = MathUtils.getFootOfPerpendicular({ x, y }, p1, p2, false, true).length;
        if (!minDistanceList[index] || distance < minDistanceList[index].distance) {
          minDistanceList[index] = { distance, point: { x, y } };
        }
      });
    });

    _polygon = [polygon[polygon.length - 1], ...polygon, polygon[0]];
    const _minDistanceList = [minDistanceList[minDistanceList.length - 1], ...minDistanceList];
    const fittedCoordinates = polygon.map((_, index) => {
      const p1 = _polygon[index];
      const p2 = _polygon[index + 1];
      const p3 = _polygon[index + 2];
      return PointCloudUtils.getIntersectionBySlope({
        p1: _minDistanceList[index].point,
        line1: [p1, p2],
        p2: _minDistanceList[index + 1].point,
        line2: [p2, p3],
      });
    });

    /**
     * Verify the Reliability of Data
     *
     * Both of x and y must be number.
     */
    const isErrorNumber = fittedCoordinates.some((v) => !(Number.isFinite(v.x) && Number.isFinite(v.y)));
    if (isErrorNumber) {
      return polygon;
    }

    return fittedCoordinates;
  }

  public getSensesPointZAxisInPolygon(polygon: IPolygonPoint[], zScope?: [number, number], intelligentFit?: boolean) {
    const points = this.scene.children.find((i) => i.uuid === this.pointsUuid) as THREE.Points;
    let minZ = 0;
    let maxZ = 0;
    let count = 0; // The count of scope
    let zCount = 0; // The Count of Polygon range
    let fittedCoordinates: ICoordinate[] = []; // Vertex coordinates after fitting(ThreeJs coordinates)
    let innerPointList: I3DSpaceCoord[] = []; // Points within the polygon range

    const pointPosArray = points?.geometry?.attributes?.position?.array || [];

    for (let idx = 0; idx < pointPosArray.length; idx += 3) {
      const x = pointPosArray[idx];
      const y = pointPosArray[idx + 1];
      const z = pointPosArray[idx + 2];
      const inPolygon = isInPolygon({ x, y }, polygon);
      if (inPolygon && (z || z === 0)) {
        innerPointList.push({ x, y, z });
      }
    }

    if (!innerPointList.length) {
      return { maxZ, minZ, count, zCount, fittedCoordinates };
    }

    if (intelligentFit) {
      innerPointList = this.filterNoise(innerPointList);
      fittedCoordinates = this.getFittedCoordinates(polygon, innerPointList);
    }
    innerPointList.sort((a, b) => a.z - b.z);
    minZ = innerPointList[0].z - 0.01;
    maxZ = innerPointList[innerPointList.length - 1].z + 0.01;
    zCount = innerPointList.length;
    if (zScope) {
      count = innerPointList.filter(({ z }) => z >= zScope[0] && z <= zScope[1]).length;
    }

    return { maxZ, minZ, count, zCount, fittedCoordinates };
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

  public getSphereSidePoint2DCoordinate(sphereParams: IPointCloudSphere) {
    return this.getSpherePoint2DCoordinate(sphereParams);
  }

  public getSphereBackPoint2DCoordinate(sphereParams: IPointCloudSphere) {
    return this.getSpherePoint2DCoordinate(sphereParams);
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

  public getSpherePoint2DCoordinate(sphereParams: IPointCloudSphere) {
    const { center, attribute, id, valid } = sphereParams;
    const { radius } = DEFAULT_SPHERE_PARAMS;

    const transParams = {
      center,
      attribute,
      id,
      valid,
      width: radius * 2,
      height: radius * 2,
      depth: radius * 2,
      rotation: 0,
    } as IPointCloudBox;
    const projectMatrix = new THREE.Matrix4()
      .premultiply(this.camera.matrixWorldInverse) // View / Camera Translation
      .premultiply(this.camera.projectionMatrix); // Projection Translation

    const boxSideMatrix = new THREE.Matrix4()
      .premultiply(this.getModelTransformationMatrix(transParams)) // Model Translation
      .premultiply(projectMatrix) // View Translation + Projection Translation
      .premultiply(this.basicCoordinate2CanvasMatrix4); // Viewport Translation
    this.sideMatrix = boxSideMatrix;

    const point2d = new THREE.Vector3(center.x, center.y, center.z).applyMatrix4(this.sideMatrix as any);

    const wZoom = this.containerWidth / (radius * 2);
    const hZoom = this.containerHeight / (radius * 2);

    return {
      point2d,
      zoom: Math.min(wZoom, hZoom) / 2,
    };
  }

  public getSphereTopPoint2DCoordinate(sphereParams: IPointCloudSphere) {
    const { center } = sphereParams;
    const { radius } = DEFAULT_SPHERE_PARAMS;

    const point2d = {
      x: -(center.y - this.containerWidth / 2),
      y: -(center.x - this.containerHeight / 2),
    };
    const wZoom = this.containerWidth / (radius * 2);
    const hZoom = this.containerHeight / (radius * 2);
    return {
      point2d,
      zoom: Math.min(wZoom, hZoom) / 2,
    };
  }

  public getBoxTopPolygon2DCoordinate(boxParams: IPointCloudBox) {
    const { width, height } = boxParams;
    const vectorList = this.getPolygonTopPoints(boxParams);
    // TODO. Need to optimize
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
      width: Math.abs(newBoxParams.width + offsetWidth),
      height: newBoxParams.height,
      depth: Math.abs(newBoxParams.depth + offsetDepth),
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
      height: Math.abs(newBoxParams.height + offsetWidth),
      depth: Math.abs(newBoxParams.depth + offsetDepth),
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
   * @param param0
   * @returns
   */
  public updatePointSize = ({ zoomIn, customSize }: { zoomIn?: boolean; customSize?: number }) => {
    const points = this.scene.getObjectByName(this.pointCloudObjectName) as
      | { material: THREE.ShaderMaterial }
      | undefined;

    if (!points) {
      return;
    }

    const preSize = points.material.uniforms.pointSize.value;

    if (zoomIn) {
      points.material.uniforms.pointSize.value = Math.min(preSize * 1.2, 10);
    } else {
      points.material.uniforms.pointSize.value = Math.max(preSize / 1.2, 1);
    }

    if (customSize) {
      points.material.uniforms.pointSize.value = customSize;
      this.pointsMaterialSize = customSize;
    }

    points.material.uniformsNeedUpdate = true;

    this.render();
  };

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export * from './matrix';
export * from './annotation';
