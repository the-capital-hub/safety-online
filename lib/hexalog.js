// Hexalog API client: handles auth token caching and serviceability calls

const HEXALOG_BASE_URL =
	process.env.HEXALOG_BASE_URL || "https://api.hexalog.in";
const HEXALOG_CLIENT_ID = process.env.HEXALOG_CLIENT_ID;
const HEXALOG_USERNAME = process.env.HEXALOG_USERNAME;
const HEXALOG_PASSWORD = process.env.HEXALOG_PASSWORD;

let cachedToken = null;
let tokenExpiresAt = 0;

async function fetchJson(url, options = {}) {
	const res = await fetch(url, {
		...options,
		headers: {
			"content-type": "application/json",
			...(options.headers || {}),
		},
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Hexalog request failed ${res.status}: ${text}`);
	}
	return res.json();
}

async function getAccessToken() {
	const now = Date.now();
	if (cachedToken && tokenExpiresAt > now + 5000) {
		return cachedToken;
	}

	if (!HEXALOG_CLIENT_ID || !HEXALOG_USERNAME || !HEXALOG_PASSWORD) {
		throw new Error(
			"Missing Hexalog credentials. Set HEXALOG_CLIENT_ID, HEXALOG_USERNAME, HEXALOG_PASSWORD."
		);
	}

	const url = `${HEXALOG_BASE_URL}/integrations/v2/auth/token/${encodeURIComponent(
		HEXALOG_CLIENT_ID
	)}`;
	const body = JSON.stringify({
		username: HEXALOG_USERNAME,
		password: HEXALOG_PASSWORD,
	});
	const data = await fetchJson(url, { method: "POST", body });

	const {
		access_token: accessToken,
		token_type: tokenType,
		expires_in: expiresIn,
	} = data || {};
	if (!accessToken || !tokenType || !expiresIn) {
		throw new Error("Invalid Hexalog auth response");
	}
	cachedToken = `${tokenType} ${accessToken}`;
	tokenExpiresAt = now + Number(expiresIn) * 1000;
	return cachedToken;
}

export async function checkServiceabilityByPincode(pincode) {
	if (!pincode) {
		throw new Error("pincode is required");
	}
	const token = await getAccessToken();
	const url = `${HEXALOG_BASE_URL}/api/v2/serviceability/${encodeURIComponent(
		pincode
	)}`;
	const data = await fetchJson(url, { headers: { Authorization: token } });
	return data;
}

export const hexalogClient = {
	getAccessToken,
	checkServiceabilityByPincode,
};
