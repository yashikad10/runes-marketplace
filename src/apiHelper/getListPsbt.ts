
import axios from "axios";

export const getListPsbt = async () => {
  try {
    const response = await axios.post(`/api/v2/order/list-psbt`)
    console.log(response,"------")
    
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
