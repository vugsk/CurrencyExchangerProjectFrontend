import {CanActivateFn, Router, Routes} from '@angular/router';
import {Home} from './main-app/home/home';
import {LoginForm} from './main-app/login-form/login-form';
import {RegistrationForm} from './main-app/registration-form/registration-form';
import {CurrencyExchangerProjectFrontendComponent} from './main-app/main-app';
import {PageError404} from './general-pages/page-404/page-404';
import {inject} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {UserProfile} from './main-app/user-profile/user-profile';
import {catchError, map, of, throwError} from 'rxjs';

export const autoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const http = inject(HttpClient);
  return http.post('/api/user', {id:""}, {
    params: {
      permission_to_enter: true,
    },
    reportProgress: true,
    withCredentials: true,
    observe: "body",
    credentials: 'same-origin',
    mode: 'cors',
    responseType: 'text'
  }).pipe(
    map((res) => {
      if (res == "ok") {
        console.log("fdff", res);
        return true;
      }
      return false;
    }),
    catchError(async () => {
      return router.navigate(['/change/login']).then();
    })
  );
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
              //loadComponent: () => import("./main-app/user-profile/user-profile").then(),
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
        path: "**",
        component: PageError404,
        pathMatch: "full"
    }
];
