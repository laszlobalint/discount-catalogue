import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './_services/local-storage.service';
import { LANGUAGES } from './_models/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public translationLoaded = false;

  constructor(private readonly storageService: StorageService, private readonly translate: TranslateService) {
    const language = storageService.getItem('language');
    const browserLang = translate.getBrowserLang().toUpperCase();
    if (language) {
      translate.use(language).subscribe((res: object) => {
        this.translationLoaded = true;
      });
    } else if (Object.values(LANGUAGES).indexOf(browserLang) > 0) {
      this.setLanguage(browserLang);
    } else {
      this.setLanguage('EN');
    }
  }

  private setLanguage(language: string): void {
    this.storageService.setItem('language', language);
    this.translate.setDefaultLang(language);
    this.translate.use(language).subscribe((res: object) => {
      this.translationLoaded = true;
    });
  }
}
