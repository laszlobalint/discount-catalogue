import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogueService as AuthGuard } from './_services/catalogue-user.service';
import { RoleGuardService as RoleGuard } from './_services/admin-user.service';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './password/reset-password.component';
import { AdminComponent } from './admin/admin.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { CatalogueManagementComponent } from './admin/catalogue-management/catalogue-management.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    children: [
      { path: 'user-management', component: UserManagementComponent },
      { path: 'catalogue-management', component: CatalogueManagementComponent },
    ],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'catalogue',
    component: CatalogueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'user/reset-password/:token',
    component: ResetPasswordComponent,
  },
  {
    path: 'user/activation/:token',
    component: LoginComponent,
  },
  {
    path: '',
    component: HomeComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }), TranslateModule],
  exports: [RouterModule, TranslateModule],
})
export class RoutingModule {}
