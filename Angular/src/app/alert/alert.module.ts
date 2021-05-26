import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from './component/alert.component';

@NgModule({
  imports: [BrowserModule, CommonModule, TranslateModule],
  declarations: [AlertComponent],
  exports: [AlertComponent, TranslateModule],
})
export class AlertModule {}
