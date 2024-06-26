interface AssetDetails {
    amount: number;
    divisibility: number;
    symbol: string;
  }
  
 export interface AssetMap {
    [key: string]: AssetDetails;
  }

export interface Rune {
  rune_name: string;
  rune_amount: number;
  spent: boolean;
}

export interface DataToSave {
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  wallet: string;
  runes: Rune[];
}



export interface RuneData {
  rune_name: string;
  rune_amount: number;
}

export interface UserData {
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  wallet: string;
  runes: RuneData[];
}


