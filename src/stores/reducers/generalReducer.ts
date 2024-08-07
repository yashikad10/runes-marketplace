import { WalletDetails } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GeneralState {
  user: WalletDetails | null;
  lastWallet: string;
  btc_price: number;
  network: "mainnet" | "testnet";
  new_activity: boolean;
}

const initialState: GeneralState = {
  user: null,
  lastWallet: "",
  btc_price: 0,
  network: "mainnet" || "testnet",
  new_activity: false
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<WalletDetails | null>) => {
      console.log('setting user as : ', action.payload)
      state.user = action.payload;
    },
    setLastWallet: (state, action: PayloadAction<string>) => {
      state.lastWallet = action.payload;
    },
    setBtcPrice: (state, action: PayloadAction<number>) => {
      console.log("setting BTC Price as : ", action.payload);
      state.btc_price = action.payload;
    },
    setNetwork: (state, action: PayloadAction<"mainnet" | "testnet">) => {
      console.log("setting network as : ", action.payload)
      state.network = action.payload;
    },
    setNewActivity: (state, action: PayloadAction<boolean>) => {
      state.new_activity = action.payload;
    },
  },
});

export const { setUser, setLastWallet, setBtcPrice, setNetwork, setNewActivity } =
  walletSlice.actions;
export default walletSlice.reducer;