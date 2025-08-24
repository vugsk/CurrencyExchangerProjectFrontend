import {CanActivateFn, Router, Routes, UrlTree} from '@angular/router';
import {Home} from './main-app/home/home';
import {LoginForm} from './main-app/login-form/login-form';
import {RegistrationForm} from './main-app/registration-form/registration-form';
import {CurrencyExchangerProjectFrontendComponent} from './main-app/main-app';
import {ErrorPage} from './general-pages/page-error/page-error';
import {inject} from '@angular/core';
import {UserProfile} from './main-app/user-profile/user-profile';
import {AuthService} from './services/auth_service/AuthService';

const autoGuard: CanActivateFn = (): boolean | UrlTree => {
  let kl: boolean | UrlTree = true;
  let router: Router = inject(Router);
  inject(AuthService).isLoggedIn$.subscribe((status: boolean): void => {
    kl = (status ? status : router.createUrlTree(['/change/login']));
  });
  return kl;
};

export const routes: Routes = [
  {
      path: "change",
      component: CurrencyExchangerProjectFrontendComponent,
      children: [
          {
              path: "home",
              component: Home,
              pathMatch: "full",
          },
          {
              path: "login",
              component: LoginForm,
              pathMatch: "full",
          },
          {
              path: "registration",
              component: RegistrationForm,
              pathMatch: "full",
          },
          {
            path: "profile/:id",
            component: UserProfile,
            canActivate: [autoGuard],
          },
          {
              path: "",
              redirectTo: "home",
              pathMatch: "full",
          }
      ]
  },
  {
      path: "admin-panel",
      children: []
  },
  {
      path: "",
      redirectTo: "change",
      pathMatch: "full",
  },
  {
    path: "errors/:page",
    component: ErrorPage,
    pathMatch: "full",
  }
];
