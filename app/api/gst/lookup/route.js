import { NextResponse } from "next/server";

import {
        fetchGstDetails,
        extractPrimaryGstAddress,
} from "@/lib/services/gstVerification.js";

const GSTIN_REGEX = /^[0-9A-Z]{15}$/;

const pickFirstString = (candidates = []) => {
        for (const candidate of candidates) {
                if (!candidate) continue;
                if (typeof candidate === "string") {
                        const trimmed = candidate.trim();
                        if (trimmed.length > 0) {
                                return trimmed;
                        }
                }
        }
        return "";
};

const extractStatus = (payload) => {
        const candidates = [
                payload?.data?.gstDetails?.gstinInfo?.sts,
                payload?.data?.gstDetails?.sts,
                payload?.data?.gstinInfo?.sts,
                payload?.data?.gstinDetails?.sts,
                payload?.data?.status,
                payload?.status,
                payload?.result?.status,
        ];

        const status = pickFirstString(candidates);
        return status || null;
};

const buildAddressString = (address) => {
        if (!address) {
                return "";
        }

        const parts = [address.building, address.street, address.city, address.state, address.pincode]
                .map((part) => (part ? `${part}`.trim() : ""))
                .filter(Boolean);

        return parts.join(", ");
};

export async function POST(req) {
        try {
                const body = await req.json();
                const gstinInput = body?.gstin || body?.gstNumber || "";

                if (typeof gstinInput !== "string" || gstinInput.trim().length === 0) {
                        return NextResponse.json(
                                { success: false, error: "GSTIN is required" },
                                { status: 400 }
                        );
                }

                const normalizedGstin = gstinInput.trim().toUpperCase();

                if (!GSTIN_REGEX.test(normalizedGstin)) {
                        return NextResponse.json(
                                { success: false, error: "Enter a valid 15-character GSTIN" },
                                { status: 400 }
                        );
                }

                const gstDetails = await fetchGstDetails(normalizedGstin);

                const legalName = pickFirstString([
                        gstDetails?.data?.gstDetails?.gstinInfo?.lgnm,
                        gstDetails?.data?.gstDetails?.lgnm,
                        gstDetails?.data?.gstDetails?.gstinDetails?.lgnm,
                        gstDetails?.data?.gstinInfo?.lgnm,
                        gstDetails?.data?.gstinDetails?.lgnm,
                        gstDetails?.data?.lgnm,
                        gstDetails?.lgnm,
                        gstDetails?.result?.lgnm,
                ]);

                const tradeName = pickFirstString([
                        gstDetails?.data?.gstDetails?.gstinInfo?.tradeNam,
                        gstDetails?.data?.gstDetails?.tradeNam,
                        gstDetails?.data?.gstinInfo?.tradeNam,
                        gstDetails?.data?.gstinDetails?.tradeNam,
                        gstDetails?.data?.tradeNam,
                        gstDetails?.result?.tradeNam,
                        gstDetails?.tradeNam,
                ]);

                let primaryAddress = null;
                try {
                        primaryAddress = extractPrimaryGstAddress(gstDetails, {
                                fallbackTag: "GST Registered Address",
                        });
                } catch (error) {
                        // Ignore address extraction errors - GST verification can still succeed
                        primaryAddress = null;
                }

                const status = extractStatus(gstDetails);

                return NextResponse.json({
                        success: true,
                        data: {
                                gstNumber: normalizedGstin,
                                legalName: legalName || null,
                                tradeName: tradeName || null,
                                status,
                                state:
                                        primaryAddress?.state ||
                                        pickFirstString([
                                                gstDetails?.data?.gstDetails?.pradr?.addr?.stcd,
                                                gstDetails?.data?.gstDetails?.gstinInfo?.pradr?.addr?.stcd,
                                                gstDetails?.data?.gstinInfo?.pradr?.addr?.stcd,
                                        ]) ||
                                        null,
                                address: primaryAddress
                                        ? {
                                                  building: primaryAddress.building || "",
                                                  street: primaryAddress.street || "",
                                                  city: primaryAddress.city || "",
                                                  state: primaryAddress.state || "",
                                                  pincode: primaryAddress.pincode || "",
                                                  fullAddress: buildAddressString(primaryAddress),
                                          }
                                        : null,
                        },
                });
        } catch (error) {
                const message =
                        error?.message ||
                        "Failed to verify GST details. Please confirm the GSTIN and try again.";

                return NextResponse.json({ success: false, error: message }, { status: 400 });
        }
}
