import dbConnect from "@/lib/dbConnect";
import UtxoCollection from "@/models/UtxoCollection";
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

    const users = await UtxoCollection.find({
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
    console.error("Error in GET request handler:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export const config = {
  api: {
    runtime: "edge",
  },
};
