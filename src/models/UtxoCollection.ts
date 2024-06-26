import { Schema, model, models, Document } from "mongoose";

export interface status {
  block_hash: string;
  block_height: number;
  block_time: number;
  confirmed: boolean;
}

export interface Utxo extends Document {
  output_value: number;
  output: string;
  ordinal_address: string;
  
  txid: string;
  vout: number;
  utxo_id: string; // New field for txid:vout
  value: number;
  status: status;
  runes: {
    [key: string]: any; // Adjust as per your 'rune' object structure
  };
}

interface rune {
  name: string;
  amount: number;
  divisibility: number;
  symbol: string;
}

const statusSchema = new Schema<status>(
  {
    confirmed: { type: Boolean, required: true },
    block_height: { type: Number, required: false },
    block_hash: { type: String, required: false },
    block_time: { type: Number, required: false },
  },
  { _id: false }
);

const RuneSchema: Schema = new Schema<rune>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    divisibility: { type: Number, required: true },
    symbol: { type: String, required: false },
  },
  { _id: false }
);

const UtxoCollectionSchema = new Schema<Utxo>({

  ordinal_address: {type: String, required:true},
  
  txid: { type: String, required: true },
  vout: { type: Number, required: true },
  utxo_id:{type: String, required: true},
  status: { type: statusSchema, required: true },
  value: { type: Number, required: true },
  runes: { type: [RuneSchema], required: true },
});

export default models.UtxoCollection ||
  model<Utxo>("UtxoCollection", UtxoCollectionSchema);
