import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../_services/catalogue-user.service';
import { StorageService } from '../_services/local-storage.service';
import { LANGUAGES } from '../_models/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  public readonly keys = Object.keys;
  public readonly languages = LANGUAGES;
  public isLoggedIn = false;
  public isAdmin = false;
  public selectedLanguage = this.languages[1];
  public iconUrl = `../assets/${this.selectedLanguage}.png`;

  constructor(
    private readonly catalogueService: CatalogueService,
    private readonly storageService: StorageService,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.storageService.watchStorage().subscribe((data: string) => {
      this.storageService.getItem('user') ? (this.isLoggedIn = true) : (this.isLoggedIn = false);
      if (this.storageService.getItem('user')) {
        JSON.parse(this.storageService.getItem('user')).isAdmin ? (this.isAdmin = true) : (this.isAdmin = false);
      }
    });
    this.storageService.getItem('user') ? (this.isLoggedIn = true) : (this.isLoggedIn = false);

    if (this.storageService.getItem('user')) {
      JSON.parse(this.storageService.getItem('user')).isAdmin ? (this.isAdmin = true) : (this.isAdmin = false);
    }
    if (this.storageService.getItem('language')) {
      this.useLanguage(this.storageService.getItem('language'));
    }
  }

  public useLanguage(language: string): void {
    this.storageService.setItem('language', language);
    this.selectedLanguage = language;
    this.iconUrl = `../assets/${language}.png`;
    this.translate.use(language);
  }

  public onLogout(): void {
    this.catalogueService.logout();
  }

  public isUrlParamsEmpty(): boolean {
    return this.route.snapshot.queryParamMap.get('id') ? false : true;
  }
}
