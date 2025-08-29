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
import {HttpResponse} from '@angular/common/http';
import {debounceTime, Observable, Subject, takeUntil} from 'rxjs';
import {NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../services/auth_service/AuthService';
import {LoginRequest} from '../../services/auth_service/RequestsTypes';
import {LoginResponse} from '../../services/auth_service/ResponsesTypes';

const error_msg: {[key: string]: string} = {
  minlength: "слишком короткий ",
  maxlength: "слишком длинный ",
  required: "поле не может быть пустым. ",
};

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})

export class LoginForm implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  protected form: FormGroup;
  constructor(private titleService: Title, private router: Router, private authService: AuthService) {
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
      const email: boolean = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        .test((this.form.value as LoginRequest).email_or_login)
      const login: boolean = /^[a-zA-Z][a-zA-Z0-9_-]+$/.test((this.form.value as LoginRequest).email_or_login)

      let element_global_error: HTMLElement | null = document.getElementById("global-msg-error");
      if (email && login && element_global_error) {
        element_global_error.style.display = "block";
      }
      else if ((email || login) && element_global_error) {
        element_global_error.style.display = "none";
        this.authService.login(this.form.value as LoginRequest, email, login)
          .then((res: Observable<HttpResponse<LoginResponse>>): void => {
            res.pipe(takeUntil(this.destroy$)).subscribe((response: HttpResponse<LoginResponse>): void => {
              this.router.navigate(['/change/profile']).then();
            });
          }
        )
      }

    }
  }

}
