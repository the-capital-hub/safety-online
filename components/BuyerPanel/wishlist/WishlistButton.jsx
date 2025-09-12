"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WishlistButton({
	product,
	className = "",
	size = "default",
	variant = "ghost",
	showText = false,
}) {
	const { isItemInWishlist, toggleItem, isLoading } = useWishlistStore();

	const isInWishlist = isItemInWishlist(product.id);

	const handleClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleItem(product);
	};

	const buttonSizes = {
		sm: "h-8 w-8",
		default: "h-10 w-10",
		lg: "h-12 w-12",
	};

	const iconSizes = {
		sm: "h-4 w-4",
		default: "h-5 w-5",
		lg: "h-6 w-6",
	};

	return (
		<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<Button
				variant={variant}
				size={showText ? "default" : "icon"}
				className={cn(
					"transition-colors duration-200",
					!showText && buttonSizes[size],
					isInWishlist
						? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
						: "text-gray-500 hover:text-red-500 hover:bg-red-50",
					className
				)}
				onClick={handleClick}
				disabled={isLoading}
			>
				<Heart
					className={cn(
						iconSizes[size],
						isInWishlist && "fill-current",
						showText && "mr-2"
					)}
				/>
				{showText && (
					<span className="text-sm">
						{isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
					</span>
				)}
			</Button>
		</motion.div>
	);
}
