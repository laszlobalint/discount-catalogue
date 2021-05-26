import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../_services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
    `
      .carousel-item {
        font: 40px bold;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  public userName?: string;
  public welcomeTexts?: string[];

  constructor(private readonly storageService: StorageService, private readonly translate: TranslateService) {}

  public ngOnInit(): void {
    this.storageService.getItem('user')
      ? (this.userName = JSON.parse(this.storageService.getItem('user')).name)
      : (this.userName = this.translate.instant('login.guest'));
    this.welcomeTexts = [
      this.translate.instant('user.welcome') + this.userName,
      this.translate.instant('user-info.info-one'),
      this.translate.instant('user-info.info-two'),
      this.translate.instant('user-info.info-three'),
    ];
  }
}
