
import dbConnect from "@/lib/dbConnect";
import UtxoCollection from "@/models/UtxoCollection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
     await dbConnect();

     const data= await UtxoCollection.find({listed: true})
     .select("listed_price runes.name runes.amount runes.divisibility ")

     console.log(data,"data*******")

     return NextResponse.json({data , success: true})



  } catch {
    return NextResponse.json({ message: "SERVER ERROR" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

