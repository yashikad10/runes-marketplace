import dbConnect from "@/lib/dbConnect";
import Users from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("*******display runes route call ********")
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const ordinal_address = searchParams.get("ordinal_address");
    console.log(ordinal_address,"***********display inside runes");

    if (!ordinal_address) {
      return NextResponse.json(
        { message: "Ordinal address is required" },
        { status: 400 }
      );
    }

    const user = await Users.findOne({ ordinal_address });
    console.log(user, "-----------------user inside route display rune");
    if (!user) {
      return NextResponse.json(
        { message: "No user found with the given ordinal address" },
        { status: 404 }
      );
    }

    return NextResponse.json({user, success: true});
  } catch (err) {
    console.error("Error in GET request handler:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

