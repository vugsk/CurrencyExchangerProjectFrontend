import { Component } from '@angular/core';
import { Feed, ColumnCurrency, ColumnBank } from './interfaces';

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
    public arrayLabelsInputs: LabelInputDataUserForChang[] = [
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
    public feeds: Feed[] = [
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
    public isColumnBank(item: ColumnBank | ColumnCurrency): item is ColumnBank {
        return 'name' in item
    }
    public isColumnCurrency(item: ColumnBank | ColumnCurrency): item is ColumnCurrency {
        return 'price' in item
    }
}
