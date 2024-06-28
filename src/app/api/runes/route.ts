import dbConnect from "@/lib/dbConnect";
import UserCollection from "@/models/UserCollection";
import UtxoCollection from "@/models/UtxoCollection";
import { aggregateRuneAmounts, getRunesUtxos } from "@/utils/runes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { cardinal_address, ordinal_address, cardinal_pubkey, wallet } = data;

    const dataToSave = {
      cardinal_address,
      ordinal_address,
      cardinal_pubkey,
      wallet,
      runes: [],
    };
    console.log(data, "---------------------user runes");
    await dbConnect()
    const existingUser = await UserCollection.findOne({
      $or: [{ cardinal_address }, { ordinal_address }],
    });

    if (!existingUser) {
      await UserCollection.create(dataToSave);
      console.log("User data saved:", dataToSave);
    } else {
      console.log("User data already exists, not saving again.");
    }

    const runesUtxos = await getRunesUtxos(ordinal_address);

    if (!runesUtxos || runesUtxos.length === 0) {
      return NextResponse.json({ message: "No relevant UTXOs found" });
    }

    const aggregateRuneAmount = aggregateRuneAmounts(runesUtxos);

    const runesDataToSave = aggregateRuneAmount.map((rune) => ({
      rune_name: rune.name,
      rune_amount: rune.amount,
      divisibility: rune.divisibility
    }));

    console.log("Runes data to save:", runesDataToSave);

    await dbConnect();

    const allRuneUtxo = runesUtxos.map((utxo) => {
      const runes = Object.entries(utxo.rune).map(([key, value]) => {
        const runeValue = value as {
          name: string;
          amount: number;
          divisibility: number;
          symbol: string;
        };
        console.log({ runeValue });

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

    console.log(allRuneUtxo);

    for (const utxo of allRuneUtxo) {
      const existingUtxo = await UtxoCollection.findOne({
        txid: utxo.txid,
        vout: utxo.vout,
      });

      if (!existingUtxo) {
        await UtxoCollection.create(utxo);
        console.log("UTXO data saved:", utxo);
      } else {
        console.log("UTXO data already exists, not saving again.");
      }
    }
    const updateResult = await UserCollection.updateMany(
      {},
      { $set: { runes: runesDataToSave } } // Set the runes field to the new data
    );

    console.log("Document updated:", updateResult);

    return NextResponse.json({ message: "done" });
  } catch (err: any) {
    console.error("Error in POST request handler:", err);
    return NextResponse.json({ message: "SERVER ERROR" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";


// export const config = {
//   api: {
//     runtime: "edge",
//   },
// };
