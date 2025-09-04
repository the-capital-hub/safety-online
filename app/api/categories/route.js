import { dbConnect } from "@/lib/dbConnect.js";
import Category from "@/model/Categories.js";

export async function GET() {
	try {
		await dbConnect();

		// Only published categories
		const cats = await Category.find({ published: true })
			.sort({ name: 1 })
			.lean();

		const categories = cats.map((c) => ({
			_id: c._id,
			name: c.name,
			productCount: c.productCount || 0,
			subCategories: c.subCategories || [],
			published: true,
		}));

		return Response.json({
			success: true,
			categories,
			message: "Categories fetched successfully",
		});
	} catch (e) {
		console.error("Public categories error:", e);
		return Response.json(
			{ success: false, message: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
