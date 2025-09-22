if (!global.otpStore) {
	global.otpStore = new Map();
}

const store = global.otpStore;

export const saveOTP = (identifier, otp) => {
	store.set(identifier, { otp, verified: false });
};

export const verifyOTP = (identifier, otp) => {
	const entry = store.get(identifier);
	if (entry && entry.otp === otp) {
		entry.verified = true;
		return true;
	}
	return false;
};

export const isVerified = (identifier) => {
	return store.get(identifier)?.verified === true;
};

export const clearOTP = (identifier) => {
	store.delete(identifier);
};
