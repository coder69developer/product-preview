import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, viewChild } from '@angular/core';
import { extend, injectBeforeRender, injectLoader, injectStore, NgtArgs } from 'angular-three';
import * as THREE from 'three';
import { Mesh, MeshStandardMaterial } from 'three';
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

    <ngt-orbit-controls #orbitControls *args="[camera(), glDomElement()]" [enableZoom]="false" [autoRotate]="false" [autoRotateSpeed]="5"/>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {

  private colorService = inject(ColorService);
  private ngtStore = injectStore();
  private gltf = injectLoader(() => GLTFLoader, () => `assets/bottle.gltf`);
  private mouse = new THREE.Vector2();
  private scene = this.ngtStore.get().scene;
  private modelMesh: Mesh | null = null;
  private currentDecalMesh: THREE.Mesh | null = null;

  camera = this.ngtStore.select('camera');
  glDomElement = this.ngtStore.select('gl','domElement');
  orbitControls = viewChild<ElementRef<OrbitControls>>('orbitControls');


  // model = computed(() => {
  //   const gltf =  this.gltf();
  //   if(!gltf) return null;

  //   const color = this.colorService.color;
  //   const logo = this.colorService.logo;

  //   const mesh = gltf.scene.getObjectByName('Object_2') as Mesh;
  //   const material = mesh.material as MeshStandardMaterial;

  //   material.color.set(new Color(color));
  //   this.modelMesh = mesh;
  //   if(logo){
  //     // material.map = logo;

  //     // // Optional: Adjust the texture offset to fine-tune positioning (if needed)
  //     //  material.map.offset.set(.001, 0); // Default position, change to move texture


  //     const logoTexture = logo; // Assuming the logo is already loaded as a texture

  //     // Set logo texture properties
  //     // logoTexture.wrapS = THREE.ClampToEdgeWrapping;
  //     // logoTexture.wrapT = THREE.ClampToEdgeWrapping;
  //     // logoTexture.repeat.set(1, 1); // No repetition, adjust if needed
  //     // logoTexture.offset.set(0, 0); // Centered by default


  //     const position = new THREE.Vector3(0, 1, 1);
  //     const orientation = new THREE.Euler(0, 0, 0); // Front
  //     const size = new THREE.Vector3(0.7, 0.7, 0.2); // Width, height, depth
  //     // Generate DecalGeometry
  //     const decalGeometry = new DecalGeometry(mesh, position, orientation, size);


  //     const decalMaterial = new THREE.MeshBasicMaterial({
  //       map: logoTexture,
  //       transparent: true, // Allows PNG transparency if your logo has it
  //       // depthTest: true,
  //       // depthWrite: false, // To properly overlay the decal
  //       side: THREE.DoubleSide
  //     });

  //     const planeGeometry = new THREE.PlaneGeometry(2,2);

  //     // const testMat = new THREE.MeshBasicMaterial({ map: logoTexture });
  //     // const testPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), testMat);
  //     // testPlane.position.set(0, 1, 1);
  //     // gltf.scene.add(testPlane);

  //     // Define decal size and position


  //     // Add decal mesh to the scene
  //     const decalMesh = new THREE.Mesh(planeGeometry, decalMaterial);

  //     decalMesh.position.set(0,2,1);
  //     decalMesh.rotation.set(0,0,0);
  //     console.log('mesh applied', decalMesh)

  //     gltf.scene.add(decalMesh);
  //   }
  //   console.log(gltf.scene);

  //   return gltf.scene;
  // })

  model = computed(() => {
    const gltf = this.gltf();
    if (!gltf) return null;

    const mesh = gltf.scene.getObjectByName('Object_2') as Mesh;
    const material = mesh.material as MeshStandardMaterial;

    // Set base color
    material.color.set(new THREE.Color(this.colorService.color));
    this.modelMesh = mesh;

    const logo = this.colorService.logo;
    if (logo) {
      const settings = this.colorService.decalSettings();
      this.applyDecal(mesh, logo, settings);
    }

    return gltf.scene;
  })

  constructor(){
    // 👇 Keep orbit controls updating
    injectBeforeRender(() => {
      const orbitControls = this.orbitControls()?.nativeElement;
      if(orbitControls){
        orbitControls.update();
      }
    })

     // 👇 Watch for changes in decalSettings and re-apply decal
     effect(() => {
      const settings = this.colorService.decalSettings();
      const logo = this.colorService.logo;

      if (this.modelMesh && logo) {
        this.applyDecal(this.modelMesh, logo, settings);
      }
    });

  }

  // private applyDecal(
  //   mesh: Mesh,
  //   logoTexture: THREE.Texture,
  //   settings: { position: THREE.Vector3; size: number; rotation: number }
  // ) {
  //     // Clean up old decal
  //     if (this.currentDecalMesh) {
  //       this.scene.remove(this.currentDecalMesh);
  //       this.currentDecalMesh.geometry.dispose();
  //       const material = this.currentDecalMesh.material;
  //       if (Array.isArray(material)) {
  //         material.forEach(mat => mat.dispose());
  //       } else {
  //         material.dispose();
  //       }
  //     }

  //     const orientation = new THREE.Euler(0, 2, settings.rotation);
  //     const size = new THREE.Vector3(settings.size, settings.size, settings.size);

  //     const decalGeometry = new DecalGeometry(mesh, settings.position, orientation, size);

  //     const decalMaterial = new THREE.MeshStandardMaterial({
  //       map: logoTexture,
  //       transparent: false,
  //       depthTest: true,
  //       depthWrite: false,
  //       polygonOffset: true,
  //       polygonOffsetFactor: -4,
  //     });

  //     const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
  //     this.scene.add(decalMesh);
  //     this.currentDecalMesh = decalMesh;
  // }

  private applyDecal(
    mesh: Mesh, // The mesh (3D object) on which the decal (logo) is applied
    logoTexture: THREE.Texture, // The texture (logo) to be applied
    settings: { position: THREE.Vector3; size: number; rotation: number } // Decal settings (position, size, and rotation)
  ) {
    // Step 1: Clean up old decal if it exists
    if (this.currentDecalMesh) {
        // Remove the existing decal from the scene
        this.scene.remove(this.currentDecalMesh);

        // Dispose of the decal's geometry and material to free memory
        this.currentDecalMesh.geometry.dispose();
        const material = this.currentDecalMesh.material;

        // Dispose material(s) (handle both single and multiple materials)
        if (Array.isArray(material)) {
            material.forEach(mat => mat.dispose());
        } else {
            material.dispose();
        }
    }

    // Step 2: Prepare the decal settings (orientation, size, and position)
    const orientation = new THREE.Euler(0, 0, settings.rotation); // Rotation around the Z-axis for decal
    const size = new THREE.Vector3(settings.size, settings.size, settings.size); // Size of the decal

    // **Adjust position**: The decal will appear like a mirror view if the positioning is wrong.
    // Here, we adjust the decal's position relative to the mesh. You may want to fine-tune the offset values.

     // Step 3: Adjust the aspect ratio of the logo texture
     const logoAspectRatio = logoTexture.image.width / logoTexture.image.height;

     // Adjust size to fit the aspect ratio of the logo texture
     const adjustedSize = new THREE.Vector3(
         settings.size * logoAspectRatio, // Adjust the X size based on the logo's aspect ratio
         settings.size,                   // Keep Y size as it is
         settings.size                    // Keep Z size as it is
     );

    const adjustedPosition = settings.position.clone(); // Clone the original position to avoid reference issues

    // Fine-tune position to ensure proper alignment (adjust these offsets as needed)
    // These adjustments help with making sure the decal is placed in a reasonable area of the mesh.
    adjustedPosition.x += 0.0;  // Fine-tune position on X-axis
    adjustedPosition.y -= 1.5;  // Fine-tune position on Y-axis (e.g., adjust decal vertically)
    adjustedPosition.z += 0.05; // Move decal slightly forward on the Z-axis to avoid depth issues

    // Step 3: Create the decal geometry
    const decalGeometry = new DecalGeometry(mesh, adjustedPosition, orientation, adjustedSize);

    // Step 4: Create the material for the decal (using the logo texture)
    const decalMaterial = new THREE.MeshStandardMaterial({
        map: logoTexture, // Use the provided logo texture
        transparent: false, // No transparency
        depthTest: true, // Ensure the decal respects depth (don't overwrite mesh if behind)
        depthWrite: false, // Don't write to depth buffer (helpful for overlaying decals)
        polygonOffset: true, // Avoid z-fighting with the mesh
        polygonOffsetFactor: -4, // Slightly move the decal back to avoid z-fighting
    });

    // Step 5: Create the decal mesh
    const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);

    // Add the decal mesh to the scene
    this.scene.add(decalMesh);

    // Step 6: Store the current decal mesh for future removal/updates
    this.currentDecalMesh = decalMesh;
  }

}




