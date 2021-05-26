import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../alert/service/alert.service';
import { RoleGuardService } from './../../_services/admin-user.service';
import { capitalizeFirstLetter, getSha256ForFile, readFileUrl } from '../../_utils/form.utils';
import { CatalogueRequest, CATEGORIES, SITES } from './../../_models/models';

@Component({
  selector: 'app-catalogue-management',
  templateUrl: './catalogue-management.component.html',
  styles: [
    `
      .checkbox-1x {
        transform: scale(1.5);
        -webkit-transform: scale(1.5);
      }
      .form-control,
      textarea {
        border-radius: 4px;
        border-top: #8d2a90 solid 2px;
        border-left: #8d2a90 solid 2px;
      }
      label {
        display: block;
      }
    `,
  ],
})
export class CatalogueManagementComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  private readonly URL_REGEX = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  public readonly keys = Object.keys;
  public readonly categories = CATEGORIES;
  public readonly sites = SITES;
  public form = new FormGroup({});
  public editableCatalogueItem?: CatalogueRequest;
  public activateDiscount = false;

  constructor(
    private readonly adminService: RoleGuardService,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly ngZone: NgZone,
    public readonly translate: TranslateService,
    public readonly route: ActivatedRoute,
    public readonly router: Router,
  ) {}

  public ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('id')) {
      this.editableCatalogueItem = this.queryParamsToFormModel();
    }
    this.initForm();
  }

  public initForm(): void {
    this.form = this.formBuilder.group({
      seller: [
        this.editableCatalogueItem && this.editableCatalogueItem.seller ? this.editableCatalogueItem.seller : '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      category: [
        this.editableCatalogueItem && this.editableCatalogueItem.category ? this.editableCatalogueItem.category : '',
        [Validators.required],
      ],
      site: [this.editableCatalogueItem && this.editableCatalogueItem.site ? this.editableCatalogueItem.site : '', [Validators.required]],
      address: [
        this.editableCatalogueItem && this.editableCatalogueItem.address ? this.editableCatalogueItem.address : '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      discountRate: [
        this.editableCatalogueItem && this.editableCatalogueItem.discountRate ? this.editableCatalogueItem.discountRate : '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(10)],
      ],
      validFrom: [
        this.editableCatalogueItem && this.editableCatalogueItem.validFrom ? this.editableCatalogueItem.validFrom : '',
        [Validators.required],
      ],
      validTill: [this.editableCatalogueItem && this.editableCatalogueItem.validTill ? this.editableCatalogueItem.validTill : ''],
      active: [
        this.editableCatalogueItem && this.editableCatalogueItem.active ? (this.activateDiscount = true) : (this.activateDiscount = false),
        [Validators.required],
      ],
      url: [
        this.editableCatalogueItem && this.editableCatalogueItem.url ? this.editableCatalogueItem.url : '',
        [Validators.required, Validators.pattern(this.URL_REGEX)],
      ],
      description: [
        this.editableCatalogueItem && this.editableCatalogueItem.description ? this.editableCatalogueItem.description : '',
        [Validators.minLength(1), Validators.maxLength(200)],
      ],
      attachment: [''],
    });
  }

  get f(): any {
    return this.form.controls;
  }

  public onAddNewCatalogueItem(): void {
    this.form.get('active').setValue(this.activateDiscount);
    if (this.form.get('attachment').value && this.form.get('attachment').value.size > 0) {
      this.adminService.uploadAttachment(this.form.get('attachment').value).subscribe(
        (response: string) => {
          if (response.indexOf('saved') >= 0) {
            this.adminService
              .createItem({
                ...this.form.value,
                fileName: this.form.get('attachment').value ? this.form.get('attachment').value.name : undefined,
              })
              .subscribe(
                (response: string) => {
                  this.alertService.success(response);
                  this.form.reset();
                  window.scroll(0, 0);
                },
                (error: HttpErrorResponse) => {
                  this.alertService.error(error.error.text);
                },
              );
          }
        },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.text);
        },
      );
    } else {
      this.adminService.createItem(this.form.value).subscribe(
        (response: string) => {
          this.alertService.success(response);
          this.form.reset();
          window.scroll(0, 0);
        },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.text);
        },
      );
    }
  }

  public onUpdateCatalogueItem(): void {
    this.form.get('active').setValue(this.activateDiscount);
    if (this.form.get('attachment').value && this.form.get('attachment').value.size > 0) {
      this.adminService.uploadAttachment(this.form.get('attachment').value).subscribe(
        (response: string) => {
          if (response.indexOf('saved') >= 0) {
            this.adminService
              .updateItem({
                ...this.form.value,
                fileName: this.form.get('attachment').value ? this.form.get('attachment').value.name : undefined,
                id: this.editableCatalogueItem.id,
              })
              .subscribe(
                (response: string) => {
                  this.alertService.success(response);
                  this.form.reset();
                  window.scroll(0, 0);
                },
                (error: HttpErrorResponse) => {
                  this.alertService.error(error.error.text);
                },
              );
          }
        },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.text);
        },
      );
    } else {
      this.adminService
        .updateItem({
          ...this.form.value,
          id: this.editableCatalogueItem.id,
        })
        .subscribe(
          (response: string) => {
            this.router.navigate(['admin']);
            this.form.reset();
            setTimeout(() => {
              this.alertService.success(response);
            }, 2000);
          },
          (error: HttpErrorResponse) => {
            this.alertService.error(error.error.text);
          },
        );
    }
  }

  public queryParamsToFormModel(): CatalogueRequest {
    return {
      id: Number(this.route.snapshot.queryParamMap.get('id')),
      seller: this.route.snapshot.queryParamMap.get('seller'),
      category: this.route.snapshot.queryParamMap.get('category').trim(),
      site: capitalizeFirstLetter(this.route.snapshot.queryParamMap.get('site')),
      address: this.route.snapshot.queryParamMap.get('address'),
      discountRate: this.route.snapshot.queryParamMap.get('discountRate'),
      validFrom: this.route.snapshot.queryParamMap.get('validFrom')
        ? new Date(this.route.snapshot.queryParamMap.get('validFrom'))
        : undefined,
      validTill: this.route.snapshot.queryParamMap.get('valid_till')
        ? new Date(this.route.snapshot.queryParamMap.get('validTill'))
        : undefined,
      active: Number(this.route.snapshot.queryParamMap.get('active')),
      url: this.route.snapshot.queryParamMap.get('url'),
      description: this.route.snapshot.queryParamMap.get('description'),
      fileName: this.route.snapshot.queryParamMap.get('fileName'),
      sha256: this.route.snapshot.queryParamMap.get('sha256'),
    };
  }

  public onFileChange(event: any): void {
    this.alertService.clear();
    if (event.target.files.item(0)) {
      getSha256ForFile(event.target.files.item(0), (hash: string) =>
        this.ngZone.run(() => {
          if (this.editableCatalogueItem && this.editableCatalogueItem.sha256 === hash) {
            window.scroll(0, 0);
            this.alertService.warn(this.translate.instant('catalogue-management.sameFile'));
          } else {
            if (readFileUrl(event, this.translate)) {
              window.scroll(0, 0);
              this.alertService.warn(readFileUrl(event, this.translate));
              this.fileInput.nativeElement.value = null;
            } else {
              this.form.get('attachment').setValue(event.target.files.item(0));
            }
          }
        }),
      );
    }
  }
}
