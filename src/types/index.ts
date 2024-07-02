export interface WalletDetails {
  cardinal_address: string;
  cardinal_pubkey: string;
  ordinal_address: string;
  ordinal_pubkey: string;
  connected?: boolean;
  wallet: string | null;
}
export type Purpose = "payment" | "ordinals";


export interface UTXO {
  status: {
    block_hash: string;
    block_height: number;
    block_time: number;
    confirmed: boolean;
  };
  txid: string;
  value: number;
  vout: number;
  tx: any;
}

export type Account = {
  address: string;
  publicKey: string;
  purpose: Purpose;
};


export interface AddressTxsUtxo {
  status: {
    block_hash: string;
    block_height: number;
    block_time: number;
    confirmed: boolean;
  };
  txid: string;
  value: number;
  vout: number;
}

export interface AuthOptionsArgs {
  manifestPath?: string;
  redirectTo?: string;
  network?: "mainnet" | "testnet";
  appDetails?: {
    name?: string;
    icon?: string;
  };
}

export interface IInstalledWallets {
  label: string;
  logo: string;
}

export interface CommonSignOptions {
  psbt: string;
  network: "Mainnet" | "Testnet";
  action: "sell" | "buy" | "dummy" | "other";
  inputs: {
    publickey: string;
    address: string;
    index: number[];
    sighash: number;
  }[];
}

export interface CommonSignResponse {
  loading: boolean;
  result: any;
  error: Error | null;
  sign: (options: CommonSignOptions) => Promise<void>;
}


export interface RuneItem {
  _id: string;
  ordinal_address: string;
  txid: string;
  vout: number;
  utxo_id: string;
  value: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  runes: {
    name: string;
    amount: number;
    divisibility: number;
    symbol: string;
  }[];
  maker_fee_bp: number;
  listed: boolean;
  listed_maker_fee_bp: number;
  __v: number;
  listed_at: string;
  listed_price: number;
  listed_price_per_token: number;
  listed_seller_receive_address: string;
}
