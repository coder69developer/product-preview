import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, viewChild } from '@angular/core';
import { extend, injectBeforeRender, injectLoader, injectStore, NgtArgs } from 'angular-three';
import * as THREE from 'three';
import { BufferGeometry, Color, Euler, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColorService } from '../color.service';

import { DecalGeometry, OrbitControls } from 'three-stdlib';
extend(THREE);
extend({OrbitControls});


@Component({
  standalone: true,
  imports: [NgtArgs],
  template: `
    <ngt-ambient-light [intensity]="2"/>
    <ngt-directional-light [intensity]="2" [position]="[0,0,1]"/>
    <ngt-directional-light [intensity]="2" [position]="[0,0,-1]"/>
    <ngt-point-light [intensity]="0.5" [position]="[1, 1, 0]"/>
    <ngt-point-light [intensity]="0.5" [position]="[-0.5, -0.5, 0]"/>
    <ngt-primitive *args="[model()]" [position]="[1, -2, 0]" />

    <ngt-orbit-controls #orbitControls *args="[camera(), glDomElement()]" [enableZoom]="false" [autoRotate]="true" [autoRotateSpeed]="5"/>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {

  colorService = inject(ColorService);
  ngtStore = injectStore();

  orbitControls = viewChild<ElementRef<OrbitControls>>('orbitControls');

  gltf = injectLoader(() => GLTFLoader, () => `assets/bottle.gltf`);

  model = computed(() => {
    const gltf =  this.gltf();
    if(!gltf) return null;

    const color = this.colorService.color;
    const logo = this.colorService.logo;

    const progressX = this.colorService.logoSizeX;
    const progressY = this.colorService.logoSizeY;

    const mesh = gltf.scene.getObjectByName('Object_2') as Mesh;
    const material = mesh.material as MeshStandardMaterial;

    material.color.set(new Color(color));

    if(logo){
      material.map = logo;
      // Optional: Adjust the texture offset to fine-tune positioning (if needed)
      // material.map.offset.set(1, 6); // Default position, change to move texture

      // Adjust the texture mapping using a custom function
      // this.adjustTextureMapping(mesh.geometry);
      const euler = new Euler( 0, 1, 1.57, 'XYZ' );
      const vector = new Vector3(0,1,0);

      const decalGeometry = new DecalGeometry(mesh, vector,  euler, vector)

      // Adjust the texture's width and height using the `repeat` property
      // For example, repeat 2 times horizontally and 1.5 times vertically
      // material.map.repeat.width = 5;
      // material.map.repeat.height = 5;
       material.map.repeat.set(1, 1); // Modify these values to adjust the texture scaling
      // if(progressX || progressY){
      //   console.log('repeat X', progressX);
      //   console.log('repeat Y', progressY);
      //   material.map.repeat.set(progressX, progressY);
      // }

      const meshScene = new Mesh(decalGeometry, material);
      gltf.scene.add(meshScene);

      material.needsUpdate = true;
    }



    console.log(gltf.scene);

    return gltf.scene;
  })

  camera = this.ngtStore.select('camera');
  glDomElement = this.ngtStore.select('gl', 'domElement');



  constructor(){
    injectBeforeRender(() => {
      const orbitControls = this.orbitControls()?.nativeElement;
      if(orbitControls){
        orbitControls.update();
      }
    })
  }


  // Function to adjust the UV mapping
  adjustTextureMapping(geometry: BufferGeometry) {
    const uvAttribute = geometry.attributes['uv'];

    if (!uvAttribute) {
      console.error('No UV attribute found on the geometry');
      return;
    }

    // Modify the UV coordinates to apply texture to the region below the neck and above 2 inches from the bottle
    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i); // Get the U coordinate of the current vertex
      const v = uvAttribute.getY(i); // Get the V coordinate of the current vertex

      // Adjust the V coordinate (vertical axis) to limit the texture to a specific region
      // Assuming that you know the UV coordinates' range, modify this logic accordingly
      if (v > 0.7 && v < 0.7) {  // This is just an example, adjust based on your model's UV mapping
        uvAttribute.setY(i, v); // Keep the texture only in this region
      } else {
        uvAttribute.setY(i, 0);  // Set to 0 to avoid applying texture outside the desired region
      }
    }

    uvAttribute.needsUpdate = true;
  }
}

