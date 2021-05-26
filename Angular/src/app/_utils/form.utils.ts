import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { sha256 } from 'js-sha256';
import { PasswordValidation, SiteValidation, SITES } from './../_models/models';

export function checkPasswords(group: FormGroup): PasswordValidation {
  const password = group.get('password').value;
  const passwordConfirm = group.get('passwordConfirm').value;
  return password === passwordConfirm ? null : { notSame: true };
}

export function checkDefaultSite(group: FormGroup): SiteValidation {
  const site = group.get('defaultSite').value;
  return Object.values(SITES).indexOf(site) >= 0 ? null : { notExisting: true };
}

export function getImageFromArrayBuffer(data: ArrayBuffer, sanitizer: DomSanitizer): SafeUrl {
  let TYPED_ARRAY = new Uint8Array(data);
  const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, '');
  let base64String = btoa(STRING_CHAR);
  return sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${base64String}`);
}

export function getSha256ForFile(file: File, callback: { (str: string): void }): void {
  let hash: string;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    hash = sha256.hex(e.target.result);
    callback(hash);
  };
  reader.readAsArrayBuffer(file);
}

export function readPictureUrl(event: any, translate: TranslateService): string {
  if (checkFileAvailability(event)) {
    if (checkFileExtension(event.target.files[0])) {
      isFileTooSmall(event.target.files[0].size);
      isFileTooLarge(event.target.files[0].size);
    } else {
      return translate.instant('file.wrongExtension');
    }
  } else {
    return translate.instant('file.noFile');
  }
}

function checkFileExtension(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif';
}

function checkFileAvailability(event: any): boolean {
  return event.target.files && event.target.files[0];
}

function isFileTooSmall(file: File): string {
  if (file.size < 5120) {
    return this.translate.instant('file.tooSmallImage');
  }
}

function isFileTooLarge(file: File): string {
  if (file.size > 15728640) {
    return this.translate.instant('file.tooLargeImage');
  }
}

export function readFileUrl(event: any, translate: TranslateService): string {
  if (event.target.files && event.target.files[0]) {
    if (event.target.files[0].size < 52428.8) {
      return translate.instant('file.tooSmallFile');
    }
    if (event.target.files[0].size > 15728640) {
      return translate.instant('file.tooLargeFile');
    }
  } else {
    return translate.instant('file.noFile');
  }
}

export function generateFileName(userName: string): string {
  return `${userName.trim().toLowerCase().replace(' ', '_')}.jpeg`;
}

export function capitalizeFirstLetter(string: string): string {
  let toLowerCase = string.trim().toLowerCase();
  return toLowerCase.charAt(0).toUpperCase() + toLowerCase.slice(1);
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
