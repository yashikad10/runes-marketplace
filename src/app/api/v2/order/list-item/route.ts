// app/api/v2/order/list-item.ts
import { NextRequest, NextResponse } from "next/server";
import {
  addFinalScriptWitness,
  verifySignature,
} from "@/utils/marketplace/listing";
import dbConnect from "@/lib/dbConnect";
import UtxoCollection from "@/models/UtxoCollection";

interface OrderInput {
  value: number;
  vout: number;
  ordinal_address: string;
  seller_receive_address: string;
  price: number; //in sats
  utxo_id: string;
  maker_fee_bp?: number;
  unsigned_listing_psbt_base64: string;
  tap_internal_key: string;
  listing: Listing;
  signed_listing_psbt_base64: string;
}
interface Listing {
  seller: Seller;
}
interface Seller {
  maker_fee_bp?: number;
  seller_ord_address: string;
  seller_receive_address: string;
  price: number;
  tap_internal_key: string;
  unsigned_listing_psbt_base64: string;
}
export async function POST(req: NextRequest) {
  console.log("***** LIST ITEM API CALLED *****");
  const orderInput: OrderInput = await req.json();
  console.log(orderInput,"post orderInput*****")
  // Ensure orderInput contains all necessary fields
  const requiredFields = [
    "seller_receive_address",
    "price",
    "utxo_id",
    "unsigned_listing_psbt_base64",
    "tap_internal_key",
    "signed_listing_psbt_base64",
  ];
  const missingFields = requiredFields.filter(
    (field) => !Object.hasOwnProperty.call(orderInput, field)
  );
  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      },
      { status: 400 }
    );
  }
  try {
      console.log("adding final script witness -> ", orderInput.signed_listing_psbt_base64);

      const psbt = addFinalScriptWitness(orderInput.signed_listing_psbt_base64);
      if (orderInput.seller_receive_address.startsWith("bc1p")) {
        const validSig = verifySignature(psbt);
        if (!validSig) {
          return NextResponse.json(
            {
              ok: false,
              utxo_id: orderInput.utxo_id,
              price: orderInput.price,
              message: "Invalid signature",
            },
            { status: 500 }
          );
        }
      }
      await dbConnect();

      const runeUtxo = await UtxoCollection.findOne({
        utxo_id: orderInput.utxo_id,
      });

      console.log(orderInput,"orderInput!!")
      if (runeUtxo) {
        let listed_price_per_token = 0;
        let totalRunes = runeUtxo.runes[0].amount / Math.pow(10, runeUtxo.runes[0].divisibility)
        if (runeUtxo.runes && runeUtxo.runes.length > 0) {
          listed_price_per_token = totalRunes/orderInput.price;
        }
        console.log(listed_price_per_token,"listed price per token")
        // Update the found document with new fields
        runeUtxo.listed = true;
        runeUtxo.listed_at = new Date();
        runeUtxo.listed_price = orderInput.price || 0; // Set default value if price is not provided
        runeUtxo.listed_price_per_token = listed_price_per_token; // Set to appropriate value
        runeUtxo.listed_seller_receive_address = orderInput.seller_receive_address || '';
        runeUtxo.signed_psbt = orderInput.signed_listing_psbt_base64;
        runeUtxo.unsigned_psbt = orderInput.unsigned_listing_psbt_base64 || '';
        runeUtxo.listed_maker_fee_bp = orderInput.maker_fee_bp || 100; // Default to 100 if not provided
  
        // Save the updated document
        const updatedUtxo = await runeUtxo.save();
        console.log("Utxo updated successfully:", updatedUtxo);
        console.log(runeUtxo,"runeUtxo******")
        let docObject = runeUtxo.toObject();
        delete docObject.__v; // remove version key
        delete docObject._id; // remove _id if you don't need it
        console.log("Updated listing");
        
      }
      // use orderInput object here
      return NextResponse.json({
        ok: true,
        utxo_id: orderInput.utxo_id,
        price: orderInput.price,
        message: "Success",
      });
  
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        utxo_id: orderInput.utxo_id,
        price: orderInput.price,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";

