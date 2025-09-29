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
                console.error("Admin return settings fetch error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load return settings" },
                        { status: 500 }
                );
        }
}

export async function PUT(request) {
        try {
                await dbConnect();

                const payload = await request.json();
                const { enabled, windowDays } = payload;

                const settings = await ReturnSettings.getOrCreate();

                if (typeof enabled === "boolean") {
                        settings.enabled = enabled;
                }

                if (typeof windowDays !== "undefined") {
                        const parsedWindow = Number(windowDays);
                        settings.windowDays = Number.isFinite(parsedWindow) && parsedWindow >= 0 ? parsedWindow : 0;
                }

                settings.updatedAt = new Date();

                await settings.save();

                return NextResponse.json({
                        success: true,
                        settings: serializeSettings(settings),
                });
        } catch (error) {
                console.error("Admin return settings update error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to update return settings" },
                        { status: 500 }
                );
        }
}
