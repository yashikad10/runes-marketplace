import axios from "axios";

// Function to convert price from satoshi to Bitcoin
export function convertSatToBtc(priceInSat: number): number {
  return priceInSat / 1e8; // 1 BTC = 100,000,000 SAT
}

// Function to convert price from satoshi to Bitcoin
export function convertBtcToSat(priceInSat: number): number {
  return priceInSat * 1e8; // 1 BTC = 100,000,000 SAT
}

export function base64ToHex(str: string) {
  return atob(str)
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

export async function getBTCPriceInDollars() {
  try {
    const response = await fetch(
      "https://api.coindesk.com/v1/bpi/currentprice/BTC.json"
    );
    const data = await response.json();
    const priceInDollars = data.bpi.USD.rate_float;
    return priceInDollars;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    return null;
  }
}

// export function shortenString(str: string, length = 4): string {
//   console.log({str})
//   if (str.length <= 8) {
//     return str;
//   }
//   const start = str.slice(0, length);
//   const end = str.slice(-length);
//   return `${start}...${end}`;
// }

export const hexToBase64 = (hexString: string) => {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }

  const byteArray = Array.from(bytes);

  return btoa(String.fromCharCode.apply(null, byteArray));
};

export const isHex = (str: string) => /^[0-9a-fA-F]+$/.test(str);

export const isBase64 = (str: string) => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

async function getUtxosByAddress(address: string, url: string) {
  const { data } = await axios.get(`${url}/address/${address}/utxo`);
  return data;
}

async function doesUtxoContainInscription(
  utxo: any,
  url: string
): Promise<boolean> {
  if (!url) {
    // If the API URL is not set, return true as per your requirement
    console.warn("API provider URL is not defined in environment variables");
    return true;
  }

  try {
    const response = await axios.get(
      `${url}/output/${utxo.txid}:${utxo.vout}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.data && Array.isArray(response.data.inscriptions)) {
      return response.data.inscriptions.length > 0;
    } else {
      // If the data is not in the expected format, return true
      console.warn("Invalid data structure received from API");
      return true;
    }
  } catch (error) {
    // In case of any API error, return true
    console.error("Error in doesUtxoContainInscription:", error);
    return true;
  }
}

export async function countDummyUtxos(
  address: string,
  mempool_url: string,
  ord_url: string
): Promise<number> {
  let counter = 0;

  const utxos = await getUtxosByAddress(address, mempool_url);

  for (const utxo of utxos) {
    if (await doesUtxoContainInscription(utxo, ord_url)) {
      continue;
    }

    if (utxo.value >= 580 && utxo.value <= 1000) {
      counter++;

      if (counter === 20) {
        break;
      }
    }
  }

  return counter;
}

export function convertSatoshiToBTC(satoshi: number) {
  const SATOSHI_IN_ONE_BTC = 100000000;
  return satoshi / SATOSHI_IN_ONE_BTC;
}
export function convertSatoshiToUSD(satoshi: number, btcPrice: number) {
  const SATOSHI_IN_ONE_BTC = 100000000;
  return (satoshi / SATOSHI_IN_ONE_BTC) * btcPrice;
}

export async function fetchLatestUtxoData(utxo_id: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_PROVIDER}/output/${utxo_id}`;
  console.log("**************url:", url);
  try {
    // console.log("------------before response");
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    console.log(response,"------------response")
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch data: ${error.response.data}`);
  }
}

const mempoolNetwork = () =>
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "" : "testnet/";

export const getMaxFeeRate = async () => {
  try {
    const { data } = await axios.get(
      `https://mempool.space/${mempoolNetwork()}api/v1/fees/recommended`
    );
    if ("fastestFee" in data) {
      return data.fastestFee;
    }
    throw new Error("fastestFee not found in response data");
  } catch (error) {
    console.error(error);
    return "error -- site down or data format changed";
  }
};
