import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.createScene();
    this.loadModel();
    this.startRenderingLoop();
  }

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  rotationSpeedX: number = 0.01;
  rotationSpeedY: number = 0.01;
  size: number = 200;

  cameraZ: number = 5;
  fov: number = 70;
  aspectRatio: Function = () => this.canvas.clientWidth / this.canvas.clientHeight;
  nearClippingPlane: number = 0.01;
  farClippingPlane: number = 1000;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private loader = new GLTFLoader();
  private modelpath: string = "../../assets/animatedcube.glb";

  private mixer!: THREE.AnimationMixer;
  private animation!: THREE.AnimationClip;
  private clock = new THREE.Clock();


  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFFFFF);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.aspectRatio(),
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
  }

  private loadModel() {
    this.loader.load(this.modelpath, (gltf) => {
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      const clip = this.mixer.clipAction(gltf.animations[0]);
      clip.play();
      
      this.scene.add(gltf.scene);
    }, undefined, function (error) {
      console.error(error);
    });
  }

  private animateModel() {
    if(this.mixer)
      this.mixer.update(this.clock.getDelta());
  }

  private startRenderingLoop() {

    let component: TestComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateModel();
      component.renderer.render(component.scene, component.camera);
    })();
  }
}
