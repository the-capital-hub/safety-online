import crypto from "crypto";

const GST_SERVICE_PATH = "/services/bv010";
const CONSENT_TEXT =
        "I hereby declare my consent for fetching my information via RPACPC API.";

const GST_STATE_CODE_MAP = {
        "01": "Jammu and Kashmir",
        "02": "Himachal Pradesh",
        "03": "Punjab",
        "04": "Chandigarh",
        "05": "Uttarakhand",
        "06": "Haryana",
        "07": "Delhi",
        "08": "Rajasthan",
        "09": "Uttar Pradesh",
        "10": "Bihar",
        "11": "Sikkim",
        "12": "Arunachal Pradesh",
        "13": "Nagaland",
        "14": "Manipur",
        "15": "Mizoram",
        "16": "Tripura",
        "17": "Meghalaya",
        "18": "Assam",
        "19": "West Bengal",
        "20": "Jharkhand",
        "21": "Odisha",
        "22": "Chhattisgarh",
        "23": "Madhya Pradesh",
        "24": "Gujarat",
        "25": "Daman and Diu",
        "26": "Dadra and Nagar Haveli",
        "27": "Maharashtra",
        "28": "Andhra Pradesh",
        "29": "Karnataka",
        "30": "Goa",
        "31": "Lakshadweep",
        "32": "Kerala",
        "33": "Tamil Nadu",
        "34": "Puducherry",
        "35": "Andaman and Nicobar Islands",
        "36": "Telangana",
        "37": "Andhra Pradesh",
        "38": "Ladakh",
        "97": "Other Territory",
};

const sanitizeStateCode = (value) => {
        if (!value) return "";
        const normalized = `${value}`.trim().padStart(2, "0");
        return GST_STATE_CODE_MAP[normalized] || "";
};

const readEnvValue = (key) => {
        const value = process.env[key];
        if (!value) return "";
        return `${value}`.trim();
};

const getGstApiConfig = () => {
        const baseUrl = readEnvValue("GST_API_BASE_URL");
        const token = readEnvValue("GST_API_TOKEN");
        const secret = readEnvValue("GST_API_SECRET");

        if (!baseUrl) {
                throw new Error("GST API base URL is not configured");
        }

        if (!token || !secret) {
                throw new Error("GST API credentials are not configured");
        }

        return {
                baseUrl: baseUrl.replace(/\/$/, ""),
                token,
                secret,
        };
};

export async function fetchGstDetails(gstinNumber) {
        if (!gstinNumber) {
                throw new Error("GSTIN is required");
        }

        const { baseUrl, token, secret } = getGstApiConfig();

        const requestId = crypto.randomUUID();
        const payload = {
                request_id: requestId,
                consent: "Y",
                consent_text: CONSENT_TEXT,
                gstNumber: gstinNumber,
                branchDetails: true,
                hsnDetails: false,
                filingDetails: false,
                filingFrequency: false,
                liabilityPaidDetails: false,
        };

        const response = await fetch(`${baseUrl}${GST_SERVICE_PATH}`, {
                method: "POST",
                headers: {
                        "Content-Type": "application/json",
                        token,
                        secretkey: secret,
                },
                body: JSON.stringify(payload),
        });

        const parseResponseBody = async () => {
                try {
                        return await response.json();
                } catch {
                        try {
                                const text = await response.text();
                                return text ? { message: text } : null;
                        } catch {
                                return null;
                        }
                }
        };

        const data = await parseResponseBody();

        if (!response.ok) {
                const errorMessage =
                        data?.message ||
                        data?.error ||
                        data?.statusMessage ||
                        data?.status ||
                        `GST service returned an unexpected response (${response.status})`;
                throw new Error(errorMessage);
        }

        if (!data) {
                throw new Error("Invalid GST service response");
        }

        if (data?.success === false) {
                throw new Error(data?.message || "Failed to fetch GST details");
        }

        if (data?.status && `${data.status}`.toLowerCase() !== "success") {
                throw new Error(data?.message || "Failed to fetch GST details");
        }

        if (data?.error) {
                throw new Error(data.error);
        }

        return data;
}

const getFirstNonEmpty = (payload) => payload.find((entry) => entry && Object.keys(entry).length > 0);

const resolveAddressSource = (payload) => {
        if (!payload || typeof payload !== "object") return null;
        const candidates = [
                payload?.data?.gstDetails?.gstinInfo?.pradr,
                payload?.data?.gstDetails?.pradr,
                payload?.data?.gstinInfo?.pradr,
                payload?.data?.gstinDetails?.pradr,
                payload?.data?.pradr,
                payload?.data?.principal_place,
                payload?.gstinInfo?.pradr,
                payload?.gstinDetails?.pradr,
                payload?.result?.pradr,
                payload?.pradr,
        ];
        const selected = getFirstNonEmpty(candidates);
        if (!selected) return null;
        if (selected.addr && Object.keys(selected.addr).length > 0) {
                return selected.addr;
        }
        return selected;
};

export function extractPrimaryGstAddress(payload, { fallbackTag = "Registered Office" } = {}) {
        const address = resolveAddressSource(payload);
        if (!address) {
                throw new Error("GST address details were not found");
        }

        const buildingParts = [address?.bno, address?.bnm, address?.flno, address?.lg]
                .map((part) => (part ? `${part}`.trim() : ""))
                .filter(Boolean);
        const streetParts = [address?.st, address?.loc]
                .map((part) => (part ? `${part}`.trim() : ""))
                .filter(Boolean);

        const city = `${address?.city || address?.dst || ""}`.trim();
        const stateName = sanitizeStateCode(address?.stcd) || `${address?.state || address?.stateName || ""}`.trim();
        const pincode = `${address?.pncd || address?.pincode || address?.zip || ""}`.trim();

        if (!city || !stateName || !pincode) {
                throw new Error("Incomplete GST address details");
        }

        return {
                tagName: fallbackTag,
                building: buildingParts.join(", ") || streetParts.join(", ") || `${city}, ${stateName}`,
                street: streetParts.join(", ") || buildingParts.join(", ") || `${city}, ${stateName}`,
                city,
                state: stateName,
                pincode,
                country: "India",
        };
}
