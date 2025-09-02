import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormControl, FormControlStatus, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {debounceTime, Subject, takeUntil} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../services/auth_service/AuthService';
import {NgOptimizedImage} from '@angular/common';
import {
  CodeEmailRequest,
  CodeRequest,
  NewPasswordRequest,
  RecoveryPasswordRequest
} from '../../services/auth_service/RequestsTypes';
import {ErrorResponse} from '../../services/auth_service/ResponsesTypes';

interface Form {
  input_email: string;
  input_code_email: number;
  input_password: string;
  input_confirmations_password: string;
}

@Component({
  selector: 'forgot-my-password',
  templateUrl: "forgot-my-password.html",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage
  ],
  styleUrl: "forgot-my-password.css"
})
export class ForgotMyPassword implements OnInit, OnDestroy {
  protected ModalSiteType = {
    CONFIRMATIONS_EMAIL: 'CONFIRMATIONS_EMAIL',
    INPUT_NEW_PASSWORD: 'INPUT_NEW_PASSWORD',
  }

  private destroy$: Subject<void> = new Subject<void>();
  protected form: FormGroup;
  protected form_module: FormGroup;

  constructor(private titleService: Title, private elementRef: ElementRef, private authService: AuthService) {
    this.form = new FormGroup({
      input_email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
    });

    this.form_module = new FormGroup({
      input_code_email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]),

      input_password: new FormControl('', [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/),
        Validators.maxLength(24)
      ]),
      input_confirmations_password: new FormControl('', [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/),
        Validators.maxLength(24)
      ]),
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Восстановление пароля");

    this.form.get("input_email")?.statusChanges?.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    )?.subscribe((status: FormControlStatus): void => {
      let input_error_element: HTMLInputElement = this.elementRef.nativeElement.querySelector("input#input-email");
      let div_error_element: HTMLDivElement = this.elementRef.nativeElement.querySelector("div.error-message");
      div_error_element.textContent = "";
      switch (status) {
        case "INVALID":
          div_error_element.style.display = "block";
          input_error_element.classList.add("input-error");
          for (const key in this.form.get("input_email")?.errors) {
            switch (key) {
              case "required":
                div_error_element.textContent += "поле пустое. ";
                break;
              case "minlength":
                div_error_element.textContent += "email слишком короткий. ";
                break;
              case "maxlength":
                div_error_element.textContent += "email слишком длинный. ";
                break
              case "pattern":
                const text = "не удовлетворяет условиям: _%+-@, a-z, A-Z, 0-9.";
                div_error_element.textContent = div_error_element.textContent?.length === 0 ? "email" + text
                            : div_error_element.textContent.replaceAll(". ", '') + " и " + text;
                break;
            }
          }
          break;
        case "VALID":
          div_error_element.style.display = "none";
          input_error_element.classList.remove("input-error");
          break;
      }
    });

    this.form_module.get("input_code_email")?.statusChanges?.pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    )?.subscribe((status: FormControlStatus): void => {
      let input_error_element: HTMLInputElement = this.elementRef.nativeElement.querySelector("input#input-code-with-email");
      let div_error_element: HTMLDivElement = this.elementRef.nativeElement.querySelector("div#error-model-code-email");
      div_error_element.textContent = "";
      switch (status) {
        case "INVALID":
          div_error_element.style.display = "block";
          input_error_element.classList.add("input-error");
          for (const key in this.form_module.get("input_code_email")?.errors) {
            switch (key) {
              case "required":
                div_error_element.textContent += "поле пустое. ";
                break;
              case "minlength":
                div_error_element.textContent += "код слишком короткий. ";
                break;
              case "maxlength":
                div_error_element.textContent += "код слишком длинный. ";
                break
              case "pattern":
                const text = "должен состоять из 0-9.";
                div_error_element.textContent = div_error_element.textContent?.length === 0 ? "код" + text
                  : div_error_element.textContent.replaceAll(". ", '') + " и " + text;
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

  protected modalSite: string = this.ModalSiteType.CONFIRMATIONS_EMAIL;
  protected onSubmit(): void {
    if (this.form.valid) {
      this.modalSite = this.ModalSiteType.CONFIRMATIONS_EMAIL;

      this.form_module.get("input_code_email")?.reset('');
      this.form_module.get("input_password")?.reset('');
      this.form_module.get("input_confirmations_password")?.reset('');

      this.authService.recoveryPassword((this.form.value as RecoveryPasswordRequest)).then();
      this.elementRef.nativeElement.querySelector("div#popupModal").style.display = "flex";

      let headerElement: HTMLElement = this.elementRef.nativeElement.querySelector("h3#modalTitle");
      if (headerElement) headerElement.textContent = "Подтверждение почты";

      const form_email: CodeEmailRequest = {
        email: this.form.value.input_email,
      }
      this.authService.confirmationsCodeEmail(form_email).then();
    }
  }

  // TODO сделать проверку для пароля
  protected onSubmitCodePremiss() {
    switch (this.modalSite) {
      case "CONFIRMATIONS_EMAIL":
        if (this.form_module.get("input_code_email")?.valid) {
          const codeRequest: CodeRequest = {
            code: this.form_module.get("input_code_email")?.value
          };
          console.log(codeRequest);
          this.authService.sendCodeEmail(codeRequest).then((error: ErrorResponse): void => {
            switch (error.code) {
              case "USER_SUCCESS":
                this.modalSite = this.ModalSiteType.INPUT_NEW_PASSWORD;
                let headerElement: HTMLElement = this.elementRef.nativeElement.querySelector("h3#modalTitle");
                if (headerElement) headerElement.textContent = "Изменить пароль";
                break;
            }
          });
        }
        break;
      case "INPUT_NEW_PASSWORD":
        if (this.form_module.get("input_password")?.valid && this.form_module.get("input_confirmations_password")?.valid) {
          this.elementRef.nativeElement.querySelector("div#popupModal").style.display = "none";
          const newPasswordRequest: NewPasswordRequest = {
            new_password: this.form_module.get("input_password")?.value,
          };
          console.log(newPasswordRequest);
          this.authService.sendNewPassword(newPasswordRequest).then();
        }
        break;
    }
  }

  protected onClose(): void {
    this.elementRef.nativeElement.querySelector("div#popupModal").style.display = "none";
  }

  protected onShowPassword(id: string): void {
    let type: Attr | null | undefined = this.elementRef.nativeElement.querySelector('div#' + id)?.parentElement
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
