
import axios from "axios";

export const getRunesData = async (ordinal_address: string) => {
  try {
    const response = await axios.get(`/api/displayRunes`, {
      params: { ordinal_address },
    });
    console.log(response,"*************")
    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      // You might want to customize this message or extract more specific info from the response
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};




// export async function getRunes(
//   ordinal_address: string
// ): Promise<{ data?: any; error: string | null } | undefined> {
//   try {
//     // console.log(ordinal_address,"------------helper wallet")
//     let url = `/api/displayRunes`;
//     const response = await axios.get(url,{
//       params:{
//         ordinal_address
//       }
//     })
// // console.log(response,"--------response helper")
    // if (response.status === 200) {
    //   return { data: response.data, error: null };
    // } else {
    //   // You might want to customize this message or extract more specific info from the response
    //   return { error: `Request failed with status code: ${response.status}` };
    // }
//   } catch (error:any) {
//     // Assuming error is of type any. You might want to add more specific type handling
//     return { error: error?.message || "An unknown error occurred" };
//   }
// }
