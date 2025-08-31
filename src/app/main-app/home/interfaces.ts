export interface LabelInputDataUserForChang {
  label: string;
  placeholder: string;
  controlName: string;
}

export interface Currencies {
  [key: string]: {[key: string]: number};
}

export interface ColumnBank {
    name: string;
    currency: string;
}

export interface ColumnCurrency {
    price: string;
    price_currency: string;
    cryptocurrency: string;
}

export interface FeedBank {
  name: string;
  array: ColumnBank[];
  controlNameInput: string;
}

export interface FeedCurrency {
  name: string;
  array: ColumnCurrency[];
  controlNameInput: string;
}

export type Feed = FeedCurrency | FeedBank;
