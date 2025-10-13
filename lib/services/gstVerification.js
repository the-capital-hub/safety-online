import crypto from "crypto";

const {
        GST_API_BASE_URL,
        GST_API_TOKEN,
        GST_API_SECRET,
} = process.env;

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

const buildUrl = () => {
        if (!GST_API_BASE_URL) {
                throw new Error("GST API base URL is not configured");
        }
        return `${GST_API_BASE_URL.replace(/\/$/, "")}${GST_SERVICE_PATH}`;
};

export async function fetchGstDetails(gstinNumber) {
        if (!gstinNumber) {
                throw new Error("GSTIN is required");
        }
        if (!GST_API_TOKEN || !GST_API_SECRET) {
                throw new Error("GST API credentials are not configured");
        }

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

        const response = await fetch(buildUrl(), {
                method: "POST",
                headers: {
                        "Content-Type": "application/json",
                        token: GST_API_TOKEN,
                        secretkey: GST_API_SECRET,
                },
                body: JSON.stringify(payload),
        });

        if (!response.ok) {
                let errorMessage = "GST service returned an unexpected response";

                try {
                        const errorData = await response.clone().json();
                        if (errorData) {
                                if (typeof errorData === "string") {
                                        errorMessage = errorData || errorMessage;
                                } else if (errorData?.message) {
                                        errorMessage = errorData.message;
                                } else if (errorData?.error) {
                                        errorMessage = errorData.error;
                                }
                        }
                } catch {
                        try {
                                const errorText = await response.text();
                                if (errorText) {
                                        errorMessage = errorText;
                                }
                        } catch {
                                // Ignore parsing errors and fall back to default message
                        }
                }

                throw new Error(errorMessage);
        }

        let data;
        try {
                data = await response.json();
        } catch {
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

const normalizeAddressCandidate = (candidate) => {
        if (!candidate) return null;

        if (Array.isArray(candidate)) {
                for (const item of candidate) {
                        const normalizedItem = normalizeAddressCandidate(item);
                        if (normalizedItem) {
                                return normalizedItem;
                        }
                }
                return null;
        }

        if (typeof candidate !== "object") {
                return null;
        }

        if (candidate.addr) {
                const normalizedAddr = normalizeAddressCandidate(candidate.addr);
                if (normalizedAddr) {
                        return normalizedAddr;
                }
        }

        if (candidate.address) {
                const normalizedAddr = normalizeAddressCandidate(candidate.address);
                if (normalizedAddr) {
                        return normalizedAddr;
                }
        }

        return Object.keys(candidate).length > 0 ? candidate : null;
};

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

        for (const candidate of candidates) {
                const normalized = normalizeAddressCandidate(candidate);
                if (normalized) {
                        return normalized;
                }
        }

        return null;
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
