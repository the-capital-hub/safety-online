// app/api/cart/[productId]/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Cart from "@/model/Cart.js";
import { verifyToken } from "@/lib/auth.js";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
	await dbConnect();

	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);
		const { quantity } = await req.json();

		const cart = await Cart.findOne({ user: decoded.id }).populate(
			"products.product"
		);
		if (!cart) {
			return Response.json({ message: "Cart not found" }, { status: 404 });
		}

		const productIndex = cart.products.findIndex(
			(item) => item.product._id.toString() === params.productId
		);

		if (productIndex === -1) {
			return Response.json({ message: "Product not in cart" }, { status: 404 });
		}

		if (quantity <= 0) {
			// Remove product from cart
			cart.products.splice(productIndex, 1);
		} else {
			// Update quantity
			cart.products[productIndex].quantity = quantity;
		}

		// Recalculate total price
		cart.totalPrice = cart.products.reduce((total, item) => {
			const price = item.product.salePrice || item.product.price;
			return total + price * item.quantity;
		}, 0);

		await cart.save();

		return Response.json({ message: "Cart updated", cart });
	} catch (error) {
		console.error("Update cart error:", error);
		return Response.json({ message: "Failed to update cart" }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	await dbConnect();

	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		const cart = await Cart.findOne({ user: decoded.id }).populate(
			"products.product"
		);
		if (!cart) {
			return Response.json({ message: "Cart not found" }, { status: 404 });
		}

		cart.products = cart.products.filter(
			(item) => item.product._id.toString() !== params.productId
		);

		// Recalculate total price
		cart.totalPrice = cart.products.reduce((total, item) => {
			const price = item.product.salePrice || item.product.price;
			return total + price * item.quantity;
		}, 0);

		await cart.save();

		return Response.json({ message: "Product removed from cart", cart });
	} catch (error) {
		console.error("Remove from cart error:", error);
		return Response.json(
			{ message: "Failed to remove from cart" },
			{ status: 500 }
		);
	}
}
