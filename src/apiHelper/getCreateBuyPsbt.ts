"use server"

import axios from "axios";

interface PsbtData {
  unsigned_psbt_base64: string; // Adjust the type based on your actual data type
  input_length: number;
  utxo_id: string;
  receive_address: string;
  pay_address: string;
  for: string;
}

interface CreateBuyPsbtResponse {
  success: boolean;
  message: string;
  result: PsbtData;
}

export async function getCreateBuyPsbt(
  utxo_id: string,
  pay_address: string,
  receive_address: string,
  publickey: string,
  fee_rate: number,
  wallet: string,
  price: number

): Promise<{ data?: CreateBuyPsbtResponse; error: string | null } | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/v2/order/create-buy-psbt`;
    const response = await axios.post(url, {
      utxo_id,
      pay_address,
      receive_address,
      publickey,
      fee_rate,
      wallet,
      price,
    });
    console.log(response,"******create buy psbt response***")

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
