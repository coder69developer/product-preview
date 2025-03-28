import { Component } from '@angular/core';
import * as THREE from 'three';
import { ColorService } from '../color.service';
import { Experience } from '../experience/experience.component';

@Component({
  selector: 'app-product-viewer',
  templateUrl: './product-viewer.component.html',
  styleUrl: './product-viewer.component.scss'
})
export class ProductViewerComponent {
  sceneGraph = Experience;
  progressX: number = 1;
  progressY: number = 1;

  constructor(public colorService: ColorService){}

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


       const texture =  textureLoader.load(url, (texture) => {
          this.colorService.setLogo(texture);
        })


        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(1,1);
      }

      reader.readAsDataURL(file);
    }
  }

  onProgressChangeX(event: Event){
    const input = event.target as HTMLInputElement;
    this.progressX = parseFloat(input.value);

    this.colorService.setLogoSizeX(parseFloat(input.value))
  }

  onProgressChangeY(event: Event){
    const input = event.target as HTMLInputElement;
    this.progressY = parseFloat(input.value);
    this.colorService.setLogoSizeY(parseFloat(input.value))
  }
}
