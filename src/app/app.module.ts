import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgtCanvas } from 'angular-three';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColorSelectorComponent } from './color-selector/color-selector.component';
import { ProductViewerComponent } from './product-viewer/product-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductViewerComponent,
    ColorSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgtCanvas
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
