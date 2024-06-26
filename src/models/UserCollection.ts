import { Schema, model, models, Document } from "mongoose";

export interface UserCollectionType extends Document {
  wallet: string;
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  runes: [];
}

const UserCollectionSchema = new Schema<UserCollectionType>({
  wallet: {
    type: String,
    required: true,
  },
  cardinal_address: {
    type: String,
    required: true,
  },
  ordinal_address: {
    type: String,
    required: true,
  },
  cardinal_pubkey: {
    type: String,
    required: true,
  },
  runes: {
    type: [],
    required: false,
    default: [],
  },
});

export default models.UserCollection ||
  model<UserCollectionType>("UserCollection", UserCollectionSchema);
