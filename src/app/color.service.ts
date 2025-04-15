import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private selectedColor = signal<string>('#ff0000');
  private uploadedLogo = signal<THREE.Texture | null>(null);
  decalSettings = signal({
    position: new THREE.Vector3(1, 0, 0), // Front-facing and slightly off the surface
    size: 1,
    rotation: 0,
  });

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

    // Update size and rotation
    updateDecalSettings(size: number, rotation: number) {
      this.decalSettings.update(prev => ({
        ...prev,
        size,
        rotation
      }));
    }

    // Optional: Update position
    updateDecalPosition(x: number, y: number, z: number) {
      this.decalSettings.update(prev => ({
        ...prev,
        position: new THREE.Vector3(x, y, z)
      }));
    }

}
