import { dbConnect } from "@/lib/dbConnect.js";
import Promocode from "@/model/Promocode.js";

const normalizeBoolean = (value, defaultValue = false) => {
        if (value === undefined || value === null) {
                return defaultValue;
        }

        if (typeof value === "boolean") {
                return value;
        }

        if (typeof value === "string") {
                const normalized = value.trim().toLowerCase();

                if (normalized === "" || ["null", "undefined"].includes(normalized)) {
                        return defaultValue;
                }


                if (["true", "1", "yes", "on"].includes(normalized)) {
                        return true;
                }

                if (["false", "0", "no", "off"].includes(normalized)) {
                        return false;
                }
        }

        return Boolean(value);
};

export async function GET(request) {
	await dbConnect();

	try {
		const { searchParams } = new URL(request.url);

		const search = searchParams.get("search");
		const published = searchParams.get("published");
		const status = searchParams.get("status");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const sort = searchParams.get("sort") || "createdAt";
		const order = searchParams.get("order") || "desc";

		// Build query
		const query = {};

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ code: { $regex: search, $options: "i" } },
			];
		}

		if (published !== null && published !== undefined) {
			query.published = published === "true";
		}

		if (status && status !== "all") {
			query.status = status;
		}

		// Build sort object
		const sortObj = {};
		sortObj[sort] = order === "desc" ? -1 : 1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const coupons = await Promocode.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
			.lean();

		// Update status based on dates
		const now = new Date();
                for (const coupon of coupons) {
                        const update = {};

                        let newStatus = "Active";
                        if (new Date(coupon.endDate) < now) {
                                newStatus = "Expired";
                        } else if (new Date(coupon.startDate) > now) {
                                newStatus = "Scheduled";
                        }

                        if (coupon.status !== newStatus) {
                                update.status = newStatus;
                                coupon.status = newStatus;
                        }

                        const normalizedPublished = normalizeBoolean(coupon.published, true);
                        if (coupon.published !== normalizedPublished) {
                                update.published = normalizedPublished;
                                coupon.published = normalizedPublished;
                        }

                        const normalizedRecommended = normalizeBoolean(coupon.recommended, false);
                        if (coupon.recommended !== normalizedRecommended) {
                                update.recommended = normalizedRecommended;
                                coupon.recommended = normalizedRecommended;
                        }

                        if (Object.keys(update).length > 0) {
                                await Promocode.findByIdAndUpdate(coupon._id, update);
                        }
                }

		const total = await Promocode.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		return Response.json({
			success: true,
			coupons,
			pagination: {
				currentPage: page,
				totalPages,
				totalCoupons: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit,
			},
		});
	} catch (error) {
		console.error("Coupons fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch coupons" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
        await dbConnect();

        try {
                const {
                        name,
                        code,
                        discount,
                        startDate,
                        endDate,
                        published,
                        recommended,
                } = await request.json();

		if (!name || !code || !discount || !startDate || !endDate) {
			return Response.json(
				{ success: false, message: "All fields are required" },
				{ status: 400 }
			);
		}

		// Validate dates
		if (new Date(startDate) >= new Date(endDate)) {
			return Response.json(
				{ success: false, message: "End date must be after start date" },
				{ status: 400 }
			);
		}

		// Determine status based on dates
		const now = new Date();
		let status = "Active";
		if (new Date(endDate) < now) {
			status = "Expired";
		} else if (new Date(startDate) > now) {
			status = "Scheduled";
		}

                const coupon = new Promocode({
                        name,
                        code: code.toUpperCase(),
                        discount: Number.parseFloat(discount),
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        published: normalizeBoolean(published, true),
                        recommended: normalizeBoolean(recommended, false),
                        status,
                });

		await coupon.save();

		return Response.json({
			success: true,
			message: "Coupon created successfully",
			coupon,
		});
	} catch (error) {
		if (error.code === 11000) {
			return Response.json(
				{ success: false, message: "Coupon code already exists" },
				{ status: 400 }
			);
		}
		console.error("Create coupon error:", error);
		return Response.json(
			{ success: false, message: "Failed to create coupon" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	await dbConnect();

	try {
		const { couponId, ...updateData } = await request.json();

		if (!couponId) {
			return Response.json(
				{ success: false, message: "Coupon ID is required" },
				{ status: 400 }
			);
		}

		// Validate dates if provided
		if (updateData.startDate && updateData.endDate) {
			if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
				return Response.json(
					{ success: false, message: "End date must be after start date" },
					{ status: 400 }
				);
			}
		}

		// Update status based on dates
                if (updateData.startDate || updateData.endDate) {
                        const coupon = await Promocode.findById(couponId);
                        const startDate = updateData.startDate
                                ? new Date(updateData.startDate)
                                : coupon.startDate;
                        const endDate = updateData.endDate
                                ? new Date(updateData.endDate)
                                : coupon.endDate;
                        const now = new Date();

                        let status = "Active";
                        if (endDate < now) {
                                status = "Expired";
                        } else if (startDate > now) {
                                status = "Scheduled";
                        }
                        updateData.status = status;

                        if (updateData.startDate) {
                                updateData.startDate = startDate;
                        }
                        if (updateData.endDate) {
                                updateData.endDate = endDate;
                        }
                }

                if (updateData.code) {
                        updateData.code = updateData.code.toUpperCase();
                }

                if (updateData.discount !== undefined) {
                        updateData.discount = Number.parseFloat(updateData.discount);
                }

                if (updateData.published !== undefined) {
                        updateData.published = normalizeBoolean(updateData.published);
                }

                if (updateData.recommended !== undefined) {
                        updateData.recommended = normalizeBoolean(updateData.recommended);
                }

                const coupon = await Promocode.findByIdAndUpdate(couponId, updateData, {
                        new: true,
                });

		if (!coupon) {
			return Response.json(
				{ success: false, message: "Coupon not found" },
				{ status: 404 }
			);
		}

		return Response.json({
			success: true,
			message: "Coupon updated successfully",
			coupon,
		});
	} catch (error) {
		console.error("Update coupon error:", error);
		return Response.json(
			{ success: false, message: "Failed to update coupon" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	await dbConnect();

	try {
		const { couponId, couponIds } = await request.json();

		if (couponIds && Array.isArray(couponIds)) {
			// Bulk delete
			const result = await Promocode.deleteMany({ _id: { $in: couponIds } });
			return Response.json({
				success: true,
				message: `${result.deletedCount} coupons deleted successfully`,
				deletedCount: result.deletedCount,
			});
		} else if (couponId) {
			// Single delete
			const coupon = await Promocode.findByIdAndDelete(couponId);
			if (!coupon) {
				return Response.json(
					{ success: false, message: "Coupon not found" },
					{ status: 404 }
				);
			}
			return Response.json({
				success: true,
				message: "Coupon deleted successfully",
			});
		} else {
			return Response.json(
				{ success: false, message: "Coupon ID(s) required" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Delete coupon error:", error);
		return Response.json(
			{ success: false, message: "Failed to delete coupon" },
			{ status: 500 }
		);
	}
}
