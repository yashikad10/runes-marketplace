import { UTXO } from "@/types";
import { AddressTxsUtxo } from "@/types/runes";
import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
type TxId = string | number;
const txHexByIdCache: Record<TxId, string> = {};
// getting hex by id
export async function getTxHexById(txId: TxId): Promise<string> {
  if (!txHexByIdCache[txId]) {
    const url =
      process.env.NEXT_PUBLIC_NETWORK === "testnet"
        ? `https://mempool.space/testnet/api/tx/${txId}/hex`
        : `https://mempool-api.ordinalnovus.com/tx/${txId}/hex`;
    txHexByIdCache[txId] = await fetch(url).then((response) => response.text());
  }
  console.log(txHexByIdCache[txId], "----------txHexByIdCache[txId]");
  return txHexByIdCache[txId];
}
export const toXOnly = (pubKey: string | any[]) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

export function getSellerOrdOutputValue(
  price: number,
  makerFeeBp: number | undefined,
  prevUtxoValue: number
): number {
  if (makerFeeBp === undefined || makerFeeBp === null) {
    console.log(
      "makerFeeBp was undefined or null, setting to default 100 basis points"
    );
    makerFeeBp = 100; // if makerFeeBp is undefined or null, set it to 100 basis points (1%)
  }
  console.log("makerFeeBp: ", makerFeeBp);
  const makerFeePercent = makerFeeBp / 10000; // converting basis points to percentage
  console.log("makerFeePercent: ", makerFeePercent);
  const makerFee = Math.floor(price * makerFeePercent);
  console.log("Maker's fee: ", makerFee);
  const outputValue = price - makerFee + prevUtxoValue;
  console.log("Output Value: ", outputValue);
  return Math.floor(outputValue);
}

export function validatePsbt(signedPsbt: string) {
  try {
    // Initialize the bitcoinjs-lib library with secp256k1
    bitcoin.initEccLib(ecc);
    let currentPsbt: any;
    if (/^[0-9a-fA-F]+$/.test(signedPsbt)) {
      // If the input is in hex format, create Psbt from hex
      currentPsbt = bitcoin.Psbt.fromHex(signedPsbt);
    } else {
      // If the input is in base64 format, create Psbt from base64
      currentPsbt = bitcoin.Psbt.fromBase64(signedPsbt);
    }
    console.log(currentPsbt, "CPSBT");
    console.log(
      currentPsbt.validateSignaturesOfInput(0, schnorrValidator),
      "CURRENTPSBT"
    );
    const validator = currentPsbt.data.inputs[0].tapInternalKey
      ? schnorrValidator
      : ecdsaValidator;
    const isValid = currentPsbt.validateSignaturesOfInput(0, validator);
    return isValid;
  } catch (error) {
    // Handle the error here
    console.error("Error while validating PSBT:", error);
    // You can return false, throw a custom error, or handle the error in any way you prefer.
    return false;
  }
}
function schnorrValidator(
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer
): boolean {
  return ecc.verifySchnorr(msghash, pubkey, signature);
}
function ecdsaValidator(
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer
): boolean {
  return ecc.verify(msghash, signature, pubkey);
}

export async function mapUtxos(
  utxosFromMempool: AddressTxsUtxo[]
): Promise<UTXO[]> {
  const ret: UTXO[] = [];
  for (const utxoFromMempool of utxosFromMempool) {
    const txHex = await getTxHexById(utxoFromMempool.txid);
    ret.push({
      txid: utxoFromMempool.txid,
      vout: utxoFromMempool.vout,
      value: utxoFromMempool.value,
      status: utxoFromMempool.status,
      tx: bitcoin.Transaction.fromHex(txHex),
    });
  }
  return ret;
}

export async function getUtxosByAddress(address: string) {
  const url =
    process.env.NEXT_PUBLIC_NETWORK === "testnet"
      ? `https://mempool.space/testnet/api/address/${address}/utxo`
      : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
  const { data } = await axios.get(url);
  return data;
}

export async function doesUtxoContainInscription(
  utxo: AddressTxsUtxo
): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
    ? "http://192.168.1.17:8080"
    : "https://ord.ordinalnovus.com/api";
  // console.log({ apiUrl }, "ins");
  if (!apiUrl) {
    // If the API URL is not set, return true as per your requirement
    console.warn("API provider URL is not defined in environment variables");
    return true;
  }
  try {
    const url = `${apiUrl}/output/${utxo.txid}:${utxo.vout}`; //
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    // console.log({ url, data: response.data });
    if (response.data && Array.isArray(response.data.inscriptions)) {
      return response.data.inscriptions.length > 0;
    } else if (response.data.length === 0) {
      // If the data is empty array, return false
      console.warn("Empty Array is returned");
      return false;
    } else {
      return true;
    }
  } catch (error) {
    // In case of any API error, return true
    console.error("Error in doesUtxoContainInscription:", error);
    return true;
  }
}

export async function doesUtxoContainRunes(
  utxo: AddressTxsUtxo
): Promise<boolean> {
  const cacheKey = `rune_utxo:${utxo.txid}:${utxo.vout}`;
  try {
    // First, try to retrieve data from cache
    // const cachedRunes = await getCache(cacheKey);
    // if (cachedRunes !== null) {
    //   console.log(
    //     "Returning runes data from cache...",
    //     // cachedRunes,
    //     typeof cachedRunes
    //   );
    //   return cachedRunes; // Ensure the string from the cache is converted back to boolean
    // }

    const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
      ? "http://192.168.1.17:8080/"
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
    if (response.data.runes?.length) {
      // await setCache(cacheKey, response.data.runes, 172800);
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

export function calculateTxFee(
  vinsLength: number,
  voutsLength: number,
  feeRate: number,
  inputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
  outputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
  includeChangeOutput: 0 | 1 = 1,
  changeAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh" = "pwpkh"
): number {
  const inputSizes = {
    pwpkh: { base: 31, witness: 107 },
    taproot: { base: 43, witness: 65 },
    p2sh_p2wpkh: { base: 58, witness: 107 },
  };
  const outputSizes = {
    pwpkh: 31,
    taproot: 43,
    p2sh_p2wpkh: 32,
  };
  // Calculate transaction overhead, considering whether any input uses SegWit
  function getTxOverhead(
    vins: number,
    vouts: number,
    isSegWit: boolean
  ): number {
    return (
      10 + // Basic non-witness transaction overhead (version, locktime)
      getSizeOfVarInt(vins) + // Input count
      getSizeOfVarInt(vouts) + // Output count
      (isSegWit ? 2 : 0)
    ); // SegWit marker and flag only if SegWit inputs are present
  }
  let totalBaseSize = getTxOverhead(
    vinsLength,
    voutsLength,
    inputAddressType.startsWith("p2")
  );
  let totalWitnessSize = 0;
  // Calculate total base size and witness size for inputs
  for (let i = 0; i < vinsLength; i++) {
    totalBaseSize += inputSizes[inputAddressType].base;
    totalWitnessSize += inputSizes[inputAddressType].witness;
  }
  // Calculate total base size for outputs
  totalBaseSize += voutsLength * outputSizes[outputAddressType];
  // Include change output if specified
  if (includeChangeOutput) {
    totalBaseSize += outputSizes[changeAddressType];
  }
  // Calculate total vbytes considering witness discount for SegWit inputs
  const totalVBytes = totalBaseSize + Math.ceil(totalWitnessSize / 4);
  const fee = totalVBytes * feeRate;
  console.log(
    `Final Transaction Size: ${totalVBytes} vbytes, Fee Rate: ${feeRate}, Calculated Fee: ${fee}`,
    { totalVBytes, feeRate, fee }
  );
  return fee;
}

function getSizeOfVarInt(length: number): number {
  if (length < 253) {
    return 1;
  } else if (length < 65536) {
    return 3;
  } else if (length < 4294967296) {
    return 5;
  } else {
    return 9; // Handling very large counts
  }
}

export const satsToDollars = async (sats: number) => {
  // Fetch the current bitcoin price from session storage
  const bitcoin_price = await getBitcoinPriceFromCoinbase();
  // Convert satoshis to bitcoin, then to USD
  const value_in_dollars = (sats / 100_000_000) * bitcoin_price;
  return value_in_dollars;
};

export const getBitcoinPriceFromCoinbase = async () => {
  var { data } = await axios.get(
    "https://api.coinbase.com/v2/prices/BTC-USD/spot"
  );
  var price = data.data.amount;
  return price;
};
