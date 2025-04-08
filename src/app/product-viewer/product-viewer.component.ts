import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { ColorService } from '../color.service';
import { Experience } from '../experience/experience.component';

@Component({
  selector: 'app-product-viewer',
  templateUrl: './product-viewer.component.html',
  styleUrl: './product-viewer.component.scss'
})
export class ProductViewerComponent implements AfterViewInit {
  sceneGraph = Experience;
 decalSize = 0.7;
 decalRotationDeg = 0;

  // mouse = new THREE.Vector2();
  // raycaster = new THREE.Raycaster();
  logoTexture: THREE.Texture | null = null; // from upload
  // modelMesh: THREE.Mesh | null = null; // will hold your GLTF mesh


  constructor(public colorService: ColorService){}


  ngAfterViewInit(): void {
    console.log('after view init');
  }

  handleColorSelected(color: string){
    this.colorService.setColor(color);
  }

  onLogoUpload(event: Event){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files[0]){
      const file =  input.files[0];

      const reader = new FileReader();

      reader.onload = () => {
        const url = reader.result as string;
        const textureLoader = new THREE.TextureLoader();


       this.logoTexture =  textureLoader.load(url, (texture) => {
          this.colorService.setLogo(texture);
        })
      }

      reader.readAsDataURL(file);
    }
  }


  // onLogoUpload(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   const file = input?.files?.[0];

  //   if (file) {
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //       const url = reader.result as string;
  //       const loader = new THREE.TextureLoader();

  //       loader.load(
  //         url,
  //         (texture) => {
  //           texture.anisotropy = 16;
  //           this.colorService.setLogo(texture);
  //         },
  //         undefined,
  //         (err) => {
  //           console.error('Error loading texture:', err);
  //         }
  //       );
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // }


  onSizeChange(event: Event) {
    const size = +(event.target as HTMLInputElement).value;
    this.decalSize = size;
    this.colorService.updateDecalSettings(size, this.degToRad(this.decalRotationDeg));
  }

  onRotationChange(event: Event) {
    const deg = +(event.target as HTMLInputElement).value;
    this.decalRotationDeg = deg;
    this.colorService.updateDecalSettings(this.decalSize, this.degToRad(deg));
  }

  private degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

}
