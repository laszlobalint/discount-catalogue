import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../alert/service/alert.service';
import { CatalogueService } from '../_services/catalogue-user.service';
import { StorageService } from '../_services/local-storage.service';
import { LoginRequest, ResetPasswordRequest } from '../_models/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  public form = new FormGroup({});

  constructor(
    private readonly alerts: AlertService,
    private readonly catalogueService: CatalogueService,
    private readonly formBuilder: FormBuilder,
    private readonly storageService: StorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.storageService.clear();
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    });
    this.router.url.toString().indexOf('activation') >= 0
      ? this.catalogueService.activate(this.route.snapshot.paramMap.get('token'))
      : this.alerts.info(this.translate.instant('login.loginForm'));
  }

  get f(): any {
    return this.form.controls;
  }

  public onSubmitLoginInfo(): void {
    this.catalogueService.login(this.form.value as LoginRequest);
  }

  public onRequestForPasswordReset(): void {
    this.catalogueService.resetPasswordRequest({
      email: this.form.controls['email'].value,
    } as ResetPasswordRequest);
  }
}
