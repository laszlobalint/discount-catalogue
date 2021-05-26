import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { ColumnApi, GridApi, GridOptions, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import decode from 'jwt-decode';

import { AlertService } from '../alert';
import { CatalogueService } from '../_services/catalogue-user.service';
import { RoleGuardService } from '../_services/admin-user.service';
import { StorageService } from '../_services/local-storage.service';
import { HttpErrorResponse } from '@angular/common/http';

import { CatalogueResponse, CatalogueSearchParams, CATEGORIES, FilterResult, SITES } from '../_models/models';

import { iconChooser } from '../_utils/icon-chooser.util';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogueComponent implements OnInit {
  public form = new FormGroup({});
  public searchForm = new FormGroup({});

  public keys = Object.keys;
  public categories = CATEGORIES;
  public sites = SITES;

  public address?: string;
  public catalogueSearchResult?: CatalogueResponse[];
  public isMapDisplayed?: boolean;

  public gridApi?: GridApi;
  public columnApi?: ColumnApi;
  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 70,
        hide: !decode(this.storageService.getItem('token')).is_admin,
        onCellClicked: (id: CellClickedEvent): void => {
          this.onDeleteCatalogueItem(id.value);
        },
        cellRenderer: (id: any): string => {
          return `<img border="0" height="30" src="../../assets/delete_logo.png" alt="Delete logo" /> ${id.value}`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.seller')}`,
        field: 'seller',
        onCellClicked: (params: CellClickedEvent): void => {
          if (decode(this.storageService.getItem('token')).is_admin) {
            const selected = params.api.getSelectedRows()[0];
            this.router.navigate(['admin', 'catalogue-management'], {
              queryParams: {
                id: selected.id,
                seller: selected.seller,
                category: selected.category_id,
                site: selected.site_id,
                address: selected.address,
                discountRate: selected.discount_rate,
                validFrom: selected.valid_from,
                validTill: selected.valid_till,
                active: selected.active,
                url: selected.url,
                description: selected.description,
                fileName: selected.attachment_file_name,
                sha256: selected.sha256,
              },
            });
          }
        },
        cellRenderer: (seller: any): string => {
          return `${
            decode(this.storageService.getItem('token')).is_admin
              ? '<img border="0" height="30" src="../../assets/edit_logo.jpg" alt="Edit logo" />'
              : ''
          }
          ${seller.value}`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.site')}`,
        field: 'site_id',
        width: 100,
      },
      {
        headerName: `${this.translate.instant('grid.discount')}`,
        field: 'discount_rate',
        width: 80,
      },
      {
        headerName: `${this.translate.instant('grid.address')}`,
        field: 'address',
        onCellClicked: (address: CellClickedEvent): void => {
          this.address = address.value;
          this.isMapDisplayed = true;
        },
      },
      {
        headerName: `${this.translate.instant('grid.category')}`,
        field: 'category_id',
        width: 110,
        autoHeight: true,
        cellRenderer: (category_id: any): string => {
          return `<img height="30px" src="../../assets/category-icons/${iconChooser(category_id.value)}" alt="Category logo" /> ${
            category_id.value
          }`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.validTill')}`,
        field: 'valid_till',
        width: 100,
        cellRenderer: (valid_till: any): string => {
          return valid_till.value ? new Date(valid_till.value).toLocaleDateString() : '';
        },
      },
      {
        headerName: `${this.translate.instant('grid.website')}`,
        field: 'url',
        cellRenderer: (url: any): string => {
          return `<a href=http://${url.value} target="_blank">${url.value}</a>`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.attachment')}`,
        field: 'attachment_file_name',
        cellRenderer: (attachment_file_name: any): string => {
          return attachment_file_name.value
            ? `<a href="http://localhost:3000/attachments/${attachment_file_name.value}" target="_blank"}><img height="30px" src="../../assets/attachment_logo.png" 
            alt="Attachment logo" />`
            : '';
        },
      },
    ],
    rowData: [],
    rowHeight: 30,
    defaultColDef: {
      filter: true,
      sortable: true,
      suppressSizeToFit: false,
    },
    rowSelection: 'single',
    pagination: true,
    domLayout: 'autoHeight',
    onGridReady(params: GridReadyEvent): void {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.gridApi.sizeColumnsToFit();
      window.onresize = () => {
        this.gridApi.sizeColumnsToFit();
      };
    },
  };

  constructor(
    public readonly adminService: RoleGuardService,
    private readonly alertService: AlertService,
    private readonly catalogueService: CatalogueService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly storageService: StorageService,
    public readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      siteIds: [[]],
      categoryIds: [[]],
    });
    this.searchForm = this.formBuilder.group({
      seller: [''],
    });
    this.onSubmitSearch();
  }

  public onSubmitSearch(): void {
    const filterParams = {
      siteIds: this.form.controls['siteIds'].value,
      categoryIds: this.form.controls['categoryIds'].value,
    };
    this.catalogueService.searchCatalogueItems(filterParams as CatalogueSearchParams).subscribe((result: FilterResult) => {
      this.catalogueSearchResult = result.filterResult.filter((item) => item.active);
      this.catalogueSearchResult.sort((a, b) => a.id - b.id);
      if (this.gridOptions.api) {
        this.gridOptions.api.setRowData(this.catalogueSearchResult);
        setTimeout(() => {
          this.gridOptions.api.redrawRows();
        }, 0);
      } else {
        this.gridOptions.rowData = this.catalogueSearchResult;
      }
    });
    this.alertService.clear();
    this.alertService.success(this.translate.instant('catalogue-management.mapInfo'));
  }

  public onFilterResults(): void {
    if (this.searchForm) {
      this.gridOptions.api.setRowData(
        this.catalogueSearchResult.filter(
          (item) => item.seller.toLowerCase().indexOf(this.searchForm.controls['seller'].value.toLowerCase()) >= 0,
        ),
      );
    }
  }

  public onCloseMap(): void {
    this.address = undefined;
    this.isMapDisplayed = false;
  }

  public onDeleteCatalogueItem(id: number): void {
    this.adminService.deleteItem(id).subscribe(
      (response: string) => {
        this.alertService.success(response);
        this.catalogueSearchResult = this.catalogueSearchResult.filter((item) => {
          return item.id !== id;
        });
        this.gridOptions.api.setRowData(this.catalogueSearchResult);
        window.scroll(0, 0);
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.text);
        window.scroll(0, 0);
      },
    );
  }
}
