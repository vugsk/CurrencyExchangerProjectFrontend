import {Component, ElementRef, inject, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {debounceTime, distinctUntilChanged, lastValueFrom, map, Observable, Subject, takeUntil} from 'rxjs';
import {AbstractControl, FormControl, FormControlStatus, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth_service/AuthService';
import {AsyncPipe} from '@angular/common';
import {ColumnBank, ColumnCurrency, Currencies, Feed, LabelInputDataUserForChang} from './interfaces';
import {HttpClient} from '@angular/common/http';
import {ExchangeTransfer} from '../../services/auth_service/RequestsTypes';

const arrayLabelsInputs: LabelInputDataUserForChang[] = [
  {
    label: "Ваш адрес электронной почты",
    placeholder: "Введите адрес электронной почты для уведомлений",
    controlName: "email",
  },
  {
    label: "Номер вашей карты T-банк",
    placeholder: "Введите свой номер карты",
    controlName: "bankCard",
  },
  {
    label: "Ваш Bitcoin кошелек",
    placeholder: "Пример: 1BvBMSEYstqTFn5Au4m4GFgWet7xJaNVN4",
    controlName: "cryptoWallet",
  },
  {
    label: "Имя держателя карты или счета",
    placeholder: "Пример: Николай",
    controlName: "name",
  },
  {
    label: "Логин Telegram для связи",
    placeholder: "Пример: @nickname",
    controlName: "telegramId",
  }
]
const feeds: Feed[] = [
  {
    name: "Отправляете",
    controlNameInput: "inputSumCurrency",
    array: [
      {
        name: "T-Банк",
        currency: "RUB"
      },
      {
        name: "СБП",
        currency: "RUB"
      },
      {
        name: "СберБанк",
        currency: "RUB"
      },
      {
        name: "ВТБ Банк",
        currency: "RUB"
      }
    ]
  },
  {
    name: "Получаете",
    controlNameInput: "inputSumCryptoCurrency",
    array: [
        {
            price: "20000",
            price_currency: "USDT",
            cryptocurrency: "Tether AVAX C-Chain"
        },
        {
            price: "10",
            price_currency: "BTC",
            cryptocurrency: "Bitcoin"
        },
        {
            price: "300000",
            price_currency: "USDT",
            cryptocurrency: "Tether TRC-20"
        },
        {
            price: "20000",
            price_currency: "USDT",
            cryptocurrency: "Tether BEP-20"
        },
    ]
  },
]
const errors_messages: { [key: string ]: string } = {
  minlength: "слишком короткий ",
  maxlength: "слишком длинный ",
  required: "поле пустое. ",
  pattern: " не подходит под условия: "
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  protected labelsInputs$: Observable<LabelInputDataUserForChang[]> = ((): Observable<LabelInputDataUserForChang[]> => {
    return inject(AuthService).isLoggedIn$.pipe(
      map((status: boolean): LabelInputDataUserForChang[] => {
        let arr: LabelInputDataUserForChang[] = [];
        for (const input of arrayLabelsInputs) {
          if (status && ['email', 'name'].find((res: string): boolean => res === input.controlName) !== input.controlName) {
            arr.push(input);
          }
          else if (!status) {
            arr.push(input);
          }
        }
        return arr;
      })
    );
  })();
  protected feedsCurrency: Feed[] = feeds;
  private destroy$: Subject<void> = new Subject<void>();
  protected form: FormGroup;
  protected cryptocurrency$: ColumnCurrency = feeds[1].array[0] as ColumnCurrency;
  protected bank$: ColumnBank = feeds[0].array[0] as ColumnBank;
  protected num_currency: number = 0;
  protected num_crypto: number = 0;

  private currencyExchangeRatesForCrypt: Promise<Currencies> = this.ddd("RUB", "BTC,ETH,USDC,TRX,TON,ETC,USDT");
  private cryptoToCurrenciesRates: Promise<Currencies> = this.ddd("BTC,ETH,USDC,TRX,TON,ETC,USDT", "RUB");
  private isUpdating: boolean = false;

  constructor(private titleService: Title, private elementRef: ElementRef, private authService: AuthService) {
    this.form = new FormGroup({
      email: new FormControl('', [
        Validators.email,
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      name: new FormControl('', [
        Validators.minLength(1),
        Validators.required,
        Validators.pattern(/^[А-Я][а-я]+$/),
        Validators.maxLength(24)
      ]),
      bankCard: new FormControl('', [
        Validators.minLength(3),
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.maxLength(30)
      ]),
      cryptoWallet: new FormControl('', [
        Validators.minLength(3),
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
        Validators.maxLength(50)
      ]),
      telegramId: new FormControl('', [
        Validators.minLength(2),
        Validators.required,
        Validators.pattern(/^@[a-zA-Z0-9_]+$/),
        Validators.maxLength(24)
      ]),

      inputSumCurrency: new FormControl('', [
        Validators.minLength(2),
        Validators.required,
        Validators.pattern(/^[0-9.]+$/),
      ]),
      inputSumCryptoCurrency: new FormControl('', [
        Validators.minLength(2),
        Validators.required,
        Validators.pattern(/^[0-9.]+$/),
      ]),
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Home");

    const func: (form: (AbstractControl<any, any> | null), formNameControl: string, isCrypt: boolean) => Promise<void> =
      async (form: AbstractControl<any, any> | null, formNameControl: string, isCrypt: boolean ): Promise<void> => {
        form?.valueChanges?.pipe(distinctUntilChanged(), takeUntil(this.destroy$))?.subscribe((value: number): void => {
          if (this.isUpdating) return;
          this.isUpdating = true;
          try {
            if (!isCrypt)
              this.num_currency = value;
            else
              this.num_crypto = value;
            if (this.cryptocurrency$ && this.bank$ && value > 0) {
              if (!isCrypt) {
                this.currencyExchangeRatesForCrypt.then((c: Currencies): void => {
                  this.form.get(formNameControl)?.setValue(
                    value * c["RUB"][this.cryptocurrency$.price_currency],
                    { emitEvent: false }
                  );
                  this.num_crypto = this.form.get(formNameControl)?.value;
                });
              }
              else {
                this.cryptoToCurrenciesRates.then((c: Currencies): void => {
                  this.form.get(formNameControl)?.setValue(
                    value * c[this.cryptocurrency$.price_currency]["RUB"],
                    { emitEvent: false }
                  );
                  this.num_currency = this.form.get(formNameControl)?.value;
                });
              }
            }
            else if (this.cryptocurrency$ && this.bank$ && value <= 0) {
              if (!isCrypt)
                this.num_currency = 0;
              else
                this.num_crypto = 0;
            }
          }
          finally {
            this.isUpdating = false;
          }
        });
      };
    const f: (form: (AbstractControl<any, any> | null), formNameControl: string) => Promise<void> =
      async (form: AbstractControl<any, any> | null, formNameControl: string): Promise<void> => {
        form?.statusChanges?.pipe(debounceTime(300), takeUntil(this.destroy$))?.subscribe((status: FormControlStatus) => {
          let input_el: HTMLInputElement = this.elementRef.nativeElement.querySelector("input#" + formNameControl);
          let div_error: HTMLElement = this.elementRef.nativeElement.querySelector("div.error-message");
          div_error.textContent = "";
          switch (status) {
            case "INVALID":
              const el_name: string = ((name_element: string): string => {
                switch (name_element) {
                  case "email":
                    return "email";
                  case "name":
                    return "имя";
                  case "bankCard":
                    return "номер банковской карты";
                  case "cryptoWallet":
                    return "криптокошелек";
                  case "telegramId":
                    return "телеграм ID";
                  default:
                    return ""
                }
              })(formNameControl);
              input_el.classList.add("input-error");
              div_error.style.display = "block";
              for (const key in form?.errors) {
                switch (key) {
                  case "maxLength":
                  case "minlength":
                    div_error.textContent += errors_messages[key] + el_name + '. ';
                    break;
                  case "pattern":
                    div_error.textContent = ((text: string | null): string => {
                      return text === '' || text === null ? el_name : text.replace('. ', ' и');
                    })(div_error.textContent) + errors_messages[key] + ((name_element: string): string => {
                      switch (name_element) {
                        case "email":
                          return "a-z, A-Z, 0-9, '@._-'. ";
                        case "name":
                          return "А-Я, а-я";
                        case "bankCard":
                          return "0-9";
                        case "cryptoWallet":
                          return "a-z, A-Z, 0-9";
                        case "telegramId":
                          return "a-z, A-Z, 0-9, _, @";
                        default:
                          return ""
                      }
                    })(formNameControl);
                    break;
                  case "required":
                    div_error.textContent += errors_messages[key];
                    break;
                }
              }
              break;
            case "VALID":
              input_el.classList.remove("input-error");
              div_error.style.display = "none";
              break;
          }
        });
      };
    const ff: (form: (AbstractControl<any, any> | null), formNameControl: string) => Promise<void> =
      async (form: AbstractControl<any, any> | null, formNameControl: string): Promise<void> => {
        form?.statusChanges?.pipe(
          takeUntil(this.destroy$),
          debounceTime(500),
          distinctUntilChanged()
        )?.subscribe((status: FormControlStatus) => {
          let input_el: HTMLInputElement = this.elementRef.nativeElement.querySelector("input#" + formNameControl);
          switch (status) {
            case "INVALID":
              input_el.classList.add("input-error");
              break;
            case "VALID":
              input_el.classList.remove("input-error");
              break;
          }
        });
      };

    func(this.form.get("inputSumCurrency"), "inputSumCryptoCurrency", false).then();
    func(this.form.get("inputSumCryptoCurrency"), "inputSumCurrency", true).then();

    f(this.form.get("email"), "email").then();
    f(this.form.get("name"), "name").then();
    f(this.form.get("bankCard"), "bankCard").then();
    f(this.form.get("cryptoWallet"), "cryptoWallet").then();
    f(this.form.get("telegramId"), "telegramId").then();

    ff(this.form.get("inputSumCurrency"), "inputSumCurrency").then();
    ff(this.form.get("inputSumCryptoCurrency"), "inputSumCryptoCurrency").then();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(id: string): void {
    if ((document.getElementById(id) as HTMLInputElement)?.checked && this.form.valid) {
      this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((status: boolean): void => {
        const exchangeTransfer: ExchangeTransfer = {
          cryptoWallet: this.form.get("cryptoWallet")?.value,
          bankCard: this.form.get("bankCard")?.value,
          currency: {
            bank: this.bank$.name,
            symbol: this.bank$.currency,
            sumCurrency: this.form.get("inputSumCurrency")?.value
          },
          crypt: {
            fullName: this.cryptocurrency$.cryptocurrency,
            name: this.cryptocurrency$.price_currency,
            sumCrypto: this.form.get("inputSumCryptoCurrency")?.value
          }
        }
        if (status) {
          this.authService.createRequest({
            telegramId: this.form.get("telegramId")?.value,
            transfer: exchangeTransfer
          }).subscribe();
        }
        else {
          this.authService.createRequest({
            user: {
              email: this.form.get("email")?.value,
              name: this.form.get("name")?.value,
              telegramId: this.form.get("telegramId")?.value
            },
            transfer: exchangeTransfer
          }).subscribe();
        }
      });
    }
  }

  private async func(id: string, text: string): Promise<void> {
    for (const el1 of this.elementRef.nativeElement.querySelectorAll("div." + id)) {
      if (el1.classList.contains("active"))
        el1.classList.remove("active");
      else if (el1.children[0].textContent === text && !el1.classList.contains("active")) {
        el1.classList.add("active");
      }
    }
  }

  protected async onSelectColumnCurrency(obj: ColumnBank): Promise<void> {
    await this.func("bank", obj.name + ' ' + obj.currency);
    this.bank$ = obj;
    await this.dd(this.cryptocurrency$, "inputSumCurrency");
  }

  protected async onSelectColumnCryptoCurrency(obj: ColumnCurrency): Promise<void> {
    await this.func("currency", obj.cryptocurrency + ' ' + obj.price_currency);
    this.cryptocurrency$ = obj;
    await this.dd(this.bank$, "inputSumCryptoCurrency");
  }

  private async dd(obj: ColumnBank | ColumnCurrency, formNameControl: string): Promise<void> {
    if (obj && this.form.get(formNameControl)?.value > 0) {
      if ('price' in obj) {
        this.currencyExchangeRatesForCrypt.then((c: Currencies): void => {
          this.form.get("inputSumCryptoCurrency")?.setValue(
            this.form.get(formNameControl)?.value * c["RUB"][this.cryptocurrency$.price_currency],
            {emitEvent: false}
          );
        });
        this.num_crypto = this.form.get("inputSumCryptoCurrency")?.value;
      }
      else if ('name' in obj) {
        this.cryptoToCurrenciesRates.then((c: Currencies): void => {
          this.form.get("inputSumCurrency")?.setValue(
            this.form.get(formNameControl)?.value * c[this.cryptocurrency$.price_currency][this.bank$.currency],
            { emitEvent: false }
          );
        });
        this.num_currency = this.form.get("inputSumCurrency")?.value;
      }
    }
  }

  private ddd(fsyms: string, tsyms: string): Promise<Currencies> {
    return lastValueFrom(inject(HttpClient).get("https://min-api.cryptocompare.com/data/pricemulti", {
      params: { "fsyms": fsyms, "tsyms": tsyms }
    }).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): Currencies => res as Currencies)
    ));
  }
}
