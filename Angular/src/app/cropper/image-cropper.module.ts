import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperModule as CropperModule } from 'ngx-image-cropper';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';

@NgModule({
  declarations: [ImageCropperComponent],
  imports: [BrowserModule, CommonModule, FormsModule, CropperModule, TranslateModule],
  exports: [ImageCropperComponent, TranslateModule],
})
export class ImageCropperModule {}
