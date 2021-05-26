import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import decode from 'jwt-decode';

import { AlertService } from '../alert/service/alert.service';
import { StorageService } from './local-storage.service';

import {
  ActiveUserInfo,
  CatalogueSearchParams,
  FilterResult,
  LoginRequest,
  LoginResponse,
  UpdateResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmation,
  BASE_URL,
} from '../_models/models';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CatalogueService implements HttpInterceptor, CanActivate {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req.headers.set('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
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

  public userSubject: Subject<ActiveUserInfo> = new Subject();
  public user?: Observable<ActiveUserInfo>;

  constructor(
    private readonly alerts: AlertService,
    private readonly http: HttpClient,
    private readonly jwtHelper: JwtHelperService,
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly translate: TranslateService,
  ) {
    if (this.storageService.getItem('user')) {
      this.userSubject = new BehaviorSubject<ActiveUserInfo>(JSON.parse(this.storageService.getItem('user')));
      this.user = this.userSubject.asObservable();
    }
  }

  public canActivate(): boolean {
    const token = this.storageService.getItem('token');
    if (this.jwtHelper.isTokenExpired(token)) {
      this.router.navigate(['login']);
      this.alerts.warn(this.translate.instant('user.accessDenied'));
      return false;
    }
    return true;
  }

  public login(loginData: LoginRequest): void {
    this.http.post<LoginResponse>(`${BASE_URL}/login`, loginData).subscribe(
      (response: LoginResponse) => {
        if (response) {
          this.storageService.setItem('token', response.token);
          const tokenPayload = decode(response.token);
          this.storageService.setItem(
            'user',
            JSON.stringify({
              name: tokenPayload.name,
              email: tokenPayload.email,
              isAdmin: tokenPayload.is_admin,
              defaultSite: tokenPayload.default_site_id,
            }),
          );
          this.userSubject = new BehaviorSubject<ActiveUserInfo>(JSON.parse(this.storageService.getItem('user')));
          this.user = this.userSubject.asObservable();
          this.router.navigate(['/']);
        }
      },
      (error: HttpErrorResponse) => {
        this.alerts.clear();
        this.alerts.error(error.error);
      },
    );
  }

  public logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  public resetPasswordRequest(resetPasswordRequest: ResetPasswordRequest): void {
    this.http
      .post<string>(`${BASE_URL}/user/reset-password-with-email`, resetPasswordRequest, { responseType: 'text' as 'json' })
      .subscribe(
        (response: string) => {
          this.alerts.clear();
          this.alerts.success(response);
        },
        (error: HttpErrorResponse) => {
          this.alerts.clear();
          this.alerts.error(error.error);
        },
      );
  }

  public resetPassordConfirmation(resetPasswordConfirmation: ResetPasswordConfirmation): void {
    this.http
      .post<string>(`${BASE_URL}/user/reset-password/${resetPasswordConfirmation.token}`, resetPasswordConfirmation, {
        responseType: 'text' as 'json',
      })
      .subscribe(
        (response: string) => {
          this.alerts.clear();
          this.alerts.success(response + this.translate.instant('reset-password.redirect'));
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 4000);
        },
        (error: HttpErrorResponse) => {
          this.alerts.clear();
          this.alerts.error(error.error);
        },
      );
  }

  public register(registerRequest: RegisterRequest): void {
    this.http
      .post<string>(`${BASE_URL}/register`, registerRequest, {
        responseType: 'text' as 'json',
      })
      .subscribe(
        (response: string) => {
          if (response.indexOf('ID') >= 0) {
            this.router.navigate(['/login']);
            setTimeout(() => {
              this.alerts.clear();
              this.alerts.success(this.translate.instant('register.success'));
            }, 2000);
          }
        },
        (error: HttpErrorResponse) => {
          this.alerts.clear();
          this.alerts.error(error.error);
        },
      );
  }

  public activate(token: string): void {
    this.http
      .get<string>(`${BASE_URL}/user/activation/${token}`, {
        responseType: 'text' as 'json',
      })
      .subscribe(
        (response: string) => {
          this.alerts.success(response);
        },
        (error: HttpErrorResponse) => {
          this.alerts.clear();
          this.alerts.error(error.error);
        },
      );
  }

  public getProfilePicture(): Observable<ArrayBuffer> {
    return this.http.get(`${BASE_URL}/user/picture`, {
      responseType: 'arraybuffer',
    });
  }

  public modifyProfilePicture(fileToUpload: Blob, fileName?: string): Observable<string> {
    if (fileToUpload) {
      let formData: FormData = new FormData();
      formData.append('picture', fileToUpload, fileName);
      return this.http.post<string>(`${BASE_URL}/user/picture`, formData, {
        responseType: 'text' as 'json',
      });
    } else {
      return this.http.post<string>(`${BASE_URL}/user/picture`, null, {
        responseType: 'text' as 'json',
      });
    }
  }

  public update(userData: RegisterRequest): void {
    this.http.put<UpdateResponse>(`${BASE_URL}/user`, userData).subscribe(
      (response: UpdateResponse) => {
        this.router.navigate(['/login']);
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

  public delete(deleteUserData: LoginRequest): Observable<string> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: deleteUserData,
    };
    return this.http.delete<string>(`${BASE_URL}/user`, options);
  }

  public searchCatalogueItems(catalogueSearchParams: CatalogueSearchParams): Observable<FilterResult> {
    return this.http.post<FilterResult>(BASE_URL + `/catalogue/search`, catalogueSearchParams);
  }
}
