import {Component, inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {isEmpty} from 'rxjs';

interface LabelInputFormRegistration {
    id: string;
    type_i: string;
    placeholder: string;
}

interface RequestRegistration {
  login: string;
  password: string;
  email: string;
  operation: string;
}

@Component({
  selector: 'app-registration-form',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css'
})

export class RegistrationForm {
  protected labelsInputs: LabelInputFormRegistration[] = [
      {id: "login", type_i: "text", placeholder: "Логин",},
      {id: "email", type_i: "email", placeholder: "E-mail",},
      {id: "password", type_i: "password", placeholder: "Пароль",},
      {id: "password_confirmation", type_i: "password", placeholder: "Подтвердите пароль",},
  ];

  constructor(private titleService: Title) {
      this.titleService.setTitle("Registration");
  }

  private http = inject(HttpClient);
  private router: Router = inject(Router);
  protected form: FormGroup = new FormGroup({
    login: new FormControl('', [
      Validators.minLength(2),
      Validators.required,
      Validators.pattern('^[a-zA-Z][a-zA-Z0-9_-]+$'),
      Validators.maxLength(30)
    ]),
    email: new FormControl('', [
      Validators.email,
      Validators.required,
      Validators.minLength(2),
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    password: new FormControl('', [
      Validators.minLength(2),
      Validators.required,
      Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).+$'),
      Validators.maxLength(32)
    ]),
    password_confirmation: new FormControl(null, [
      Validators.minLength(2),
      Validators.required,
      Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).+$'),
      Validators.maxLength(32)
    ])
  });

  set login(text: string) {
    this.form.reset({login: text});
  }

  set email(text: string) {
    this.form.setValue({email: text});
  }

  set password(text: string) {
    this.form.setValue({password: text});
  }

  set password_confirmation(text: string) {
    this.form.setValue({password_confirmation: text});
  }

  protected onSubmit(checkbox: string): void {
    console.log(this.form.value, this.form.status);

    if (document.querySelector(checkbox)?.getElementsByTagName("input")[0]?.checked &&
        this.form.status === "VALID") {
      if (this.form.get("password")?.value !== this.form.get("password_confirmation")?.value) {
        alert("Passwords don't match");
        return;
      }

      console.log("registration form submitted");
      this.router.navigate(['/change/login']).then();

      let data: RequestRegistration = {
        login: this.form.value.login,
        password: this.form.value.password,
        email: this.form.value.email,
        operation: "reg",
      };

      this.http.post<RequestRegistration>("/api/create/user", data)
        .subscribe(config => {
          console.log('Updated config:', config);
      });
      return;
    }

    // описать в каком поле была ошибка
  }
}
