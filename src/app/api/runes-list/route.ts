
import dbConnect from "@/lib/dbConnect";
import Utxos from "@/models/Utxos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
     await dbConnect();

     const data= await Utxos.find({listed: true})
     .select("-signed_psbt -unsigned_psbt")

     console.log(data,"data*******")

     return NextResponse.json({data , success: true})



  } catch {
    return NextResponse.json({ message: "SERVER ERROR" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

