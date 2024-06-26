
import axios from "axios";

export const getRunesData = async (ordinalAddress: string, setRunesData: Function, setErrorMessage: Function) => {
  try {
    const response = await axios.get(`/api/displayRunes`, {
      params: { ordinal_address: ordinalAddress },
    });
    setRunesData(response.data);
    setErrorMessage("");
  } catch (error) {
    setErrorMessage("Error fetching data");
    console.error("Error fetching data:", error);
  }
};
