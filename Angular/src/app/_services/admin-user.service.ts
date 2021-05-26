import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import decode from 'jwt-decode';
import { AlertService } from '../alert/service/alert.service';
import { StorageService } from './local-storage.service';
import { FetchAllUsersResponse, UpdateUserProfile, UpdateResponse, CatalogueRequest, BASE_URL } from './../_models/models';

@Injectable()
export class RoleGuardService implements HttpInterceptor, CanActivate {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storageService.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return next.handle(
        req.clone({
          headers: token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers.set('Authorization', `Bearer `),
        }),
      );
    } else {
      return next.handle(req);
    }
  }

  constructor(
    private readonly alerts: AlertService,
    private readonly http: HttpClient,
    private readonly jwtHelper: JwtHelperService,
    private readonly storageService: StorageService,
    private readonly router: Router,
    private readonly translate: TranslateService,
  ) {}

  public canActivate(): boolean {
    const token = this.storageService.getItem('token');
    if (this.jwtHelper.isTokenExpired(token) || !decode(token).is_admin) {
      this.alerts.warn(this.translate.instant('user.accessDenied'));
      return false;
    }
    return true;
  }

  public fetchAllUsers(): Observable<FetchAllUsersResponse> {
    return this.http.get<FetchAllUsersResponse>(`${BASE_URL}/user/list`);
  }

  public updateUser(userData: UpdateUserProfile): void {
    this.http.put<UpdateResponse>(`${BASE_URL}/user/${userData.id}`, userData).subscribe(
      (response: UpdateResponse) => {
        this.router.navigate(['/admin']);
        setTimeout(() => {
          this.alerts.success(response.message);
        }, 2000);
      },
      (error: HttpErrorResponse) => {
        this.alerts.clear();
        this.alerts.error(error.error);
      },
    );
  }

  public deleteUser(id: number): Observable<string> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text' as 'json',
    };
    return this.http.delete<string>(`${BASE_URL}/user/${id}`, options);
  }

  public createItem(itemData: CatalogueRequest): Observable<string> {
    return this.http.post<string>(`${BASE_URL}/catalogue`, itemData, {
      responseType: 'text' as 'json',
    });
  }

  public updateItem(itemData: CatalogueRequest): Observable<string> {
    return this.http.put<string>(`${BASE_URL}/catalogue/items/${itemData.id}`, itemData, {
      responseType: 'text' as 'json',
    });
  }

  public deleteItem(id: number): Observable<string> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text' as 'json',
    };
    return this.http.delete<string>(`${BASE_URL}/catalogue/items/${id}`, options);
  }

  public uploadAttachment(attachment: File): Observable<string> {
    let formData: FormData = new FormData();
    formData.append('attachment', attachment, attachment.name);
    const options = {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
      responseType: 'text' as 'json',
    };
    return this.http.post<string>(`${BASE_URL}/catalogue/attachment`, formData, options);
  }
}
