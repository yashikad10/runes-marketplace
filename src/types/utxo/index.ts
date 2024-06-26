export interface Inscription extends Document {
    [x: string]: any;
    wallet: string;
    cardinal_address: string;
    ordinal_address: string;
    cardinal_pubkey: string;
    txid: string;
    network: string;
    created_at: Date;
  }
  
  export interface IInscribeOrder {
    _id?: string;
    order_id: string;
    receive_address: string;
    chain_fee: number;
    service_fee: number;
    txid: string;
    psbt: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  
  export interface ICreateInscription extends IDoc {
    order_id: string;
    privkey: string;
    ordinal_address: string;
    file_type: string;
    base64: string;
    file_size: number;
    inscription_address: string;
    txid: string;
    network: "testnet" | "mainnet";
  }
  
  export interface IDoc {
    cardinal_address: string;
    cardinal_pubkey: string;
    ordinal_address: string;
    ordinal_pubkey: string;
    wallet: string;
  }
  
  export interface CreateInscription{
    wallet: string;
    cardinal_address: string;
    ordinal_address: string;
    cardinal_pubkey: string;
    txid: string;
    network: string;
    created_at?: Date;
  }