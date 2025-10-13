import { dbConnect } from "@/lib/dbConnect.js";
import Promocode from "@/model/Promocode.js";
import { getDateRangeStatus, normalizeDateRange } from "@/lib/utils/date.js";

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

                        const newStatus = getDateRangeStatus(
                                coupon.startDate,
                                coupon.endDate,
                                now
                        );

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
                const { start, end } = normalizeDateRange(startDate, endDate);

                if (start >= end) {
                        return Response.json(
                                { success: false, message: "End date must be after start date" },
                                { status: 400 }
                        );
                }

                // Determine status based on dates
                const now = new Date();
                const status = getDateRangeStatus(start, end, now);

                const coupon = new Promocode({
                        name,
                        code: code.toUpperCase(),
                        discount: Number.parseFloat(discount),
                        startDate: start,
                        endDate: end,
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
                let existingCoupon = null;
                if (updateData.startDate || updateData.endDate) {
                        existingCoupon = await Promocode.findById(couponId);

                        if (!existingCoupon) {
                                return Response.json(
                                        { success: false, message: "Coupon not found" },
                                        { status: 404 }
                                );
                        }

                        const startInput = updateData.startDate ?? existingCoupon.startDate;
                        const endInput = updateData.endDate ?? existingCoupon.endDate;

                        const { start, end } = normalizeDateRange(startInput, endInput);

                        if (start >= end) {
                                return Response.json(
                                        { success: false, message: "End date must be after start date" },
                                        { status: 400 }
                                );
                        }

                        if (updateData.startDate) {
                                updateData.startDate = start;
                        }
                        if (updateData.endDate) {
                                updateData.endDate = end;
                        }

                        updateData.status = getDateRangeStatus(start, end);
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
