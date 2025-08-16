import {Component, inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

interface LabelInputFormRegistration {
    id: string;
    type_i: string;
    placeholder: string;
}

@Component({
  selector: 'app-registration-form',
  imports: [],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css'
})

export class RegistrationForm {
    protected labelsInputs: LabelInputFormRegistration[] = [
        {id: "login-input", type_i: "text", placeholder: "Логин",},
        {id: "email-input", type_i: "email", placeholder: "E-mail",},
        {id: "password-input", type_i: "password", placeholder: "Пароль",},
        {id: "password-input-confirmation", type_i: "password", placeholder: "Подтвердите пароль",},
    ];

    constructor(private titleService: Title) {
        this.titleService.setTitle("Registration");
    }

    private router: Router = inject(Router);
    protected registrationProfileUser(): void {
        this.router.navigate(['change/login']).then();
    }
}
