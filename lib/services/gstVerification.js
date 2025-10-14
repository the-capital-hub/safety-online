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

const buildStructuredAddressFromString = (addressString) => {
        if (!addressString || typeof addressString !== "string") {
                return null;
        }

        const cleaned = addressString.replace(/\s+/g, " ").trim();
        if (!cleaned) {
                return null;
        }

        const parts = cleaned
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean);

        if (!parts.length) {
                return null;
        }

        const workingParts = [...parts];

        let pincode = "";
        for (let index = workingParts.length - 1; index >= 0; index -= 1) {
                const match = workingParts[index].match(/(\b\d{6}\b)/);
                if (match) {
                        pincode = match[1];
                        const leftover = workingParts[index].replace(match[1], "").trim();
                        if (leftover) {
                                workingParts[index] = leftover;
                        } else {
                                workingParts.splice(index, 1);
                        }
                        break;
                }
        }

        let state = "";
        if (workingParts.length) {
                state = workingParts.pop();
        }

        let city = "";
        if (workingParts.length) {
                city = workingParts.pop();
        }

        if (!city && workingParts.length) {
                city = workingParts.pop();
        }

        const buildingSegments = workingParts;
        const buildingLine =
                buildingSegments.join(", ") || [city, state].filter(Boolean).join(", ") || cleaned;

        const streetSegments = buildingSegments.slice(1);
        const streetLine = streetSegments.join(", ");
        const locality =
                streetSegments[streetSegments.length - 1] ||
                buildingSegments[buildingSegments.length - 1] ||
                city ||
                state ||
                "";

        return {
                bno: buildingLine,
                bnm: "",
                flno: "",
                lg: "",
                st: streetLine,
                loc: locality,
                city: city || "",
                dst: city || "",
                state: state || "",
                stateName: state || "",
                pncd: pincode || "",
                pincode: pincode || "",
                zip: pincode || "",
                addressText: cleaned,
        };
};

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

        if (typeof candidate === "string") {
                return buildStructuredAddressFromString(candidate);
        }

        if (typeof candidate !== "object") {
                return null;
        }

        if (candidate.addr) {
                const normalizedAddr = normalizeAddressCandidate(candidate.addr);
                if (normalizedAddr) {
                        return { ...normalizedAddr, ...candidate };
                }
        }

        if (candidate.address) {
                const normalizedAddr = normalizeAddressCandidate(candidate.address);
                if (normalizedAddr) {
                        return { ...normalizedAddr, ...candidate };
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
                payload?.data?.branchDetails?.permanentAdd,
                payload?.data?.branchDetails?.permanentAdd?.address,
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

export function extractPrimaryGstAddress(payload, { fallbackTag = "Head Office" } = {}) {
        const address = resolveAddressSource(payload);
        if (!address) {
                console.error(
                        "GST verification response missing address:",
                        JSON.stringify(payload, null, 2)
                );
                throw new Error("GST address details were not found");
        }

        let normalizedAddress = address;

        const computeLocationParts = (addr) => {
                if (!addr || typeof addr !== "object") {
                        return { city: "", stateName: "", pincode: "" };
                }

                return {
                        city: `${addr?.city || addr?.dst || ""}`.trim(),
                        stateName:
                                sanitizeStateCode(addr?.stcd) ||
                                `${addr?.state || addr?.stateName || ""}`.trim(),
                        pincode: `${addr?.pncd || addr?.pincode || addr?.zip || ""}`.trim(),
                };
        };

        let { city, stateName, pincode } = computeLocationParts(normalizedAddress);

        if (!city || !stateName || !pincode) {
                const fallbackText =
                        normalizedAddress?.addressText ||
                        (typeof normalizedAddress?.address === "string"
                                ? normalizedAddress.address
                                : "") ||
                        (typeof normalizedAddress?.addr === "string"
                                ? normalizedAddress.addr
                                : "");

                const fallbackAddress = buildStructuredAddressFromString(fallbackText);
                if (fallbackAddress) {
                        normalizedAddress = { ...normalizedAddress, ...fallbackAddress };
                        ({ city, stateName, pincode } = computeLocationParts(normalizedAddress));
                }
        }

        if (!city || !stateName || !pincode) {
                console.error(
                        "GST verification response missing address fields:",
                        JSON.stringify({
                                payload,
                                resolvedAddress: normalizedAddress,
                        })
                );
                throw new Error("Incomplete GST address details");
        }

        const buildingParts = [
                normalizedAddress?.bno,
                normalizedAddress?.bnm,
                normalizedAddress?.flno,
                normalizedAddress?.lg,
        ]
                .map((part) => (part ? `${part}`.trim() : ""))
                .filter(Boolean);
        const streetParts = [normalizedAddress?.st, normalizedAddress?.loc]
                .map((part) => (part ? `${part}`.trim() : ""))
                .filter(Boolean);

        return {
                tagName: normalizedAddress?.tagName || fallbackTag,
                building: buildingParts.join(", ") || streetParts.join(", ") || `${city}, ${stateName}`,
                street: streetParts.join(", ") || buildingParts.join(", ") || `${city}, ${stateName}`,
                city,
                state: stateName,
                pincode,
                country: "India",
        };
}
