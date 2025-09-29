import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import ReturnSettings from "@/model/ReturnSettings";

const serializeSettings = (settings) => ({
        enabled: settings.enabled,
        windowDays: settings.windowDays,
        updatedAt: settings.updatedAt,
});

export async function GET() {
        try {
                await dbConnect();

                const settings = await ReturnSettings.getOrCreate();

                return NextResponse.json({
                        success: true,
                        settings: serializeSettings(settings),
                });
        } catch (error) {
                console.error("Return settings fetch error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load return settings" },
                        { status: 500 }
                );
        }
}
