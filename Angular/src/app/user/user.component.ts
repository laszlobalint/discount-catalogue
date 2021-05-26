import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { AlertService } from '../alert/service/alert.service';
import { CatalogueService } from '../_services/catalogue-user.service';
import { RoleGuardService } from '../_services/admin-user.service';

import { checkPasswords, checkDefaultSite, getImageFromArrayBuffer, generateFileName, readPictureUrl } from '../_utils/form.utils';

import { ActiveUserInfo, LoginRequest, SITES, RegisterRequest, UpdateUserProfile } from '../_models/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styles: [
    `
      #profile-picture {
        border-radius: 9999px;
        display: block;
        height: 170px;
      }
      .remove-button {
        color: red;
      }
    `,
  ],
})
export class UserComponent implements OnInit {
  public keys = Object.keys;
  public sites = SITES;
  public user?: ActiveUserInfo;
  public form = new FormGroup({});
  public userSubscription?: Subscription;

  public readonly DEFAULT_PICTURE_URL = '../assets/profile-avatar.jpg';
  public fileToUpload?: Blob;
  public imageChangedEvent?: Event;
  public isValidPicture = false;
  public pictureForm?: FormGroup;
  public showImageCropper = false;

  constructor(
    private readonly adminService: RoleGuardService,
    private readonly alertService: AlertService,
    private readonly catalogueService: CatalogueService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    if (this.catalogueService.user && !this.route.snapshot.queryParamMap.get('id')) {
      this.userSubscription = this.catalogueService.user.subscribe((user) => {
        this.user = {
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin ? true : false,
          defaultSite: this.sites[user.defaultSite.toString()] ? this.sites[user.defaultSite] : this.sites['5'],
        };
      });
      this.fetchProfilePicture();
      this.alertService.success(this.translate.instant('user.welcome') + this.user.name);
    } else {
      this.user = {
        name: this.route.snapshot.queryParamMap.get('name'),
        email: this.route.snapshot.queryParamMap.get('email'),
        isAdmin: this.route.snapshot.queryParamMap.get('is_admin') ? true : false,
        defaultSite: this.sites[this.route.snapshot.queryParamMap.get('defaultSite').toString()]
          ? this.sites[this.route.snapshot.queryParamMap.get('defaultSite')]
          : this.sites['5'],
        id: Number(this.route.snapshot.queryParamMap.get('id')),
      };
    }
    this.initForms();
  }

  get f(): any {
    return this.form.controls;
  }

  public initForms(): void {
    if (!this.user.id) {
      this.form = this.formBuilder.group(
        {
          name: [this.user.name ? this.user.name : '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
          email: [this.user.email ? this.user.email : '', [Validators.required, Validators.email]],
          defaultSite: [this.user.defaultSite ? this.user.defaultSite : '', [Validators.required]],
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

      this.pictureForm = new FormGroup({
        profilePicture: new FormControl([[]]),
      });
    } else {
      this.form = this.formBuilder.group(
        {
          name: [this.user.name ? this.user.name : '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
          email: [this.user.email ? this.user.email : '', [Validators.required, Validators.email]],
          defaultSite: [this.user.defaultSite ? this.user.defaultSite : '', [Validators.required]],
        },
        { validator: checkDefaultSite },
      );
    }
  }

  public onSubmitUpdateProfile(): void {
    if (!this.user.id) {
      const userUpdateProfileData: RegisterRequest = {
        name: this.form.value.name,
        email: this.form.value.email,
        password: this.form.controls['passwordGroup'].value.password,
        defaultSite: this.form.value.defaultSite,
      };
      this.catalogueService.update(userUpdateProfileData);
    } else {
      const userUpdateProfileData: UpdateUserProfile = {
        id: this.user.id,
        name: this.form.value.name,
        email: this.form.value.email,
        defaultSite: this.form.value.defaultSite,
      };
      this.adminService.updateUser(userUpdateProfileData);
    }
  }

  public isRemovable(): boolean {
    if (
      checkPasswords(<FormGroup>this.form.controls['passwordGroup']) ||
      (this.form.value.email && this.form.value.email.indexOf('@') < 0) ||
      this.form.pristine ||
      (this.form.controls['passwordGroup'].get('password').value && this.form.controls['passwordGroup'].get('password').value.length < 8)
    ) {
      return true;
    } else {
      return false;
    }
  }

  public onDeleteProfile(): void {
    const userProfileDeleteData: LoginRequest = {
      email: this.form.value.email,
      password: this.form.controls['passwordGroup'].value.password,
    };
    this.catalogueService.delete(userProfileDeleteData).subscribe(
      (response: string) => {
        this.router.navigate(['/login']);
        setTimeout(() => {
          this.alertService.success(response);
        }, 2000);
      },
      (error: HttpErrorResponse) => {
        this.router.navigate(['/login']);
        setTimeout(() => {
          this.alertService.error(error.error.text);
        }, 2000);
      },
    );
  }

  public onFileChange(event: any): void {
    this.alertService.clear();
    if (readPictureUrl(event, this.translate)) {
      this.isValidPicture = false;
      this.alertService.warn(readPictureUrl(event, this.translate));
    } else {
      this.isValidPicture = true;
      this.fileToUpload = event.target.files.item(0);
      this.imageChangedEvent = event;
      this.showImageCropper = true;
    }
    window.scroll(0, 0);
  }

  public onImageCropped(file: Blob): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user.profilePicture = e.target.result;
    };
    reader.readAsDataURL(file);
    this.resetPictureVariables();
    this.isValidPicture = true;
    this.fileToUpload = file;
  }

  public onUploadPicture(): void {
    this.catalogueService.modifyProfilePicture(this.fileToUpload, generateFileName(this.user.name)).subscribe(
      (response: string) => {
        this.resetPictureVariables();
        this.fetchProfilePicture();
        this.alertService.success(response);
      },
      (error: HttpErrorResponse) => {
        this.alertService.clear();
        this.alertService.error(error.error);
      },
    );
    window.scroll(0, 0);
  }

  public fetchProfilePicture(): void {
    this.catalogueService.getProfilePicture().subscribe(
      (pictureResponse: ArrayBuffer) => {
        if (pictureResponse.byteLength > 46) {
          this.user.profilePicture = getImageFromArrayBuffer(pictureResponse, this.sanitizer);
        } else {
          this.user.profilePicture = this.DEFAULT_PICTURE_URL;
        }
      },
      (error: HttpErrorResponse) => {
        this.user.profilePicture = this.DEFAULT_PICTURE_URL;
      },
    );
  }

  public onRemovePicture(): void {
    this.catalogueService.modifyProfilePicture(null).subscribe(
      (response: string) => {
        this.resetPictureVariables();
        this.user.profilePicture = this.DEFAULT_PICTURE_URL;
        this.alertService.success(response);
      },
      (error: HttpErrorResponse) => {
        this.alertService.clear();
        this.alertService.error(error.error);
      },
    );
  }

  public resetPictureVariables(): void {
    this.showImageCropper = false;
    this.isValidPicture = false;
    this.fileToUpload = undefined;
    this.pictureForm.reset();
    this.alertService.clear();
  }
}
