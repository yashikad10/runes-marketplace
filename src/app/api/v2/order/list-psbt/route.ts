import { NextRequest, NextResponse } from "next/server";
import {
  getSellerOrdOutputValue,
  getTxHexById,
  toXOnly,
} from "@/utils/marketplace/listing"
import UtxoCollection, { Utxo } from "@/models/UtxoCollection";
import dbConnect from "@/lib/dbConnect";
import * as bitcoin from "bitcoinjs-lib";
import secp256k1 from "@bitcoinerlab/secp256k1";
bitcoin.initEccLib(secp256k1);

interface OrderInput {
  utxo_id: string;
  price: number; // in sats
  wallet: "Leather" | "Xverse" | "MagicEden" | "Unisat";
  receive_address: string;
  publickey: string;
  maker_fee_bp?: number; // in sats
}

function validateRequest(req: NextRequest, body: OrderInput): string[] {
  const requiredFields = [
    "utxo_id",
    "price",
    "wallet",
    "receive_address",
    "publickey",
  ];
  const missingFields = requiredFields.filter(
    (field) => !Object.hasOwnProperty.call(body, field)
  );
  return missingFields;
}
// Fetch and process the runeItem data
async function processRuneItem(
  utxo_id: string,
  ordinal_address: string,
  price: number, //in sats   
  publickey: string,
  wallet: string,
  maker_fee_bp?: number
) {
  let psbt = new bitcoin.Psbt({ network: undefined });
  
  await dbConnect();

  const runeItem: Utxo | null = await UtxoCollection.findOne({
    utxo_id,
  });
  console.log(runeItem, "runeItem");
  if (!runeItem) throw new Error("Item hasn't been added to our DB");
  
  const taprootAddress =
    runeItem && runeItem?.ordinal_address && runeItem?.ordinal_address.startsWith("bc1p");
  if (runeItem.ordinal_address && runeItem.utxo_id && runeItem.value) {
    const [ordinalUtxoTxId, ordinalUtxoVout] = runeItem.utxo_id.split(":");
    // Define the input for the PSBT
    const tx = bitcoin.Transaction.fromHex(await getTxHexById(ordinalUtxoTxId));
    if (!publickey) {
      for (const utxo_id in tx.outs) {
        try {
          tx.setWitness(parseInt(utxo_id), []);
        } catch {}
      }
    }
    const input: any = {
      hash: ordinalUtxoTxId,
      index: parseInt(ordinalUtxoVout),
      ...(!taprootAddress && { nonWitnessUtxo: tx.toBuffer() }),
      witnessUtxo: tx.outs[Number(ordinalUtxoVout)],
      sighashType:
        bitcoin.Transaction.SIGHASH_SINGLE |
        bitcoin.Transaction.SIGHASH_ANYONECANPAY,
    };
    if (taprootAddress) {
      input.tapInternalKey = toXOnly(
        tx.toBuffer().constructor(publickey, "hex")
      );
    }
    console.log({ tapInternalKey: input.tapInternalKey, publickey, runeItemvalue: runeItem.value });

    psbt.addInput(input);
    psbt.addOutput({
      address: ordinal_address,
      value: getSellerOrdOutputValue(price, maker_fee_bp, runeItem.value),
    });
    const unsignedPsbtBase64 = psbt.toBase64();
    return {
      unsignedPsbtBase64,
      tap_internal_key: taprootAddress ? input.tapInternalKey.toString() : "",
    };
  } else {
    console.debug({
      address: runeItem.ordinal_address,
      output: runeItem.utxo_id,
      output_value: runeItem.value,
    });
    throw new Error("Ord Provider Unavailable");
  }
}
export async function POST(
  req: NextRequest,
  res: NextResponse<{
    ok: Boolean;
    tokenId?: string;
    price?: number;
    receive_address?: string;
    unsigned_psbt_base64?: string;
    message: string;
  }>
) {
  console.log("***** CREATE UNSIGNED PSBT API CALLED *****");
  try {
    const body: OrderInput = await req.json();
    const missingFields = validateRequest(req, body);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { unsignedPsbtBase64, tap_internal_key } = await processRuneItem(
      body.utxo_id,
      body.receive_address,
      Math.floor(body.price),
      body.publickey,
      body.wallet,
      body.maker_fee_bp
    );
    return NextResponse.json({
      ok: true,
      utxo_id: body.utxo_id,
      price: Math.floor(body.price),
      receive_address: body.receive_address,
      unsigned_psbt_base64: unsignedPsbtBase64,
      tap_internal_key,
      message: "Success",
    });
  } catch (error: any) {
    console.log(error, "error");
    if (!error?.status) console.error("Catch Error: ", error);
    return NextResponse.json(
      { message: error.message || error || "Error fetching inscriptions" },
      { status: error.status || 500 }
    );
  }
}