import dbConnect from "@/lib/dbConnect";
import UserCollection from "@/models/UserCollection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const ordinal_address = searchParams.get("ordinal_address");
    console.log(ordinal_address);

    if (!ordinal_address) {
      return NextResponse.json(
        { message: "Ordinal address is required" },
        { status: 400 }
      );
    }

    const user = await UserCollection.findOne({ ordinal_address }).exec();

    if (!user) {
      return NextResponse.json(
        { message: "No user found with the given ordinal address" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
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
