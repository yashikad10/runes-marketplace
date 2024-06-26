import axios from "axios";
import { AddressTxsUtxo } from "@/types/runes";
import { AssetMap } from "@/types/allRunes";
import { address } from "bitcoinjs-lib";
const DUMMY_UTXO_VALUE = 1000;

export async function getRunesUtxos(payment_address: string) {
  let allUtxos: AddressTxsUtxo[];
  let runesUtxos: AddressTxsUtxo[] | undefined;
  try {
    allUtxos = await getUtxosByAddress(payment_address); //get users all utxo
  } catch (e) {
    console.error(e);
    return Promise.reject("Mempool error");
  }

  try {
    runesUtxos = await selectRunesUtxos(
      allUtxos, // all utxo's
      payment_address
    );

    // console.log({
    //   allUtxos: allUtxos.length,
    //   runesUtxos: runesUtxos && runesUtxos.length,
    // });
    return runesUtxos;
  } catch (err: any) {
    throw Error(err);
  }
}

export async function doesUtxoContainRunes(utxo: AddressTxsUtxo): Promise<any> {
  const cacheKey = `rune_utxo:${utxo.txid}:${utxo.vout}`;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
      ? "http://64.20.33.102:56018/"
      : `${process.env.NEXT_PUBLIC_PROVIDER}/`;

    if (!apiUrl) {
      console.warn("API provider URL is not defined in environment variables");
      return true; // Defaulting to true if the API URL isn't set
    }

    const response = await axios.get(
      `${apiUrl}output/${utxo.txid}:${utxo.vout}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    // Store result in cache if no runes are found
    if (response.data.runes) {
      // await setCache(cacheKey, response.data.runes, 172800);
      // console.log(response.data.runes);
      return response.data.runes;
    } else {
      // await setCache(cacheKey, false, 172800); // Store the information for 2 days (172800 seconds)
      return false;
    }
  } catch (error) {
    console.error("Error in doesUtxoContainRunes:", error);
    return true; // Defaulting to true in case of an error
  }
}

async function getUtxosByAddress(address: string) {
  const url =
    process.env.NEXT_PUBLIC_NETWORK === "testnet"
      ? `https://mempool.space/testnet/api/address/${address}/utxo`
      : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
  const { data } = await axios.get(url);
  //console.log(data,"-------------data-----------")
  return data;
}

export async function selectRunesUtxos(utxos: AddressTxsUtxo[], payment_address: string) {
  const selectedUtxos: any = [];

  // Sort descending by value, and filter out dummy utxos
  utxos = utxos.sort((a, b) => b.value - a.value);

  for (const utxo of utxos) {
    const rune = await doesUtxoContainRunes(utxo);
    if (rune) {
      utxo.rune = rune;
      utxo.ordinal_address= `${payment_address}`;
      utxo.utxo_id= `${utxo.txid}:${utxo.vout}`;
      selectedUtxos.push(utxo);
    }
  }

  return selectedUtxos;
}

export const extractNameAndAmount = (rune: AssetMap) => {
  const entries = Object.entries(rune);
  const result = entries.map(([name, details]) => ({
    name,
    amount: details.amount,
  }));
  return result;
};

export const aggregateRuneAmounts = (runesUtxos: AddressTxsUtxo[]) => {
  const runeMap = new Map<string, number>();

  for (const runesUtxo of runesUtxos) {
    const rune = runesUtxo.rune;
    const runeDetails = extractNameAndAmount(rune);

    for (const { name, amount } of runeDetails) {
      if (runeMap.has(name)) {
        runeMap.set(name, runeMap.get(name)! + amount);
      } else {
        runeMap.set(name, amount);
      }
    }
  }

  // Convert the Map to an array of objects
  const result = Array.from(runeMap, ([name, amount]) => ({ name, amount }));
  return result;
};
