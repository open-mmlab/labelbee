/*
 * POINTCLOUD - ALPHA - DEMO
 *
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:05:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-14 10:43:45
 */
import * as THREE from 'three';
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
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 2000);
    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.axesHelper = new THREE.AxesHelper(1000);
    this.pcdLoader = new PCDLoader();

    this.init();
    this.renderSomething();
  }

  public init() {
    const { renderer, scene, axesHelper, controls, container, camera } = this;

    // Background
    scene.background = new THREE.Color(0x000000);
    scene.add(axesHelper);

    // size
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera.position.set(20, 20, 10);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.addEventListener('change', () => {
      this.render();
    }); // use if there is no animation loop
    controls.minDistance = 10;
    // controls.update();

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set(0, 20, 100);
    controls.update();
  }

  public renderSomething() {
    // 绘制范围弧线
    const radius = 30;
    const curve = new THREE.EllipseCurve(
      0,
      0, // ax, aY
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
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
