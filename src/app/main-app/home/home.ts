import {
  AfterViewInit,
  Component, ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  lastValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
  tap
} from 'rxjs';
import {
  AbstractControl,
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {AuthService} from '../../services/auth_service/AuthService';
import {AsyncPipe} from '@angular/common';
import {ColumnBank, ColumnCurrency, Feed} from './interfaces';
import {HttpClient} from '@angular/common/http';
import {
  CreateRequest_Request,
  CreateRequestRegistration_Request,
  ExchangeTransfer, User
} from '../../services/auth_service/RequestsTypes';

interface LabelInputDataUserForChang {
  label: string;
  placeholder: string;
  controlName: string;
}

interface Currencies {
  [key: string]: {[key: string]: number};
}

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
        Validators.pattern(/^[0-9]+$/),
      ]),
    });
  }
  private currencyExchangeRatesForCrypt: Promise<Currencies> =
    lastValueFrom(inject(HttpClient).get("https://min-api.cryptocompare.com/data/pricemulti", {
      params: {
        "fsyms": "RUB",
        "tsyms": "BTC,ETH,USDC,TRX,TON,ETC,USDT"
      }
    }).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): Currencies => res as Currencies)
    ));
  private cryptoToCurrenciesRates: Promise<Currencies> =
    lastValueFrom(inject(HttpClient).get("https://min-api.cryptocompare.com/data/pricemulti", {
      params: {
        "fsyms": "BTC,ETH,USDC,TRX,TON,ETC,USDT",
        "tsyms": "RUB"
      }
    }).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): Currencies => res as Currencies)
    ));

  public cryptocurrency$: ColumnCurrency = feeds[1].array[0] as ColumnCurrency;
  public bank$: ColumnBank = feeds[0].array[0] as ColumnBank;

  protected num_currency: number = 0;
  protected num_crypto: number = 0;

  private isUpdating: boolean = false;

  public ngOnInit(): void {
    this.titleService.setTitle("Home");

    const func = (form: AbstractControl<any, any> | null, func: { (value: number): void }): void => {
      form?.valueChanges?.pipe(distinctUntilChanged(), takeUntil(this.destroy$))?.subscribe(func);
    };

    const f = (form: AbstractControl<any, any> | null, func: (value: any) => void): void => {
      form?.statusChanges?.pipe(debounceTime(300), takeUntil(this.destroy$))?.subscribe(func);
    };

    func(this.form.get("inputSumCurrency"), async (value: number): Promise<void> => {
      if (this.isUpdating) return;

      this.isUpdating = true;
      try {
        this.num_currency = value;
        if (this.cryptocurrency$ && this.bank$ && value > 0) {
          this.currencyExchangeRatesForCrypt.then((c: Currencies): void => {
            this.form.get("inputSumCryptoCurrency")?.setValue(
              value * c["RUB"][this.cryptocurrency$.price_currency],
              { emitEvent: false }
            );
            this.num_crypto = this.form.get("inputSumCryptoCurrency")?.value;
          });
        }
        else if (this.cryptocurrency$ && this.bank$ && value <= 0) {
          this.num_currency = 0;
          this.form.get("inputSumCurrency")?.setValue(0);
        }
      }
      finally {
        this.isUpdating = false;
      }
    });

    func(this.form.get("inputSumCryptoCurrency"), async (value: number): Promise<void> => {
      if (this.isUpdating) return;
      this.isUpdating = true;
      try {
        this.num_crypto = value;
        if (this.bank$ && this.cryptocurrency$ && value > 0) {
          this.cryptoToCurrenciesRates.then((c: Currencies): void => {
            this.form.get("inputSumCurrency")?.setValue(
              value * c[this.cryptocurrency$.price_currency]["RUB"],
              { emitEvent: false }
            );
            this.num_currency = this.form.get("inputSumCurrency")?.value;
          });
        }
        else if (this.bank$ && this.cryptocurrency$ && value <= 0) {
          this.num_crypto = 0;
          this.form.get("inputSumCryptoCurrency")?.setValue(0);
        }
      }
      finally {
        this.isUpdating = false;
      }
    });

    // TODO сделать ошибки и для списков тоже
    f(this.form.get("email"), async (status: FormControlStatus): Promise<void> => {
      console.log("email", status);
    });

    f(this.form.get("name"), async (status: FormControlStatus): Promise<void> => {
      console.log("name", status);
    });

    f(this.form.get("bankCard"), async (status: FormControlStatus): Promise<void> => {
      console.log("bankCard", status);
    });

    f(this.form.get("cryptoWallet"), async (status: FormControlStatus): Promise<void> => {
      console.log("cryptoWallet", status);
    });

    f(this.form.get("telegramId"), async (status: FormControlStatus): Promise<void> => {
      console.log("telegramId", status);
    });

  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(id: string): void {
    if ((document.getElementById(id) as HTMLInputElement)?.checked && this.form.valid) {
      console.log("ddd", this.form.get("inputSumCurrency")?.value);
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

    if (this.cryptocurrency$ && this.form.get("inputSumCurrency")?.value > 0) {
      this.currencyExchangeRatesForCrypt.then((c: Currencies): void => {
        this.form.get("inputSumCryptoCurrency")?.setValue(
          this.form.get("inputSumCurrency")?.value * c["RUB"][this.cryptocurrency$.price_currency],
          { emitEvent: false }
        );
      });
      this.num_crypto = this.form.get("inputSumCryptoCurrency")?.value;
    }
  }

  protected async onSelectColumnCryptoCurrency(obj: ColumnCurrency): Promise<void> {
    await this.func("currency", obj.cryptocurrency + ' ' + obj.price_currency);
    this.cryptocurrency$ = obj;

    if (this.bank$ && this.form.get("inputSumCryptoCurrency")?.value > 0) {
      this.cryptoToCurrenciesRates.then((c: Currencies): void => {
        this.form.get("inputSumCurrency")?.setValue(
          this.form.get("inputSumCryptoCurrency")?.value * c[obj.price_currency][this.bank$.currency],
          { emitEvent: false }
        );
      });
      this.num_currency = this.form.get("inputSumCurrency")?.value;
    }
  }
}
