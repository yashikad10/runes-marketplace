import dbConnect from "@/lib/dbConnect";
import Utxos from "@/models/Utxos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const runeName = searchParams.get("rune_name");
    console.log(runeName, "runeName*****");

    if (!runeName) {
      return NextResponse.json(
        { message: "Rune name not provided" },
        { status: 400 }
      );
    }

    const decodedRune = decodeURIComponent(runeName);

    const users = await Utxos.find({
      "runes.name": decodedRune,
    });

    

    console.log(users, "&&&&&&&&");

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: "No users found with the specified rune name" },
        { status: 404 }
      );
    }

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("Error in GET request handler:");
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
