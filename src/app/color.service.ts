import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private selectedColor = signal<string>('#ff0000');
  private uploadedLogo = signal<THREE.Texture | null>(null);
  private progress = signal<number>(0.5);
  private progressY = signal<number>(0.5);

  get color(){
    return this.selectedColor();
  }

  setColor(color: string){
    this.selectedColor.set(color);
  }

  get logo(){
    return this.uploadedLogo();
  }

  setLogo(texture: THREE.Texture){

    this.uploadedLogo.set(texture);
  }

  get logoSizeX(){
    return this.progress();
  }

  setLogoSizeX(value:number){
    this.progress.set(value)
  }

  get logoSizeY(){
    return this.progressY();
  }

  setLogoSizeY(value:number){
    this.progressY.set(value)
  }
}
