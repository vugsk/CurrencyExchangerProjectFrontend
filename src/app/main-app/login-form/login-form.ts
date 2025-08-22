import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {
  AbstractControl,
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, debounceTime, distinctUntilChanged, Observable, Subject, takeUntil, throwError} from 'rxjs';
import {NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../services/AuthService';

const error_msg: {[key: string]: string} = {
  minlength: "слишком короткий ",
  maxlength: "слишком длинный ",
  required: "поле не может быть пустым. ",
};

interface LoginResponses {
  login: string;
  email: string;
  password: string;
  operation: string;
}

interface ErrorLoginResponses {
  message: string;
  code: ErrorCodeType;
}

interface UserData {
  name: string;
  id: string;
}

interface SuccessLoginResponses {
  user: UserData;
  message: string;
  time: string;
}

enum ErrorCodeType {
  PASSWORD_NOT_FOUND = 'PASSWORD_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})

export class LoginForm implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  protected form: FormGroup;
  constructor(private titleService: Title, private router: Router, private http: HttpClient, private authService: AuthService) {
    this.form = new FormGroup({
      login_or_email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(24)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(24)
      ]),
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Login");

    let chekLabelOnCorrection = async (col: AbstractControl<string, any> | null, id: string): Promise<void> => {
      col?.statusChanges?.pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      ).subscribe((status: FormControlStatus): void => {
        let element_mes_error: HTMLElement | null = document.getElementById(id);
        if (element_mes_error) {
          element_mes_error.parentElement?.querySelector("input")?.classList.add("input-error");
          element_mes_error.style.display = "block";
          switch (status) {
            case "INVALID":
              for (const error in col?.errors) {
                switch (error) {
                  case 'required':
                    element_mes_error.textContent = error_msg[error];
                    break;
                  case 'maxlength':
                  case 'minlength':
                    element_mes_error.textContent = error_msg[error] + ((id: string): string => {
                      switch (id) {
                        case "login-error":
                          return "логин или почта.";
                        case "password-error":
                          return "пароль.";
                        default:
                          return "";
                      }
                    })("login-error");
                    break;
                }
              }
              break;
            case "VALID":
              element_mes_error.parentElement?.querySelector("input")?.classList?.remove("input-error");
              element_mes_error.style.display = "none";
          }
        }
      });
    };

    chekLabelOnCorrection(this.form.get("login_or_email"), "login-error").then();
    chekLabelOnCorrection(this.form.get("password"), "password-error").then();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      const form_value: LoginResponses = {
        email: ((value: string): string =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ? value : "")(this.form.value.login_or_email),
        login: ((value: string): string =>
          /^[a-zA-Z][a-zA-Z0-9_-]+$/.test(value) ? value : "")(this.form.value.login_or_email),
        password: this.form.value.password,
        operation: "login",
      };

      let element_global_error = document.getElementById("global-msg-error");
      if (form_value.email.length <= 0 && form_value.login.length <= 0 && element_global_error) {
        element_global_error.style.display = "block";
        return;
      }
      else if ((form_value.password.length >= 0 || form_value.login.length >= 0) && element_global_error)
        element_global_error.style.display = "none";

      this.http.post('/api/user', form_value, {
        params: {
          data_verification: true,
          login: form_value.login.length > 0,
          email: form_value.email.length > 0,
        },
        reportProgress: true,
        withCredentials: true,
        observe: "response",
        credentials: 'same-origin',
        mode: 'cors'
      }).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse): Observable<never> => {
          switch (error.status) {
            case 500:
              break;
            case 401:
              break;
            case 403:
              break;
            case 423:
              console.log("error ", error.error);
              break;
            default:
              console.log(`Ошибка сервера: ${error.status}`);
              break;
          }
          return throwError((): HttpErrorResponse => error);
        })
      ).subscribe((response: HttpResponse<object>): void => {
        this.router.navigate(['/change/profile/' + (response.body as SuccessLoginResponses).user.id]).then();
      })
    }
  }

}
