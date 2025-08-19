import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, RouterLink} from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {AbstractControl, FormControl, FormControlStatus, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {catchError, debounceTime, distinctUntilChanged, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';

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

interface ErrorResponses {
  message: string;
  code: CodeErrorType;
}

enum CodeErrorType {
  LOGIN_EXISTS = 'LOGIN_EXISTS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USER_EXISTS  = 'USER_EXISTS',
}

const error_mes: {[key: string]: string} = {
  minlength: "слишком короткий ",
  maxlength: "слишком длинный ",
  required: "поле не может быть пустым. ",
  email: "не правильно введена почта. ",
  pattern: " не соответствует условиям: ",
  password_confirmation: "пароль не совпадает.",
};

@Component({
  selector: 'app-registration-form',
  imports: [ReactiveFormsModule, NgOptimizedImage, RouterLink],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
})

export class RegistrationForm implements OnInit, OnDestroy {
  protected readonly labelsInputs: LabelInputFormRegistration[] = [
      {id: "login", type_i: "text", placeholder: "Логин",},
      {id: "email", type_i: "email", placeholder: "E-mail",},
      {id: "password", type_i: "password", placeholder: "Пароль",},
      {id: "password_confirmation", type_i: "password", placeholder: "Подтвердите пароль",},
  ];

  protected form: FormGroup;
  private destroy$: Subject<void> = new Subject<void>;

  public constructor(private titleService: Title, private http: HttpClient, private router: Router) {
    this.form = new FormGroup({
      login: new FormControl('', [
        Validators.minLength(3),
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_-]+$/),
        Validators.maxLength(24)
      ]),
      email: new FormControl('', [
        Validators.email,
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl('', [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/),
        Validators.maxLength(24)
      ]),
      password_confirmation: new FormControl(null, [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/),
        Validators.maxLength(24)
      ])
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Registration");

    let chekColumnOnValid = async (col: AbstractControl<string, any> | null, id: string): Promise<void> => {
      col?.statusChanges?.pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )?.subscribe((status: FormControlStatus): void => {
        let element_mes_error: HTMLElement | null = document.getElementById(id);
        if (element_mes_error) {
          switch (status) {
            case "INVALID":
              element_mes_error.parentElement?.querySelector("input")?.classList.add("input-error");
              element_mes_error.style.display = "block";
              element_mes_error.textContent = element_mes_error.textContent? "" : element_mes_error.textContent;
              if (id !== "password_confirmation-error") {
                let label: string = ((id: string): string => {
                  switch (id) {
                    case "login-error":
                      return "логин";
                    case "email-error":
                      return "email";
                    case "password-error":
                      return "пароль";
                    default:
                      return "";
                  }
                })(id);
                for (const error in col.errors) {
                  switch (error) {
                    case "minlength":
                    case "maxlength":
                      element_mes_error.textContent += error_mes[error] + label + '. ';
                      continue;
                    case "required":
                    case "email":
                      element_mes_error.textContent += error_mes[error];
                      continue;
                    case "pattern":
                      element_mes_error.textContent = ((text: string | null): string => {
                        return text === '' || text === null
                          ? label : text.replace('. ', ' и');
                      })(element_mes_error.textContent) + error_mes[error] + ((id: string): string => {
                        switch (id) {
                          case "login-error":
                          case "password-error":
                            return "a-z, A-Z, 0-9. ";
                          case "email-error":
                            return "a-z, A-Z, 0-9, '@._-'. ";
                          default:
                            return "";
                        }
                      })(id);
                  }
                }
              }
              else if (id === "password_confirmation-error" && col.value === this.form.get("password_confirmation")?.value) {
                element_mes_error.textContent = error_mes["password_confirmation"];
              }
              break;
            case "VALID":
              const password_confirmation: string = this.form.get("password_confirmation")?.value;
              const password: string = this.form.get("password")?.value;
              if (password_confirmation !== '' && password_confirmation !== null && password !== '' && password !== null &&
                  password !== password_confirmation) {
                element_mes_error.parentElement?.querySelector("input")?.classList?.add("input-error");
                element_mes_error.textContent = error_mes["password_confirmation"];
                element_mes_error.style.display = "block";
              }
              else if (password === password_confirmation) {
                let kl: HTMLElement | null = document.getElementById("password_confirmation-error");
                let kl9: HTMLElement | null = document.getElementById("password-error");
                if (kl && kl9) {
                  kl.parentElement?.querySelector("input")?.classList?.remove("input-error");
                  kl.style.display = "none";
                  kl9.parentElement?.querySelector("input")?.classList?.remove("input-error");
                  kl9.style.display = "none";
                }
              }
              else {
                element_mes_error.parentElement?.querySelector("input")?.classList?.remove("input-error");
                element_mes_error.style.display = "none";
              }
          }
        }
      });
    };

    chekColumnOnValid(this.form.get("login"), "login-error").then();
    chekColumnOnValid(this.form.get("email"), "email-error").then();
    chekColumnOnValid(this.form.get("password"), "password-error").then();
    chekColumnOnValid(this.form.get("password_confirmation"), "password_confirmation-error").then();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(checkbox: string): void {
    if (document.querySelector(checkbox)?.getElementsByTagName("input")[0]?.checked &&
        this.form.status === "VALID") {
      console.log("registration form submitted");

      let data: RequestRegistration = {
        login: this.form.value.login,
        password: this.form.value.password,
        email: this.form.value.email,
        operation: "reg",
      };

      this.http.post<RequestRegistration>("/api/create/user", data, {
        reportProgress: true,
        observe: 'events',
      }).pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse): Observable<never> => {
          let element_error: HTMLElement | null = document.getElementById('header-error');
          if (element_error) {
            switch (error.status) {
              case 409:
                element_error.style.display = "block";
                element_error.textContent = (error.error as ErrorResponses).message;
                break;
              case 500:
                console.error("\n\nError: Ошибка сервера. Попробуйте позже!!!\n\n")
                break;
              default:
            }
          }
          return throwError((): HttpErrorResponse => error);
        }),
        tap((): void => {
          this.router.navigate(["change/login"]).then();
        })
      ).subscribe();
      return;
    }
  }

  protected showPassword(id: string): void {
    let type: Attr | null | undefined = document.querySelector('div#' + id)?.parentElement
                                          ?.getElementsByTagName("input")[0]
                                          ?.getAttributeNode("type");
    if (type?.value !== undefined && type !== null && type !== undefined) {
      switch (type?.value) {
        case "password": type.value = "text"; break;
        case "text": type.value = "password"; break;
      }
    }
  }
}
