"use server";
import axios from "axios";
interface RunesResponse {
  success: boolean;
  message: string;
}

interface WalletTypes {
  cardinal_address?: string;
  ordinal_address?: string;
  cardinal_pubkey?: string;
  wallet?: any;
  connected:boolean;
}
export async function getRunes(
  wallet_details: WalletTypes 
): Promise<{ data?: RunesResponse; error: string | null } | undefined> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/api/runes`;
    const response = await axios.post(url,{
      wallet_details
      
    });
    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      // You might want to customize this message or extract more specific info from the response
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error:any) {
    // Assuming error is of type any. You might want to add more specific type handling
    return { error: error?.message || "An unknown error occurred" };
  }
}