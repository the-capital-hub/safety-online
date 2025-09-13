// app/api/cart/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Cart from "@/model/Cart.js";
import Product from "@/model/Product.js";
import { verifyToken } from "@/lib/auth.js";
import { cookies } from "next/headers";

export async function GET() {
        await dbConnect();

        try {
                const cookieStore = await cookies();
                const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		let cart = await Cart.findOne({ user: decoded.id }).populate({
			path: "products.product",
			select: "title description images price salePrice discount inStock",
		});

		if (!cart) {
			cart = new Cart({ user: decoded.id, products: [], totalPrice: 0 });
			await cart.save();
		}

		return Response.json({ cart });
	} catch (error) {
		console.error("Cart fetch error:", error);
		return Response.json({ message: "Failed to fetch cart" }, { status: 500 });
	}
}

export async function POST(req) {
        await dbConnect();

        try {
                const cookieStore = await cookies();
                const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);
		const { productId, quantity = 1 } = await req.json();

		// Verify product exists and is in stock
		const product = await Product.findById(productId);
		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		if (!product.inStock || product.stocks < quantity) {
			return Response.json(
				{ message: "Product out of stock" },
				{ status: 400 }
			);
		}

		// Find or create cart
		let cart = await Cart.findOne({ user: decoded.id });
		if (!cart) {
			cart = new Cart({ user: decoded.id, products: [], totalPrice: 0 });
		}

		// Check if product already in cart
		const existingProductIndex = cart.products.findIndex(
			(item) => item.product.toString() === productId
		);

		if (existingProductIndex > -1) {
			// Update quantity
			cart.products[existingProductIndex].quantity += quantity;
		} else {
			// Add new product
			cart.products.push({ product: productId, quantity });
		}

		// Recalculate total price
                await cart.populate("products.product");
                cart.totalPrice = cart.products.reduce((total, item) => {
                        const product = item.product;
                        const price =
                                product && product.salePrice > 0
                                        ? product.salePrice
                                        : product?.price || 0;
                        return total + price * item.quantity;
                }, 0);

		await cart.save();

		return Response.json({ message: "Product added to cart", cart });
	} catch (error) {
		console.error("Add to cart error:", error);
		return Response.json({ message: "Failed to add to cart" }, { status: 500 });
	}
}
