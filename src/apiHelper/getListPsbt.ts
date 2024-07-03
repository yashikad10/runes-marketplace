"use server";
import axios from "axios";

interface BuyPsbtResult {
  utxo_id?: string ;
  price?: number;
  receive_address?: string;
  unsigned_psbt_base64?: string;
  tap_internal_key?: string; // Adjust the type as per actual data type of tap_internal_key
}

interface ListPsbtResponse {
  ok: boolean;
  result: BuyPsbtResult;
}

interface OrderData {
  utxo_id: string;
  receive_address: string;
  price: number;
  divisibility: number;
  publickey: string;
  wallet: string;
  maker_fee_bp: number;
}

export async function getListPsbt(
  params: OrderData
): Promise<{ data?: ListPsbtResponse; error: string | null } | undefined> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/api/v2/order/list-psbt`;

    const response = await axios.post(url, {
      utxo_id: params.utxo_id,
      price: params.price,
      wallet: params.wallet,
      receive_address: params.receive_address,
      publickey: params.publickey,
    });
    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      // You might want to customize this message or extract more specific info from the response
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error: any) {
    // Assuming error is of type any. You might want to add more specific type handling
    return { error: error?.message || "An unknown error occurred" };
  }
}
