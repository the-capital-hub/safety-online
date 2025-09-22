// const SMS_TEMPLATE =
// 	"Your Safety Online verification OTP is *. It's valid for * minutes. Do not share this code. - Safety Online";

const SMS_TEMPLATE =
	"Your Ladwa Solutions verification OTP is *. It's valid for * minutes, https://ladwas.com/. Do not share this code. - LADWA";

const getEnvValue = (key) => {
	return process.env[key] ?? process.env[`NEXT_PUBLIC_${key}`] ?? "";
};

const getSmsCountryConfig = () => {
	const config = {
		SMS_COUNTRY_API_URL: getEnvValue("SMS_COUNTRY_API_URL"),
		SMS_COUNTRY_AUTH_KEY: getEnvValue("SMS_COUNTRY_AUTH_KEY"),
		SMS_COUNTRY_SENDERID: getEnvValue("SMS_COUNTRY_SENDERID"),
		SMS_COUNTRY_AUTH_TOKEN: getEnvValue("SMS_COUNTRY_AUTH_TOKEN"),
	};

	const missingKeys = Object.entries(config)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missingKeys.length > 0) {
		throw new Error(
			`Missing SMS Country environment variables: ${missingKeys.join(", ")}`
		);
	}

	return {
		url: config.SMS_COUNTRY_API_URL.replace(/\/$/, ""),
		authKey: config.SMS_COUNTRY_AUTH_KEY,
		senderId: config.SMS_COUNTRY_SENDERID,
		token: config.SMS_COUNTRY_AUTH_TOKEN,
	};
};

export const sendOtpMobile = async (mobile, code) => {
	const { url, authKey, senderId, token } = getSmsCountryConfig();
	const authHeader = `Basic ${Buffer.from(`${authKey}:${token}`).toString(
		"base64"
	)}`;
	const mobileNO = `91${mobile}`;
	const validity = 10;
	const message = SMS_TEMPLATE.replace("*", code).replace("*", validity);
	const endpointUrl = `${url}/${authKey}/SMSes/`;

	try {
		const response = await fetch(endpointUrl, {
			method: "POST",
			headers: {
				Authorization: authHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				Text: message,
				Number: mobileNO,
				SenderId: senderId,
			}),
		});

		const responseText = await response.text();
		let data;

		try {
			data = responseText ? JSON.parse(responseText) : null;
		} catch (parseError) {
			data = responseText;
		}

		if (!response.ok) {
			throw new Error(
				`Failed with status ${response.status}: ${
					typeof data === "object" && data !== null
						? data.Message || JSON.stringify(data)
						: data || "Unknown error"
				}`
			);
		}

		return true;
	} catch (error) {
		throw new Error(`Failed to send OTP to mobile: ${error.message}`);
	}
};
