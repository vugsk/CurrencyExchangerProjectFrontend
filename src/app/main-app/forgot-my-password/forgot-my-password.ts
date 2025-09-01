import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormControl, FormControlStatus, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {debounceTime, Subject, takeUntil} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../services/auth_service/AuthService';
import {LoginRequest, RecoveryPasswordRequest} from '../../services/auth_service/RequestsTypes';

@Component({
  selector: 'forgot-my-password',
  templateUrl: "forgot-my-password.html",
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  styleUrl: "forgot-my-password.css"
})
export class ForgotMyPassword implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private isDropdownOpen: boolean = false;
  protected form: FormGroup;

  constructor(private titleService: Title, private elementRef: ElementRef, private authService: AuthService) {
    this.form = new FormGroup({
      input_login_or_email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]),
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Восстановление пароля");

    this.form.get("input_login_or_email")?.statusChanges?.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    )?.subscribe((status: FormControlStatus): void => {
      let input_error_element: HTMLInputElement = this.elementRef.nativeElement.querySelector("input#identifier");
      let div_error_element: HTMLDivElement = this.elementRef.nativeElement.querySelector("div.error-message");
      div_error_element.textContent = "";
      switch (status) {
        case "INVALID":
          div_error_element.style.display = "block";
          input_error_element.classList.add("input-error");
          for (const key in this.form.get("input_login_or_email")?.errors) {
            switch (key) {
              case "required":
                div_error_element.textContent += "поле пустое. ";
                break;
              case "minlength":
                div_error_element.textContent += "логин/email слишком короткий. ";
                break;
              case "maxlength":
                div_error_element.textContent += "логин/email слишком длинный. ";
                break
            }
          }
          break;
        case "VALID":
          div_error_element.style.display = "none";
          input_error_element.classList.remove("input-error");
          break;
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      this.authService.recoveryPassword((this.form.value as RecoveryPasswordRequest)).then();
      this.isDropdownOpen = true;
    }
  }

  protected onSubmitCodePremiss() {

  }

}
