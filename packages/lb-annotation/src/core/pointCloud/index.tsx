/*
 * POINTCLOUD - ALPHA - DEMO
 *
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-13 19:05:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-05 14:23:59
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
} from '@labelbee/lb-utils';
import { isInPolygon } from '@/utils/tool/polygonTool';
import { IPolygonPoint } from '@/types/tool/polygon';
import uuid from '@/utils/uuid';
import { PCDLoader } from './PCDLoader';
import { OrbitControls } from './OrbitControls';

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
  orthgraphicParams?: IOrthographicCamera;
}

const DEFAULT_DISTANCE = 30;

export class PointCloud {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  // public camera: THREE.PerspectiveCamera;

  public controls: OrbitControls;

  public axesHelper: THREE.AxesHelper;

  public pcdLoader: PCDLoader;

  public templateBox?: IPointCloudBox;

  private cacheCameraPosition = new THREE.Vector3(-1, 0, 10);

  private container: HTMLElement;

  private isOrthographicCamera = false;

  private pointsUuid = '';

  private sideMatrix?: THREE.Matrix4;

  private orthgraphicParams?: IOrthographicCamera;

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
      this.orthgraphicParams = orthgraphicParams;
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

  public setCacheCameraPosition(vector: THREE.Vector3) {
    this.cacheCameraPosition = vector;
  }

  public initCamera() {
    // Camera setting must be setted before Control's initial.
    const { camera } = this;

    // TODO
    if (this.isOrthographicCamera) {
      const { x, y, z } = this.cacheCameraPosition;
      camera.position.set(x, y, z);
    } else {
      camera.position.set(-1, 0, 500);
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

    const params: IPointCloudBox = {
      center: { x: 13, y: -1, z: 1 },
      depth: 2,
      width: 5,
      height: 2,
      rotation: Math.PI / 6,
      trackID: 0,
      id: uuid(),
      valid: true,
      attribute: '',
    };

    // Test for Render
    this.generateBox(params);
    this.controls.update();
  }

  public generateBox(boxParams: IPointCloudBox, id: string = uuid(), color = 0xffffff) {
    const oldBox = this.scene.getObjectByName(id);
    // Remove Old Box
    if (oldBox) {
      oldBox.removeFromParent();
    }

    const { center, width, height, depth, rotation } = boxParams;
    this.templateBox = boxParams;
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(width, height, depth);
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

    group.name = id;
    this.scene.add(group);
    this.render();
  }

  /**
   * Get OrthographicCamera Params to Change
   * @param boxParams
   * @returns
   */
  public getOrthograhicCamera(boxParams: IPointCloudBox) {
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

  public setTemplateBox(boxParams: IPointCloudBox) {
    this.templateBox = boxParams;
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

    // It will make the
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    return {
      cameraPositionVector,
    };
  }

  public updateTopCamera() {
    // this.camera.position.set(-1, 0, 10); //
    this.camera.zoom = 1;
    this.initCamera();
    this.initControls();
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
    this.updateCamera({ x: -1, y: 0, z: 500 }, { x: 0, y: 0, z: 0 });
  }

  public createThreeMatrix4(matrix4: TMatrix4Tuple) {
    return new THREE.Matrix4().set(...matrix4);
  }

  /**
   *
   * @param points
   * @param centerPoint
   * @param rotationZ
   * @returns
   */
  public rotatePoint(points: ICoordinate, centerPoint: I3DSpaceCoord, rotationZ: number) {
    const pointVector = new THREE.Vector3(points.x, points.y, 1);
    const Rz = new THREE.Matrix4().makeRotationZ(rotationZ);
    const TFrom = new THREE.Matrix4().makeTranslation(centerPoint.x, centerPoint.y, centerPoint.z);
    const TBack = new THREE.Matrix4().makeTranslation(-centerPoint.x, -centerPoint.y, -centerPoint.z);

    return pointVector.clone().applyMatrix4(TBack).applyMatrix4(Rz).applyMatrix4(TFrom);
  }

  /**
   * For pcd filter point sets
   * @param boxParams
   * @param points
   * @param color
   * @returns
   */
  public filterPointsByBox(boxParams: IPointCloudBox, points: number[], color: number[]) {
    const newPosition = [];
    const newColor = [];
    const { center, width, height, depth, rotation } = boxParams;

    const polygon = [
      {
        x: center.x + width / 2,
        y: center.y + height / 2,
      },
      {
        x: center.x + width / 2,
        y: center.y - height / 2,
      },
      {
        x: center.x - width / 2,
        y: center.y - height / 2,
      },
      {
        x: center.x - width / 2,
        y: center.y + height / 2,
      },
    ].map((v) => {
      const vector = this.rotatePoint(v, center, rotation);
      return {
        x: vector.x,
        y: vector.y,
      };
    });

    const zMax = center.z + depth / 2;
    const zMin = center.z - depth / 2;

    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      const inPolygon = isInPolygon({ x, y }, polygon);

      if (inPolygon && z >= zMin && z <= zMax) {
        newPosition.push(x);
        newPosition.push(y);
        newPosition.push(z);
        newColor.push(color[i]);
        newColor.push(color[i + 1]);
        newColor.push(color[i + 2]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPosition, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColor, 3));
    geometry.computeBoundingSphere();
    return geometry;
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
      points.material.size = 1;

      const circle = this.createCircle(points.geometry.boundingSphere.radius * 2);

      this.scene.add(points);
      this.scene.add(circle);

      this.render();

      this.pointsUuid = points.uuid;

      if (cb) {
        cb();
      }
    });
  };

  /**
   * Load PCD File
   * @param src
   * @param boxParams
   */
  public loadPCDFileByBox = (src: string, boxParams: IPointCloudBox) => {
    this.pcdLoader.load(src, (points: any) => {
      points.material.size = 1;

      // TODO. Speed can be optimized.
      const newGeometry = this.filterPointsByBox(
        boxParams,
        points.geometry.attributes.position.array,
        points.geometry.attributes.color.array,
      );

      const newPoints = new THREE.Points(newGeometry, points.material);
      this.scene.add(newPoints);
      this.render();
    });
  };

  public generateBoxArrow = ({ width, depth }: IPointCloudBox) => {
    const dir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(-width / 2, 0, -depth / 2);
    const arrowLen = width;
    const hex = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, arrowLen, hex);
    return arrowHelper;
  };

  public generateBoxID = (boxParams: IPointCloudBox) => {
    const texture = new THREE.Texture(this.getTextCanvas('1000'));
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

  public getSensesPointZAxisInPolygon(polygon: IPolygonPoint[]) {
    const points = this.scene.children.find((i) => i.uuid === this.pointsUuid) as THREE.Points;
    let minZ = 0;
    let maxZ = 0;

    if (points && points?.geometry) {
      const pointPosArray = points?.geometry.attributes.position;

      for (let idx = 0; idx < pointPosArray.count; idx++) {
        const cur = idx * 3;
        const x = pointPosArray.getX(cur);
        const y = pointPosArray.getY(cur);
        const z = pointPosArray.getZ(cur);

        const inPolygon = isInPolygon({ x, y }, polygon);

        if (inPolygon && z) {
          maxZ = Math.max(z, maxZ);
          minZ = Math.min(z, minZ);
        }
      }
    }

    return { maxZ, minZ };
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
    // return {
    //   x: vector.x / w - w / 2,
    //   y: -(vector.y / h - h / 2),
    // };
    return new THREE.Vector3(vector.x / w - w / 2, -(vector.y / h - h / 2), 1);
  }

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
    const vectorList = [lfb, lft, lbt, lbb];

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

  public getWorld2CanvasMatrix(boxParams: IPointCloudBox) {
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

  public getBoxSidePolygon2DCoordinate(boxParams: IPointCloudBox) {
    const { width, height } = boxParams;
    const vectorList = this.getPolygonSidePoints(boxParams);

    // updateCamerta

    // 2022.07.03 Test for Matrix
    // First times
    // if (!this.sideMatrix) {
    //   debugger;
    const projectMatrix = new THREE.Matrix4()
      .premultiply(this.camera.matrixWorldInverse)
      .premultiply(this.camera.projectionMatrix);

    const boxSideMatrix = new THREE.Matrix4()
      .premultiply(this.getWorld2CanvasMatrix(boxParams)) // need to update everytimes
      .premultiply(projectMatrix)
      .premultiply(this.basicCoordinate2CanvasMatrix4);
    this.sideMatrix = boxSideMatrix;
    // }

    const polygon2d = vectorList
      .map((vector) => new THREE.Vector3(vector.x, vector.y, vector.z))
      // // 2022.07.03 Test for Matrix
      .map((vector) => vector.applyMatrix4(this.sideMatrix as any));

    // OriginWay to update
    // .map((vector) => vector.applyMatrix4(this.getWorld2CanvasMatrix(boxParams)))
    // .map((vector) => vector.project(this.camera))
    // .map((vector) => this.getBasicCoordinate2Canvas(vector));

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
      .map((vector) => vector.applyMatrix4(this.getWorld2CanvasMatrix(boxParams)))
      .map((vector) => {
        return {
          x: vector.y,
          y: vector.x,
        };
      })
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
    offsetCenterPoint: { x: number; y: number; z: number },
    offsetWidth: number,
    offsetDepth: number,
  ) {
    if (!this.templateBox) {
      return;
    }

    const Rz = new THREE.Matrix4().makeRotationZ(this.templateBox.rotation).invert();
    const offsetVector = new THREE.Vector3(-offsetCenterPoint.x, 0, 0).applyMatrix4(Rz);

    // need to Change offset to world side
    let newBoxParams = this.templateBox;
    newBoxParams.center = {
      x: newBoxParams.center.x + offsetVector.x,
      y: newBoxParams.center.y + offsetVector.y,
      z: newBoxParams.center.z - offsetCenterPoint.z,
    };

    newBoxParams = {
      ...newBoxParams,
      width: newBoxParams.width + offsetWidth,
      height: newBoxParams.height,
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
  public getNewBoxBySideUpdateByPoints(pointList: any[], offsetHeight: number, offsetZ: number) {
    if (!this.templateBox) {
      return;
    }

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
      .add(new THREE.Vector3(this.templateBox.center.x, this.templateBox.center.y, this.templateBox.center.z));

    const newBoxParams = {
      ...this.templateBox,
      center: {
        x: this.templateBox.center.x - offsetVector.x,
        y: this.templateBox.center.y - offsetVector.y,
        // y: centerVector.y,
        z: this.templateBox.center.z - offsetZ,
      },
      width,
      height: this.templateBox.height,
      depth: this.templateBox.depth + offsetHeight,
      // depth,
      rotation: this.templateBox.rotation,
    };

    // Update templateBox Cache
    this.templateBox = newBoxParams;
    return { newBoxParams };
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
