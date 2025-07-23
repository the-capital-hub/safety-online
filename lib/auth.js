import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function createToken(user) {
	return jwt.sign(
		{
			id: user._id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
		},
		JWT_SECRET,
		{ expiresIn: "7d" }
	);
}

export function verifyToken(token) {
	return jwt.verify(token, JWT_SECRET);
}
