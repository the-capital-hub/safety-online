import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Promocode from "@/model/Promocode.js";

export async function GET() {
        try {
                await dbConnect();

                const now = new Date();
                const coupons = await Promocode.find({
                        published: true,
                        recommended: true,
                        status: "Active",
                        startDate: { $lte: now },
                        endDate: { $gte: now },
                })
                        .sort({ endDate: 1 })
                        .limit(10)
                        .lean();

                return NextResponse.json({ success: true, coupons }, { status: 200 });
        } catch (error) {
                console.error("Recommended coupons fetch error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load coupons" },
                        { status: 500 }
                );
        }
}
