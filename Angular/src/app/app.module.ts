import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AgGridModule } from 'ag-grid-angular';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { AlertModule } from './alert/alert.module';
import { ImageCropperModule } from './cropper/image-cropper.module';
import { RoutingModule } from './routing.module';
import { HttpLoaderFactory } from './_utils/form.utils';
import { CatalogueService } from './_services/catalogue-user.service';
import { StorageService } from './_services/local-storage.service';
import { RoleGuardService } from './_services/admin-user.service';

import { AdminComponent } from './admin/admin.component';
import { AppComponent } from './app.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { CatalogueManagementComponent } from './admin/catalogue-management/catalogue-management.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { UserComponent } from './user/user.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    CatalogueComponent,
    LoginComponent,
    MapComponent,
    UserComponent,
    RegisterComponent,
    ResetPasswordComponent,
    AdminComponent,
    UserManagementComponent,
    CatalogueManagementComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RoutingModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    ReactiveFormsModule,
    AgGridModule.withComponents(null),
    FormsModule,
    AlertModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    ImageCropperModule,
    CarouselModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    TranslateService,
    CatalogueService,
    RoleGuardService,
    StorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CatalogueService,
      multi: true,
    },
    [{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService],
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
