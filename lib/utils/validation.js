const wrapPattern = (pattern, required) => {
	if (!pattern) {
		return undefined;
	}
	const trimmed = pattern.trim();
	if (!trimmed) {
		return undefined;
	}
	return required ? `^(?:${trimmed})$` : `^(?:${trimmed})?$`;
};

const cleanText = (value) => value.replace(/[<>]/g, "");
const digitsOnly = (value) => value.replace(/\D+/g, "");
const currencyValue = (value) => value.replace(/[^0-9.]/g, "");
const alphaNumeric = (value) => value.replace(/[^0-9A-Za-z]/g, "");
const alphaNumericExtended = (value) =>
	value.replace(/[^0-9A-Za-z\s'.,/&()_-]/g, "");
const lettersSpaces = (value) => value.replace(/[^A-Za-z\s'.-]/g, "");

const RULES = {
	defaultText: {
		maxLength: 200,
		pattern: "[^<>]{1,200}",
		sanitize: cleanText,
		title: "Use up to 200 characters without < or > symbols.",
	},
	shortText: {
		maxLength: 120,
		pattern: "[^<>]{1,120}",
		sanitize: cleanText,
		title: "Use up to 120 characters without < or > symbols.",
	},
	mediumText: {
		maxLength: 300,
		pattern: "[^<>]{1,300}",
		sanitize: cleanText,
		title: "Use up to 300 characters without < or > symbols.",
	},
	longText: {
		maxLength: 1000,
		pattern: "[^<>]{1,1000}",
		sanitize: cleanText,
		title: "Use up to 1000 characters without < or > symbols.",
	},
	name: {
		maxLength: 100,
		pattern: "[A-Za-z0-9][A-Za-z0-9\\s'.-]{0,99}",
		sanitize: (value) => alphaNumericExtended(value).replace(/ {2,}/g, " "),
		title:
			"Only letters, numbers, spaces, apostrophes, periods, hyphens or slashes.",
	},
	tag: {
		maxLength: 60,
		pattern: "[A-Za-z0-9][A-Za-z0-9\\s'.-]{0,59}",
		sanitize: (value) => alphaNumericExtended(value).replace(/ {2,}/g, " "),
		title:
			"Only letters, numbers, spaces, apostrophes, periods, hyphens or slashes.",
	},
	email: {
		maxLength: 254,
		pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
		sanitize: (value) => value.replace(/\s+/g, "").toLowerCase(),
		inputMode: "email",
		autoComplete: "email",
		title: "Enter a valid email address (example@domain.com).",
	},

	// ✅ FIXED: Removed ^ and $ anchors (wrapPattern handles them)
	phone: {
		maxLength: 13, // +91 + 10 digits
		pattern: "(\\+91)?[6-9][0-9]{9}", // ✅ No anchors here
		sanitize: (value) => {
			let sanitized = value.trim().replace(/[^0-9+]/g, "");
			sanitized = sanitized.replace(/(?!^)\+/g, ""); // only one +
			if (/^91[6-9][0-9]{8}$/.test(sanitized)) sanitized = "+" + sanitized;
			sanitized = sanitized.replace(/^0+/, ""); // remove leading 0s
			return sanitized;
		},
		inputMode: "tel",
		autoComplete: "tel",
		title:
			"Enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210).",
	},

	emailOrPhone: {
		maxLength: 254,
		pattern:
			"(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}|\\+?[0-9]{7,15})",
		sanitize: (value) => value.replace(/\s+/g, ""),
		title: "Enter a valid email or phone number.",
	},
	// ✅ IMPROVED: Better password requirements (8 chars minimum, as per best practices)
	password: {
		maxLength: 64,
		pattern:
			"(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9!@#$%^&*()_+=\\-{}\\[\\]:;\"'|\\\\<>,.?/~`]{8,64}",
		sanitize: (value) => value.replace(/\s+/g, ""), // ✅ Remove all whitespace
		title: "Use 8-64 characters with at least one letter and one number.",
	},
	otp: {
		maxLength: 6,
		pattern: "[0-9]{6}",
		sanitize: digitsOnly,
		inputMode: "numeric",
		title: "Enter the 6-digit code.",
	},
	addressLine: {
		maxLength: 150,
		pattern: "[A-Za-z0-9][A-Za-z0-9\\s#.,/&()-]{0,149}",
		sanitize: (value) => alphaNumericExtended(value).replace(/ {2,}/g, " "),
		title: "Use letters, numbers and # . , / & ( ) - characters only.",
	},
	city: {
		maxLength: 80,
		pattern: "[A-Za-z][A-Za-z\\s'.-]{0,79}",
		sanitize: (value) => lettersSpaces(value).replace(/ {2,}/g, " "),
		title: "Use letters, spaces, apostrophes, periods or hyphens only.",
	},
	postalCode: {
		maxLength: 10,
		pattern: "[0-9]{4,10}",
		sanitize: digitsOnly,
		inputMode: "numeric",
		title: "Enter a numeric postal or ZIP code (4-10 digits).",
	},
	gst: {
		maxLength: 15,
		pattern: "[0-9A-Z]{15}",
		sanitize: (value) => alphaNumeric(value.toUpperCase()),
		title: "GSTIN should be 15 characters (numbers and uppercase letters).",
	},
	url: {
		maxLength: 2048,
		pattern: "https?:\\/\\/.+",
		sanitize: (value) => value.trim(),
		inputMode: "url",
		title: "Enter a valid URL starting with http or https.",
	},
	currency: {
		maxLength: 12,
		pattern: "(?:0|[1-9][0-9]{0,8})(?:\\.[0-9]{1,2})?",
		sanitize: (value) => {
			const cleaned = currencyValue(value);
			const parts = cleaned.split(".");
			if (parts.length > 1) {
				return `${parts[0].slice(0, 9)}.${parts[1].slice(0, 2)}`;
			}
			return parts[0].slice(0, 9);
		},
		inputMode: "decimal",
		title: "Enter a valid amount (up to 9 digits and 2 decimals).",
	},
	integer: {
		maxLength: 7,
		pattern: "[0-9]{1,7}",
		sanitize: digitsOnly,
		inputMode: "numeric",
		title: "Use digits only.",
	},
	percentage: {
		maxLength: 6,
		pattern: "(?:100|[0-9]{1,2})(?:\\.[0-9]{1,2})?",
		sanitize: (value) => {
			const cleaned = currencyValue(value);
			const num = cleaned ? parseFloat(cleaned) : NaN;
			if (Number.isNaN(num)) {
				return cleaned.slice(0, 6);
			}
			const bounded = Math.min(100, Math.max(0, num));
			return bounded.toString().slice(0, 6);
		},
		inputMode: "decimal",
		title: "Enter a percentage between 0 and 100.",
	},
	dimension: {
		maxLength: 8,
		pattern: "(?:0|[1-9][0-9]{0,3})(?:\\.[0-9]{1,2})?",
		sanitize: (value) => {
			const cleaned = currencyValue(value);
			const parts = cleaned.split(".");
			if (parts.length > 1) {
				return `${parts[0].slice(0, 4)}.${parts[1].slice(0, 2)}`;
			}
			return parts[0].slice(0, 4);
		},
		inputMode: "decimal",
		title: "Enter a value with up to 4 digits and 2 decimals.",
	},
	weight: {
		maxLength: 8,
		pattern: "(?:0|[1-9][0-9]{0,3})(?:\\.[0-9]{1,2})?",
		sanitize: (value) => {
			const cleaned = currencyValue(value);
			const parts = cleaned.split(".");
			if (parts.length > 1) {
				return `${parts[0].slice(0, 4)}.${parts[1].slice(0, 2)}`;
			}
			return parts[0].slice(0, 4);
		},
		inputMode: "decimal",
		title: "Enter a value with up to 4 digits and 2 decimals.",
	},
	sku: {
		maxLength: 40,
		pattern: "[0-9A-Za-z][0-9A-Za-z\\-]{0,39}",
		sanitize: (value) => alphaNumeric(value.toUpperCase()),
		title: "Use letters, numbers and dashes only.",
	},
	code: {
		maxLength: 20,
		pattern: "[0-9A-Za-z][0-9A-Za-z\\-]{0,19}",
		sanitize: (value) => alphaNumeric(value.toUpperCase()),
		title: "Use letters, numbers and dashes only.",
	},
	couponCode: {
		maxLength: 20,
		pattern: "[0-9A-Za-z][0-9A-Za-z\\-]{0,19}",
		sanitize: (value) => alphaNumeric(value.toUpperCase()),
		title: "Use letters, numbers and dashes only.",
	},
	hsn: {
		maxLength: 15,
		pattern: "[0-9A-Za-z]{6,15}",
		sanitize: (value) => alphaNumeric(value.toUpperCase()),
		title: "HSN should be alphanumeric (6-15 characters).",
	},
	search: {
		maxLength: 100,
		pattern: "[^<>]{1,100}",
		sanitize: cleanText,
		title: "Use up to 100 characters without < or > symbols.",
	},
};

// ✅ ADDED: Map lastName and mobile to proper validation keys
const FIELD_MAP = {
	companyname: "name",
	companyemail: "email",
	phone: "phone",
	mobile: "phone", // ✅ Added
	companylogo: "url",
	gstinnumber: "gst",
	tagname: "tag",
	building: "addressLine",
	street: "addressLine",
	city: "city",
	state: "city",
	pincode: "postalCode",
	country: "city",
	name: "name",
	email: "email",
	password: "password",
	oldpassword: "password", // ✅ Added
	newpassword: "password", // ✅ Added
	confirmpassword: "password", // ✅ Added
	contactnumber: "phone",
	joiningdate: null,
	routes: null,
	title: "name",
	description: "mediumText",
	longdescription: "longText",
	brand: "name",
	price: "currency",
	saleprice: "currency",
	stocks: "integer",
	discount: "percentage",
	hsncode: "hsn",
	length: "dimension",
	width: "dimension",
	height: "dimension",
	weight: "weight",
	material: "name",
	size: "shortText",
	colour: "name",
	zipcode: "postalCode",
	receiptwidth: "shortText",
	dateformat: "shortText",
	identifier: "emailOrPhone",
	emailormobile: "emailOrPhone",
	otp: "otp",
	tag: "tag",
	subject: "shortText",
	message: "longText",
	firstname: "name", // ✅ Already present
	lastname: "name", // ✅ Already present
	fullname: "name",
	phonenumber: "phone",
};

const KEYWORD_RULES = [
	{ keywords: ["email"], rule: "email" },
	{ keywords: ["phone", "mobile", "contact"], rule: "phone" },
	{ keywords: ["name", "title"], rule: "name" },
	{ keywords: ["description", "summary", "message"], rule: "mediumText" },
	{ keywords: ["price", "amount", "charge", "cost"], rule: "currency" },
	{ keywords: ["stock", "quantity", "qty"], rule: "integer" },
	{ keywords: ["discount", "percent"], rule: "percentage" },
	{
		keywords: ["length", "width", "height", "depth", "dimension"],
		rule: "dimension",
	},
	{ keywords: ["weight"], rule: "weight" },
	{ keywords: ["gst"], rule: "gst" },
	{ keywords: ["hsn"], rule: "hsn" },
	{ keywords: ["sku", "code"], rule: "code" },
	{ keywords: ["url", "link"], rule: "url" },
	{ keywords: ["search", "query"], rule: "search" },
	{ keywords: ["password"], rule: "password" }, // ✅ Added
];

const TYPE_FALLBACKS = {
	email: "email",
	password: "password",
	tel: "phone",
	number: "currency",
	url: "url",
	date: null,
};

const sanitizeValueByRule = (rule, value, maxLengthOverride) => {
	if (!value && value !== 0) {
		return "";
	}
	let output = String(value);
	if (typeof rule?.sanitize === "function") {
		output = rule.sanitize(output);
	}
	const limit = maxLengthOverride ?? rule?.maxLength;
	if (limit) {
		output = output.slice(0, limit);
	}
	return output;
};

const resolveRuleKey = (fieldKey, type) => {
	if (!fieldKey && !type) {
		return null;
	}
	if (fieldKey) {
		const normalized = fieldKey.toString().toLowerCase();
		if (Object.prototype.hasOwnProperty.call(FIELD_MAP, normalized)) {
			return FIELD_MAP[normalized];
		}
		for (const entry of KEYWORD_RULES) {
			if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
				return entry.rule;
			}
		}
	}
	if (type && Object.prototype.hasOwnProperty.call(TYPE_FALLBACKS, type)) {
		return TYPE_FALLBACKS[type];
	}
	return "defaultText";
};

export const getInputValidationProps = (fieldKey, options = {}) => {
	const ruleKey = options.ruleKey || resolveRuleKey(fieldKey, options.type);
	const rule = ruleKey ? RULES[ruleKey] : null;
	const required = options.required ?? false;
	const maxLengthValue = options.maxLength ?? rule?.maxLength;

	const attributes = {};
	if (fieldKey) {
		attributes.name = options.name || fieldKey;
	}

	if (rule) {
		if (maxLengthValue) {
			attributes.maxLength = maxLengthValue;
		}
		const pattern = wrapPattern(rule.pattern, required);
		if (pattern && !options.pattern) {
			attributes.pattern = pattern;
		}
		if (rule.inputMode && !options.inputMode) {
			attributes.inputMode = rule.inputMode;
		}
		if (rule.autoComplete && !options.autoComplete) {
			attributes.autoComplete = rule.autoComplete;
		}
		if (rule.title && !options.title) {
			attributes.title = rule.title;
		}
	}

	return {
		attributes,
		sanitize: (value) => sanitizeValueByRule(rule, value, maxLengthValue),
	};
};

export const sanitizeInputValue = (fieldKey, value, options = {}) => {
	const ruleKey = options.ruleKey || resolveRuleKey(fieldKey, options.type);
	const rule = ruleKey ? RULES[ruleKey] : null;
	const maxLengthValue = options.maxLength ?? rule?.maxLength;
	return sanitizeValueByRule(rule, value, maxLengthValue);
};

export const getValidationPattern = (fieldKey, options = {}) => {
	const ruleKey = options.ruleKey || resolveRuleKey(fieldKey, options.type);
	const rule = ruleKey ? RULES[ruleKey] : null;
	return wrapPattern(rule?.pattern, options.required ?? false);
};

export const getMaxLength = (fieldKey, options = {}) => {
	const ruleKey = options.ruleKey || resolveRuleKey(fieldKey, options.type);
	const rule = ruleKey ? RULES[ruleKey] : null;
	return options.maxLength || rule?.maxLength;
};

export const validationRules = RULES;
