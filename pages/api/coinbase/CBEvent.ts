export default interface CBEvent {
    id:             string;
    scheduled_for:  Date;
    attempt_number: number;
    event:          Event;
}

export interface Event {
    api_version: Date;
    created_at:  Date;
    data:        Data;
    id:          string;
    resource:    string;
    type:        string;
}

export interface Data {
    id:                   string;
    code:                 string;
    name:                 string;
    utxo:                 boolean;
    fee_rate:             number;
    logo_url:             string;
    metadata:             Metadata;
    payments:             PaymentElement[];
    resource:             string;
    timeline:             Timeline[];
    addresses:            Addresses;
    pwcb_only:            boolean;
    created_at:           Date;
    expires_at:           Date;
    hosted_url:           string;
    brand_color:          string;
    description:          string;
    confirmed_at:         Date;
    fees_settled:         boolean;
    pricing_type:         string;
    support_email:        string;
    brand_logo_url:       string;
    exchange_rates:       ExchangeRates;
    offchain_eligible:    boolean;
    organization_name:    string;
    local_exchange_rates: ExchangeRates;
}

export interface Addresses {
    bitcoin:  string;
    ethereum: string;
    litecoin: string;
}

export interface ExchangeRates {
    "BTC-USD": string;
    "ETH-USD": string;
    "LTC-USD": string;
}

export interface Metadata {
    account_id: string;
    plan:       string;
}

export interface PaymentElement {
    net:                     CoinbaseProcessingFee;
    block:                   Block;
    value:                   CoinbaseProcessingFee;
    status:                  string;
    network:                 string;
    deposited:               Deposited;
    payment_id:              string;
    detected_at:             Date;
    transaction_id:          string;
    coinbase_processing_fee: CoinbaseProcessingFee;
}

export interface Block {
    hash:                   string;
    height:                 number;
    confirmations:          number;
    confirmations_required: number;
}

export interface CoinbaseProcessingFee {
    local:  Crypto | null;
    crypto: Crypto;
}

export interface Crypto {
    amount:   string;
    currency: Currency;
}

export enum Currency {
    Btc = "BTC",
    Usd = "USD",
}

export interface Deposited {
    amount:                 Amount;
    status:                 string;
    destination:            string;
    exchange_rate:          null;
    autoconversion_status:  string;
    autoconversion_enabled: boolean;
}

export interface Amount {
    net:          CoinbaseProcessingFee;
    gross:        CoinbaseProcessingFee;
    coinbase_fee: CoinbaseProcessingFee;
}

export interface Timeline {
    time:     Date;
    status:   string;
    payment?: TimelinePayment;
}

export interface TimelinePayment {
    value:          Crypto;
    network:        string;
    transaction_id: string;
}