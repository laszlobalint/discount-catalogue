import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CatalogueService } from '../_services/catalogue-user.service';
import { checkPasswords, checkDefaultSite } from '../_utils/form.utils';

import { SITES, RegisterRequest } from '../_models/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  public form = new FormGroup({});
  public readonly keys = Object.keys;
  public readonly sites = SITES;

  constructor(private readonly catalogueService: CatalogueService, private readonly formBuilder: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        defaultSite: ['', [Validators.required]],
        passwordGroup: this.formBuilder.group(
          {
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
            passwordConfirm: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
          },
          { validator: checkPasswords },
        ),
      },
      { validator: checkDefaultSite },
    );
  }

  get f(): any {
    return this.form.controls;
  }

  public onSubmitRegistration(): void {
    const userRegistrationData: RegisterRequest = {
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.controls['passwordGroup'].value.password,
      defaultSite: this.form.value.defaultSite,
    };
    this.catalogueService.register(userRegistrationData);
  }
}
