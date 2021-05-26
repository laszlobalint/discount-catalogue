import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnApi, GridApi, GridOptions, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../alert';
import { CatalogueService } from '../../_services/catalogue-user.service';
import { RoleGuardService } from '../../_services/admin-user.service';
import { StorageService } from './../../_services/local-storage.service';
import { CATEGORIES, SITES, UserResponse, FetchAllUsersResponse } from './../../_models/models';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  public catalogueForm = new FormGroup({});
  public usersForm = new FormGroup({});
  public readonly keys = Object.keys;
  public readonly categories = CATEGORIES;
  public readonly sites = SITES;
  public users?: UserResponse[];
  public gridApi?: GridApi;
  public columnApi?: ColumnApi;
  public gridUserOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 70,
        onCellClicked: (id: CellClickedEvent): void => {
          this.onDeleteUser(id.value);
        },
        cellRenderer: (id: any): string => {
          return `<img border="0" width="25" src="../../assets/delete_logo.png" alt="Delete logo" /> ${id.value}`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.name')}`,
        field: 'name',
        width: 150,
        onCellClicked: (params: CellClickedEvent): void => {
          const selected = params.api.getSelectedRows()[0];
          this.router.navigate(['/user'], {
            queryParams: {
              id: selected.id,
              name: selected.name,
              email: selected.email,
              isAdmin: selected.is_admin,
              defaultSite: selected.default_site_id,
            },
          });
        },
        cellRenderer: (seller: any): string => {
          return `${'<img border="0" height="30" src="../../assets/edit_logo.jpg" alt="Edit logo" />'} ${seller.value}`;
        },
      },
      {
        headerName: `${this.translate.instant('grid.email')}`,
        field: 'email',
        width: 200,
      },
      {
        headerName: `${this.translate.instant('grid.site')}`,
        field: 'default_site_id',
        width: 100,
        cellRenderer: (default_site_id: any): string => {
          return this.sites[String(default_site_id.value)] ? this.sites[String(default_site_id.value)] : this.sites['5'];
        },
      },
      {
        headerName: `${this.translate.instant('grid.created')}`,
        field: 'created_at',
        cellRenderer: (created_at: any): string => {
          return created_at.value ? new Date(created_at.value).toLocaleDateString() : '';
        },
      },
      {
        headerName: `${this.translate.instant('grid.updated')}`,
        field: 'updated_at',
        cellRenderer: (updated_at: any): string => {
          return updated_at.value ? new Date(updated_at.value).toLocaleDateString() : '';
        },
      },
      {
        headerName: `${this.translate.instant('grid.active')}`,
        field: 'is_active',
        cellRenderer: (is_active: any): string => {
          return is_active.value ? `<p>${this.translate.instant('grid.yes')}</p>` : `<p>${this.translate.instant('grid.no')}</p>`;
        },
      },
      {
        headerName: 'Admin',
        field: 'is_admin',
        cellRenderer: (is_admin: any): string => {
          return is_admin.value ? `<p>${this.translate.instant('grid.yes')}</p>` : `<p>${this.translate.instant('grid.no')}</p>`;
        },
      },
    ],
    rowData: [],
    rowHeight: 30,
    defaultColDef: {
      editable: true,
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
    private readonly adminService: RoleGuardService,
    private readonly alertService: AlertService,
    private readonly catalogueService: CatalogueService,
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.adminService.fetchAllUsers().subscribe((response: FetchAllUsersResponse) => {
      this.users = response.users.filter((user) => user.email !== JSON.parse(this.storageService.getItem('user')).email);
      this.gridUserOptions.rowData = this.users;
    });
  }

  public onDeleteUser(id: number): void {
    this.adminService.deleteUser(id).subscribe(
      (response: string) => {
        this.alertService.success(response);
        this.users = this.users.filter((user) => {
          return user.id !== id;
        });
        this.gridUserOptions.api.setRowData(this.users);
        window.scroll(0, 0);
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.text);
        window.scroll(0, 0);
      },
      () => {
        if (this.users.length === 0) {
          this.catalogueService.logout();
        }
      },
    );
  }
}
