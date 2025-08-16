import { Routes } from '@angular/router';
import {Home} from './main-app/home/home';
import {LoginForm} from './main-app/login-form/login-form';
import {RegistrationForm} from './main-app/registration-form/registration-form';
import {UserProfile} from './main-app/user-profile/user-profile';
import {CurrencyExchangerProjectFrontendComponent} from './main-app/main-app';
import {PageError404} from './general-pages/page-404/page-404';

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
                pathMatch: "full",
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
