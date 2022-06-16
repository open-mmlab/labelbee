/*
 * POINTCLOUD - ALPHA - DEMO
 *
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:05:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-16 19:30:06
 */
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
}

export class PointCloud {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.PerspectiveCamera;

  public controls: OrbitControls;

  public axesHelper: THREE.AxesHelper;

  public pcdLoader: PCDLoader;

  private container: HTMLElement;

  constructor({ container }: IProps) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    this.initCamera();

    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.axesHelper = new THREE.AxesHelper(1000);
    this.pcdLoader = new PCDLoader();

    this.scene.add(this.axesHelper);
    this.scene.add(this.camera);
    container.appendChild(this.renderer.domElement);

    this.init();
  }

  public initCamera() {
    // Camera setting must be setted before Control's initial.
    const { camera } = this;
    camera.position.set(-100, 15, 15);
    camera.up.set(0, 0, 1);
  }

  public initControls() {
    const { controls } = this;
    const centerPoint = [15, 15, 15];
    controls.target = new THREE.Vector3(...centerPoint); // Camera watching?
    controls.addEventListener('change', () => {
      this.render();
    }); // use if there is no animation loop
    controls.minDistance = 1;
    controls.maxPolarAngle = Math.PI / 2; // Fobid orbit vertically over 90°

    controls.update();
  }

  public initRenderer() {
    const { renderer } = this;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public init() {
    const { scene } = this;
    // Background
    scene.background = new THREE.Color(0x050505);

    this.initControls();
    this.initRenderer();

    const params: IBoxParams = {
      center: { x: 13, y: -1, z: 1 },
      volume: { depth: 2, width: 5, height: 2 },
      rotation: Math.PI / 6,
    };

    // Test for Render
    this.renderCircle();
    this.generateBox(params);
    this.updateCamera(params, EPerspectiveView.LFT);
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

    group.add(box);
    group.add(arrow);
    group.position.set(center.x, center.y, center.z);

    group.rotation.set(0, 0, rotation);
    this.scene.add(group);
    this.render();
  }

  /**
   * Update Camera position & target
   * @param boxParams
   * @param perspectiveView
   */
  public updateCamera(boxParams: IBoxParams, perspectiveView: EPerspectiveView) {
    const { center, volume, rotation } = boxParams;
    const newVector = this.getCameraVector(center, rotation, volume, perspectiveView);
    this.camera.position.set(newVector.x, newVector.y, newVector.z);
    this.controls.target = new THREE.Vector3(center.x, center.y, center.z);
  }

  public createThreeMatrix4(matrix4: TMatrix4Tuple) {
    return new THREE.Matrix4().set(...matrix4);
  }

  public getCameraVector(
    centerPoint: I3DSpaceCoord,
    rotationZ: number,
    volume: IVolume,
    perspectiveView: EPerspectiveView = EPerspectiveView.Front,
    DEFAULT_DISTANCE = 10,
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

  public renderCircle() {
    const radius = 100;
    const curve = new THREE.EllipseCurve(
      15,
      15, // ax, aY
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
    this.scene.add(ellipse);
    this.render();
  }

  public loadPCDFile = (src: string) => {
    this.pcdLoader.load(src, (points: any) => {
      this.scene.add(points);
      points.material.size = 0.3;
      this.render();
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

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
