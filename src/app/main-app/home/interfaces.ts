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
}

export interface FeedCurrency {
    name: string;
    array: ColumnCurrency[];
}

export type Feed = FeedCurrency | FeedBank;
