import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styles: [
    `
      .cropper {
        max-width: 60%;
        display: block;
        margin: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCropperComponent {
  @Input() public imageChangedEvent?: Event;
  @Output() public imageCropped = new EventEmitter<Blob>();
  public croppedImage?: Blob;

  public onImageCropped(event: ImageCroppedEvent): void {
    const parts = event.base64.split(';base64,');
    const decodedData = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    this.croppedImage = new Blob([uInt8Array], {
      type: parts[0].split(':')[1],
    });
  }

  public onApplyCroppedImage(): void {
    if (this.croppedImage) {
      this.imageCropped.emit(this.croppedImage);
    } else if (this.imageChangedEvent && this.imageChangedEvent.target) {
      const target = this.imageChangedEvent.target as HTMLInputElement;
      const file: File = target.files![0];
      this.imageCropped.emit(file);
    }
  }
}
