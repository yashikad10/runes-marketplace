import { Schema, model, models, Document } from "mongoose";

export interface UserType extends Document {
  wallet: string;
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  runes: [];
}

const UserSchema = new Schema<UserType>({
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
    unique: true
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

export default models.User ||
  model<UserType>("User", UserSchema);
