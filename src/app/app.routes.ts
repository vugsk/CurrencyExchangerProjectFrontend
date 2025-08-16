import { Routes } from '@angular/router';
import {Home} from './home/home';
import {LoginForm} from './login-form/login-form';
import {RegistrationForm} from './registration-form/registration-form';
import {UserProfile} from './user-profile/user-profile';

export const routes: Routes = [
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
        component: UserProfile
    },
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    }
];
