import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CatalogueService } from '../_services/catalogue-user.service';

import { checkPasswords } from '../_utils/form.utils';

import { ResetPasswordConfirmation } from '../_models/models';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  public form = new FormGroup({});

  constructor(
    private readonly catalogueService: CatalogueService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      passwordGroup: this.formBuilder.group(
        {
          password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
          passwordConfirm: ['', [Validators.required]],
        },
        { validator: checkPasswords },
      ),
    });
  }

  get f(): any {
    return this.form.controls;
  }

  public onSubmitNewPassword(): void {
    this.catalogueService.resetPassordConfirmation({
      password: this.form.controls['passwordGroup'].value.password,
      token: this.route.snapshot.paramMap.get('token'),
    } as ResetPasswordConfirmation);
  }
}
