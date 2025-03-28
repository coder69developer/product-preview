import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-color-selector',
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.scss'
})
export class ColorSelectorComponent {
  @Output() colorSelected = new EventEmitter<string>();

  // colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']; // Example colors

  selectedColor: string = '#ff0000';

  selectColor(color: string) {
    this.colorSelected.emit(color);
  }

  onColorChange(event: Event){
    const input = event.target as HTMLInputElement;
    this.selectedColor =  input.value;

    this.colorSelected.emit(this.selectedColor);
  }
}
