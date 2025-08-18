import { Component } from '@angular/core';
import { Feed, ColumnCurrency, ColumnBank } from './interfaces';
import {Title} from '@angular/platform-browser';

interface LabelInputDataUserForChang {
  label: string;
  placeholder: string;
  style_label: string;
  style_input: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
    protected arrayLabelsInputs: LabelInputDataUserForChang[] = [
    {
      label: "Ваш адрес электронной почты",
      placeholder: "Введите адрес электронной почты для уведомлений",
      style_label: "",
      style_input: ""
    },
    {
      label: "Номер вашей карты T-банк",
      placeholder: "Введите свой номер карты",
      style_label: "",
      style_input: ""
    },
    {
      label: "Ваш Bitcoin кошелек",
      placeholder: "Пример: 1BvBMSEYstqTFn5Au4m4GFgWet7xJaNVN4",
      style_label: "",
      style_input: ""
    },
    {
      label: "Имя держателя карты или счета",
      placeholder: "Пример: Николай",
      style_label: "",
      style_input: ""
    },
    {
      label: "Логин Telegram для связи",
      placeholder: "Пример: @nickname",
      style_label: "",
      style_input: ""
    }
    ]
    protected feeds: Feed[] = [
    {
      name: "Отправляете",
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

    constructor(private titleService: Title) {
        this.titleService.setTitle("Home");
    }

    protected isColumnBank(item: ColumnBank | ColumnCurrency): item is ColumnBank {
        return 'name' in item
    }

    protected isColumnCurrency(item: ColumnBank | ColumnCurrency): item is ColumnCurrency {
        return 'price' in item
    }

    protected createRequest(checkbox_tag: string, button_tag: string): void {
      if (document.querySelector(checkbox_tag)?.getElementsByTagName("input")[0]?.checked) {
        console.log("ok");
      }
    }

    private bank: ColumnBank | undefined;
    private currency: ColumnCurrency | undefined;
    protected activeFunctionColumnFeed(column: ColumnBank | ColumnCurrency, class_tag: string): void {
      document.querySelectorAll(class_tag).forEach((element: Element): void => {
        const text: string = this.isColumnBank(column)? (column.name + " " + column.currency)
          : (column.cryptocurrency + " " + column.price_currency);

        if (element.classList.contains("active"))
          element.classList.remove("active");
        if (element.children[0].textContent === text && !element.classList.contains('active')) {
          element.classList.add("active");

          if (this.isColumnBank(column))
            this.bank = column;
          else if (this.isColumnCurrency(column))
            this.currency = column;
        }
      });
    }

    // refactor code
    // TODO: вынести как отдельный модуль либо класс с функциями получение и отправки данных на сервера
    private async Te(url: string, params?: any): Promise<any> {
      const _url = new URL(url);
      _url.search = new URLSearchParams(params).toString();

      const options = {
        method: 'GET',
        headers:  {"Content-type":"application/json; charset=UTF-8"},
      };

      return await fetch(_url, options)
        .then((response: Response): Promise<any> => response.json())
        .catch((err: any): void => console.error(err));
    }

    // refactor code
    // TODO: сделать чтобы после обработки выдовал массив объектов курса крипты с названием полным и коротким
    protected readonly curseCoin: Promise<object> = (async ():Promise<object> => {
      return await this.Te("https://min-api.cryptocompare.com/data/all/coinlist")
        .then(async (json: any) => {
          let jk: number = 0;
          let arr: string[] = []
          for (const key in json.Data) {
            if (jk < 10) {
              arr.push(json.Data[key].Name);
              jk++;
            }
          }
          return await this.Te("https://min-api.cryptocompare.com/data/pricemulti", {
            "fsyms": arr.join(',').toString(), "tsyms": "USDT,RUB"
          });
      });
    })();
}
