// // app/api/v2/order/list-item.ts
// import { NextRequest, NextResponse } from "next/server";
// import { AddressTxsUtxo } from "@/types/runes";
// // import { runeUtxo, Wallet } from "@/models";
// // import { getCache, setCache } from "@/lib/cache";
// import { getBTCPriceInDollars } from "@/utils";
// import UtxoCollection from "@/models/UtxoCollection";
// import { addFinalScriptWitness, verifySignature } from "@/utils/marketplace/listing";
// interface OrderInput {
//   seller_receive_address: string;
//   price: number; //in sats
//   utxo_id: string;
//   maker_fee_bp?: number;
//   unsigned_listing_psbt_base64: string;
//   tap_internal_key: string;
//   listing: Listing;
//   signed_listing_psbt_base64: string;
// }
// interface Listing {
//   seller: Seller;
// }
// interface Seller {
//   maker_fee_bp?: number;
//   seller_ord_address: string;
//   seller_receive_address: string;
//   price: number;
//   tap_internal_key: string;
//   unsigned_listing_psbt_base64: string;
// }
// export async function POST(req: NextRequest) {
//   console.log("***** LIST ITEM API CALLED *****");
//   const orderInput: OrderInput = await req.json();
//   // Ensure orderInput contains all necessary fields
//   const requiredFields = [
//     "seller_receive_address",
//     "price",
//     "utxo_id",
//     "unsigned_listing_psbt_base64",
//     "tap_internal_key",
//     "signed_listing_psbt_base64",
//   ];
//   const missingFields = requiredFields.filter(
//     (field) => !Object.hasOwnProperty.call(orderInput, field)
//   );
//   if (missingFields.length > 0) {
//     return NextResponse.json(
//       {
//         ok: false,
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       },
//       { status: 400 }
//     );
//   }
//   try {
//     // Fetch the ordItem data
//     const ordItem: AddressTxsUtxo = await fetchLatestruneUtxoData(
//       orderInput.utxo_id
//     );
//     if (ordItem.ordinal_address && ordItem.vout && ordItem.value) {
//       console.log("adding final script witness");
//       const psbt = addFinalScriptWitness(orderInput.signed_listing_psbt_base64);
//       if (ordItem.ordinal_address.startsWith("bc1p")) {
//         const validSig = verifySignature(psbt);
//         if (!validSig) {
//           return NextResponse.json(
//             {
//               ok: false,
//               utxo_id: orderInput.utxo_id,
//               price: orderInput.price,
//               message: "Invalid signature",
//             },
//             { status: 500 }
//           );
//         }
//       }
//       const runeUtxo = await UtxoCollection.findOne({
//         utxo_id: ordItem.utxo_id,
//       });
//       if (runeUtxo) {
//         const type =
//           runeUtxo.listed && runeUtxo.signed_psbt
//             ? "update-listing"
//             : "list";
//         valueChecks(runeUtxo, ordItem);
//         const metaprotocol = runeUtxo.metaprotocol;
//         let listed_price_per_token = 0;
//         let listed_amount = 0;
//         let listed_token = "";
//         if (metaprotocol && metaprotocol.includes("cbrc-20:transfer")) {
//           const [tag, mode, tokenAmt] = runeUtxo.metaprotocol.split(":");
//           const [token, amt] = tokenAmt.split("=");
//           if (token) listed_token = token.trim().toLowerCase();
//           if (!isNaN(Number(amt))) listed_amount = Number(amt);
//           if (token && amt)
//             listed_price_per_token = orderInput.price / Number(amt);
//         }
//         // If the document already exists, update it with the new fields
//         runeUtxo.listed = true;
//         runeUtxo.listed_at = new Date();
//         runeUtxo.listed_price = orderInput.price;
//         runeUtxo.listed_price_per_token = listed_price_per_token;
//         runeUtxo.listed_token = listed_token;
//         runeUtxo.listed_amount = listed_amount;
//         runeUtxo.listed_seller_receive_address =
//           orderInput.seller_receive_address;
//         runeUtxo.signed_psbt = psbt;
//         runeUtxo.unsigned_psbt = orderInput.unsigned_listing_psbt_base64;
//         runeUtxo.listed_maker_fee_bp = orderInput.maker_fee_bp || 100;
//         runeUtxo.tap_internal_key = orderInput.tap_internal_key;
//         await runeUtxo.save();
//         let docObject = runeUtxo.toObject();
//         delete docObject.__v; // remove version key
//         delete docObject._id; // remove _id if you don't need it
//         console.log("Updated listing");
//         const user = await UtxoCollection.findOne({
//           ordinal_address: runeUtxo.ordinal_address,
//         });
//         let btcPrice = 0;
//         const btc_cache_key = "bitcoinPrice";
//         // const cache = await getCache(btc_cache_key);
//         // if (cache) btcPrice = cache;
//         // else {
//           btcPrice = (await getBTCPriceInDollars()) || 0;
//         //   await setCache(btc_cache_key, btcPrice, 120);
//         // }
//         console.log({ btcPrice });
        
//       }
//       // use orderInput object here
//       return NextResponse.json({
//         ok: true,
//         utxo_id: orderInput.utxo_id,
//         price: orderInput.price,
//         message: "Success",
//       });
//     } else {
//       throw Error("Ord Provider Unavailable");
//     }
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       {
//         ok: false,
//         utxo_id: orderInput.utxo_id,
//         price: orderInput.price,
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
// const valueChecks = (runeUtxo: AddressTxsUtxo, ordItem: AddressTxsUtxo) => {
//   let valid = true;
//   // Existing checks
//   if (runeUtxo.utxo_id !== ordItem.utxo_id) valid = false;
//   if (runeUtxo.value !== ordItem.value) valid = false;
//   // Additional checks
//   if (runeUtxo.ordinal_address !== ordItem.ordinal_address) valid = false;
//   if (runeUtxo.offset !== ordItem.offset) valid = false;
//   if (runeUtxo.location !== ordItem.location) valid = false;
//   if (!valid)
//     throw Error("The runeUtxo data is different on ord instance and DB");
// };