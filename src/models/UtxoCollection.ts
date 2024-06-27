// import { Schema, model, models, Document } from "mongoose";

// // Define status interface
// export interface Status {
//   block_hash: string;
//   block_height: number;
//   block_time: number;
//   confirmed: boolean;
// }

// // Define rune interface
// export interface Rune {
//   name: string;
//   amount: number;
//   divisibility: number;
//   symbol?: string;
// }

// // Define status schema
// const statusSchema = new Schema<Status>(
//   {
//     confirmed: { type: Boolean, required: true },
//     block_height: { type: Number, required: false },
//     block_hash: { type: String, required: false },
//     block_time: { type: Number, required: false },
//   },
//   { _id: false }
// );

// // Define rune schema
// const runeSchema: Schema<Rune> = new Schema<Rune>(
//   {
//     name: { type: String, required: true },
//     amount: { type: Number, required: true },
//     divisibility: { type: Number, required: true },
//     symbol: { type: String, required: false },
//   },
//   { _id: false }
// );

// // Define utxo schema with reference to listing schema
// export interface Utxo extends Document {
//   output_value: number;
//   output: string;
//   ordinal_address: string;
//   txid: string;
//   vout: number;
//   utxo_id: string; // New field for txid:vout
//   value: number;
//   status: Status;
//   runes: Rune[];
//   signed_listing_psbt_base64?: string;
//   maker_fee_bp: number;
//   seller_ord_address: string;
//   seller_receive_address: string;
//   price: number;
//   unsigned_listing_psbt_base64: string;
//   tap_internal_key: string;
// }

// const utxoCollectionSchema = new Schema<Utxo>({
//   ordinal_address: { type: String, required: true },
//   txid: { type: String, required: true },
//   vout: { type: Number, required: true },
//   utxo_id: { type: String, required: true },
//   value: { type: Number, required: true },
//   status: { type: statusSchema, required: true },
//   runes: { type: [runeSchema], required: true },
//   signed_listing_psbt_base64: { type: String},
//   maker_fee_bp: { type: Number },
//   seller_receive_address: { type: String },
//   price: { type: Number },
//   unsigned_listing_psbt_base64: { type: String },
// });

// export default models.UtxoCollection ||
//   model<Utxo>("UtxoCollection", utxoCollectionSchema);




import { Schema, model, models, Document } from "mongoose";

// Define status interface
export interface Status {
  block_hash: string;
  block_height: number;
  block_time: number;
  confirmed: boolean;
}

// Define rune interface
export interface Rune {
  name: string;
  amount: number;
  divisibility: number;
  symbol?: string;
}

// Define status schema
const statusSchema = new Schema<Status>(
  {
    confirmed: { type: Boolean, required: true },
    block_height: { type: Number },
    block_hash: { type: String },
    block_time: { type: Number },
  },
  { _id: false }
);

// Define rune schema
const runeSchema: Schema<Rune> = new Schema<Rune>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    divisibility: { type: Number, required: true },
    symbol: { type: String },
  },
  { _id: false }
);

// Define utxo schema with reference to listing schema
export interface Utxo extends Document {
  output_value: number;
  output: string;
  ordinal_address: string;
  txid: string;
  vout: number;
  utxo_id: string; // New field for txid:vout
  value: number;
  status: Status;
  runes: Rune[];
  signed_listing_psbt_base64?: string;
  maker_fee_bp: number;
  seller_ord_address: string;
  seller_receive_address: string;
  price: number;
  unsigned_listing_psbt_base64: string;
  tap_internal_key: string;
  listed: boolean;
  listed_at?: Date;
  listed_price?: number;
  listed_price_per_token?: number;
  listed_seller_receive_address?: string;
  signed_psbt?: string;
  unsigned_psbt?: string;
  listed_maker_fee_bp?: number;
}

const utxoCollectionSchema = new Schema<Utxo>({
  ordinal_address: { type: String, required: true },
  txid: { type: String, required: true },
  vout: { type: Number, required: true },
  utxo_id: { type: String, required: true },
  value: { type: Number, required: true },
  status: { type: statusSchema, required: true },
  runes: { type: [runeSchema], required: true },
  signed_listing_psbt_base64: { type: String },
  maker_fee_bp: { type: Number, default: 100 },
  seller_receive_address: { type: String },
  price: { type: Number },
  unsigned_listing_psbt_base64: { type: String },
  listed: { type: Boolean, default: false },
  listed_at: { type: Date },
  listed_price: { type: Number },
  listed_price_per_token: { type: Number },
  listed_seller_receive_address: { type: String },
  signed_psbt: { type: String },
  unsigned_psbt: { type: String },
  listed_maker_fee_bp: { type: Number, default: 100 },
});

export default models.UtxoCollection ||
  model<Utxo>("UtxoCollection", utxoCollectionSchema);

