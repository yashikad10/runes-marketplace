"use server";
import axios from "axios";

interface User {
  _id: string; // Assuming ObjectId is imported or defined somewhere
  wallet: string;
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  runes: {
    rune_name: string;
    rune_amount: number;
    divisibility: number;
  }[];
  __v: number;
}

interface DisplayRunesResponse {
  success: boolean;
  user: User;
}
export async function getRunesData(
  ordinal_address: string
): Promise<{ data?: DisplayRunesResponse; error: string | null } | undefined> {
  console.log(ordinal_address,"getRunesData")
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/api/display-runes`;
    const response = await axios.get(url,{
      params: { ordinal_address },
    });
    // console.log(response,"**response get runes display***")
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
