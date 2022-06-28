/*
 * POINTCLOUD - ALPHA - DEMO
 *
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:05:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 23:09:45
 */
/*eslint import/no-unresolved: 0*/
import * as THREE from 'three';
import {
  PerspectiveShiftUtils,
  TMatrix4Tuple,
  EPerspectiveView,
  IVolume,
  IBoxParams,
  I3DSpaceCoord,
} from '@labelbee/lb-utils';
import { OrbitControls } from './OrbitControls';
import { PCDLoader } from './PCDLoader';

interface IProps {
  container: HTMLElement;
  noAppend?: boolean; // temporary;
  isOrthographicCamera?: boolean;
  orthgraphicParams?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
  };
}

export class PointCloud {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  // public camera: THREE.PerspectiveCamera;

  public controls: OrbitControls;

  public axesHelper: THREE.AxesHelper;

  public pcdLoader: PCDLoader;

  private container: HTMLElement;

  private isOrthographicCamera = false;

  constructor({ container, noAppend, isOrthographicCamera, orthgraphicParams }: IProps) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // TODO
    if (isOrthographicCamera && orthgraphicParams) {
      this.isOrthographicCamera = true;
      this.camera = new THREE.OrthographicCamera(
        orthgraphicParams.left,
        orthgraphicParams.right,
        orthgraphicParams.top,
        orthgraphicParams.bottom,
        orthgraphicParams.near,
        orthgraphicParams.far,
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(30, this.containerWidth / this.containerHeight, 1, 1000);
    }
    // this.camera = new THREE.OrthographicCamera(-500, 500, 500, -500, 100, -100);
    this.initCamera();

    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.axesHelper = new THREE.AxesHelper(1000);
    this.pcdLoader = new PCDLoader();

    this.scene.add(this.axesHelper);
    this.scene.add(this.camera);
    // TODO
    if (!noAppend) {
      container.appendChild(this.renderer.domElement);
    }

    this.init();
  }

  get containerWidth() {
    return this.container.clientWidth;
  }

  get containerHeight() {
    return this.container.clientHeight;
  }

  public initCamera() {
    // Camera setting must be setted before Control's initial.
    const { camera } = this;

    // TODO
    if (this.isOrthographicCamera) {
      camera.position.set(-1, 0, 10);
    } else {
      camera.position.set(-100, 15, 15);
    }
    camera.up.set(0, 0, 1);
  }

  public initControls() {
    const { controls } = this;
    const centerPoint = [0, 0, 0];
    controls.target = new THREE.Vector3(...centerPoint); // Camera watching?
    controls.addEventListener('change', () => {
      this.render();
    }); // use if there is no animation loop
    controls.maxPolarAngle = Math.PI / 2; // Fobid orbit vertically over 90°

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
    scene.background = new THREE.Color(0x4c4c4c);

    this.initControls();
    this.initRenderer();

    const params: IBoxParams = {
      center: { x: 13, y: -1, z: 1 },
      volume: { depth: 2, width: 5, height: 2 },
      rotation: Math.PI / 6,
    };

    // Test for Render
    this.generateBox(params);
    this.controls.update();
  }

  public generateBox(boxParams: IBoxParams, color = 0xffffff) {
    const { center, volume, rotation } = boxParams;
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(volume.width, volume.height, volume.depth);
    const matarial = new THREE.MeshBasicMaterial({ color: 'blue' });
    const cube = new THREE.Mesh(geometry, matarial);
    const box = new THREE.BoxHelper(cube, color);
    const arrow = this.generateBoxArrow(boxParams);
    const boxID = this.generateBoxID(boxParams);

    group.add(box);
    group.add(arrow);
    group.add(boxID);
    group.position.set(center.x, center.y, center.z);

    group.rotation.set(0, 0, rotation);
    this.scene.add(group);
    this.render();
  }

  /**
   * Get OrthographicCamera Params to Change
   * @param boxParams
   * @returns
   */
  public getOrthograhicCamera(boxParams: IBoxParams) {
    const { center, volume } = boxParams;
    const offset = 10;
    const left = center.x - volume.width / 2 - offset;
    const right = center.x - volume.width / 2 + offset;
    const top = center.y + volume.height / 2 + offset;
    const bottom = center.y - volume.height / 2 - offset;

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

  /**
   * Update Camera position & target
   * @param boxParams
   * @param perspectiveView
   */
  public updateCameraByBox(boxParams: IBoxParams, perspectiveView: EPerspectiveView) {
    const { center, volume, rotation } = boxParams;
    const newVector = this.getCameraVector(center, rotation, volume, perspectiveView);
    this.camera.position.set(newVector.x, newVector.y, newVector.z);
    this.controls.target = new THREE.Vector3(center.x, center.y, center.z);
    // const { left, right, top, bottom, near, far, zoom } = this.getOrthograhicCamera(boxParams);

    // console.log('ads', { left, right, top, bottom, near, far, zoom });

    // // orthograpic camera
    // this.camera.left = left;
    // this.camera.right = right;
    // this.camera.top = top;
    // this.camera.bottom = bottom;
    // this.camera.near = near;
    // this.camera.far = far;
    // this.camera.zoom = zoom;
    // this.camera.updateProjectionMatrix();
    this.updateCamera(newVector, center);
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
    this.updateCamera({ x: -1, y: 0, z: 500 }, { x: 0, y: 0, z: 0 });
  }

  public createThreeMatrix4(matrix4: TMatrix4Tuple) {
    return new THREE.Matrix4().set(...matrix4);
  }

  public getCameraVector(
    centerPoint: I3DSpaceCoord,
    rotationZ: number,
    volume: IVolume,
    perspectiveView: EPerspectiveView = EPerspectiveView.Front,
    DEFAULT_DISTANCE = 30,
  ) {
    let TcMatrix4 = PerspectiveShiftUtils.frontViewMatrix4(DEFAULT_DISTANCE);

    switch (perspectiveView) {
      case EPerspectiveView.Front:
        break;
      case EPerspectiveView.Back:
        TcMatrix4 = PerspectiveShiftUtils.backViewMatrix4(DEFAULT_DISTANCE);
        break;
      case EPerspectiveView.Left:
        TcMatrix4 = PerspectiveShiftUtils.leftViewMatrix4(DEFAULT_DISTANCE);
        break;
      case EPerspectiveView.Right:
        TcMatrix4 = PerspectiveShiftUtils.rightViewMatrix4(DEFAULT_DISTANCE);
        break;
      case EPerspectiveView.Top:
        TcMatrix4 = PerspectiveShiftUtils.topViewMatrix4(DEFAULT_DISTANCE);
        break;
      case EPerspectiveView.LFT:
        TcMatrix4 = PerspectiveShiftUtils.leftFrontTopViewMatrix4(DEFAULT_DISTANCE, volume);
        break;
      case EPerspectiveView.RBT:
        TcMatrix4 = PerspectiveShiftUtils.rightBackTopViewMatrix4(DEFAULT_DISTANCE, volume);
        break;
      default: {
        break;
      }
    }

    const Tc = this.createThreeMatrix4(TcMatrix4); // Camera Position - Transformation Matrix

    const TFrom = new THREE.Matrix4().makeTranslation(centerPoint.x, centerPoint.y, centerPoint.z);
    const TBack = new THREE.Matrix4().makeTranslation(-centerPoint.x, -centerPoint.y, -centerPoint.z);
    const Rz = new THREE.Matrix4().makeRotationZ(rotationZ);

    const centerVector = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z);
    const cameraVector = centerVector.clone().applyMatrix4(Tc).applyMatrix4(TBack).applyMatrix4(Rz).applyMatrix4(TFrom);
    return cameraVector;
  }

  public createCircle(radius: number) {
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
    return ellipse;
  }

  public loadPCDFile = (src: string, cb?: () => void) => {
    this.pcdLoader.load(src, (points: any) => {
      points.material.size = 0.3;

      const circle = this.createCircle(points.geometry.boundingSphere.radius * 2);

      this.scene.add(points);
      this.scene.add(circle);

      this.render();

      if (cb) {
        cb();
      }
    });
  };

  public generateBoxArrow = ({ volume }: IBoxParams) => {
    const dir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(-volume.width / 2, 0, -volume.depth / 2);
    const length = volume.width;
    const hex = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    return arrowHelper;
  };

  public generateBoxID = (boxParams: IBoxParams) => {
    const texture = new THREE.Texture(this.getTextCanvas('1000'));
    texture.needsUpdate = true;
    const sprite = new THREE.SpriteMaterial({ map: texture, depthWrite: false });
    const boxID = new THREE.Sprite(sprite);
    boxID.scale.set(5, 5, 5);
    boxID.position.set(-boxParams.volume.width / 2, 0, boxParams.volume.depth / 2 + 0.5);
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

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
