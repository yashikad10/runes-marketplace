import * as bitcoin from "bitcoinjs-lib";
import { AssetMap } from "../allRunes";

export interface AddressTxsUtxo {
  ordinal_address: string;
  utxo_id: string;
  rune: AssetMap;
  txid: string;
  vout: number;
  status: TxStatus;
  value: number;
}
export interface TxStatus {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface UTXO {
  txid: string;
  value: number;
  vout: number;
  tx: bitcoin.Transaction;
}

export interface UtxoCollection {
  utxo: string;
  ordinal_address: string;
  rune_name: string;
  rune_amount: string;
  spent: boolean;
}
