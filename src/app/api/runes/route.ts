import dbConnect from "@/lib/dbConnect";
import Users from "@/models/Users";
import Utxos from "@/models/Utxos";
import { aggregateRuneAmounts, getRunesUtxos } from "@/utils/runes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { cardinal_address, ordinal_address, cardinal_pubkey, wallet } = data;

    // console.log(data,"------------------data")
    const dataToSave = {
      cardinal_address:data.wallet_details.cardinal_address,
      ordinal_address:data.wallet_details.ordinal_address,
      cardinal_pubkey:data.wallet_details.cardinal_pubkey,
      wallet:data.wallet_details.wallet,
      runes: [],
    };

    // console.log(dataToSave,"------------data to save")
    // console.log(data.wallet_details.ordinal_address, "---------------------user runes ordinal address");
    const runesUtxos = await getRunesUtxos(data.wallet_details.ordinal_address);
    await dbConnect()

    const existingUser = await Users.findOne({
      $or: [{ cardinal_address }, { ordinal_address }],
    });

    if (!existingUser) {
      await Users.create(dataToSave);
      console.log("User data saved:", dataToSave);
    } else {
      console.log("User data already exists, not saving again.");
    }

    if (!runesUtxos || runesUtxos.length === 0) {
      return NextResponse.json({ message: "No relevant UTXOs found" });
    }

    const aggregateRuneAmount = aggregateRuneAmounts(runesUtxos);

    const runesDataToSave = aggregateRuneAmount.map((rune) => ({
      rune_name: rune.name,
      rune_amount: rune.amount,
      divisibility: rune.divisibility
    }));

    // console.log("Runes data to save:", runesDataToSave);

    await dbConnect();

    const allRuneUtxo = runesUtxos.map((utxo) => {
      const runes = Object.entries(utxo.rune).map(([key, value]) => {
        const runeValue = value as {
          name: string;
          amount: number;
          divisibility: number;
          symbol: string;
        };
        // console.log({ runeValue });

        return {
          name: key,
          amount: runeValue.amount,
          divisibility: runeValue.divisibility,
          symbol: runeValue.symbol,
        };
      });
      const { rune, ...rest } = utxo;
      return { ...rest, runes };
    });

    // console.log(allRuneUtxo);
    
    for (const utxo of allRuneUtxo) {
      if (utxo.runes.length === 0) {
        console.log("UTXO has no runes, skipping save:", utxo);
        continue;
      }

      const existingUtxo = await Utxos.findOne({
        txid: utxo.txid,
        vout: utxo.vout,
      });

      if (!existingUtxo) {
        await Utxos.create(utxo);
        console.log("UTXO data saved:", utxo);
      } else {
        console.log("UTXO data already exists, not saving again.");
      }
    }
    // for (const utxo of allRuneUtxo) {
    //   const existingUtxo = await Utxos.findOne({
    //     txid: utxo.txid,
    //     vout: utxo.vout,
    //   });

    //   if (!existingUtxo) {
    //     await Utxos.create(utxo);
    //     console.log("UTXO data saved:", utxo);
    //   } else {
    //     console.log("UTXO data already exists, not saving again.");
    //   }
    // }
    const updateResult = await Users.updateMany(
      {},
      { $set: { runes: runesDataToSave } } 
    );

    console.log("Document updated:", updateResult);

    return NextResponse.json({ message: "done" , success: true});
  } catch (err: any) {
    console.error("Error in POST request handler:", err);
    return NextResponse.json({ message: "SERVER ERROR" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

