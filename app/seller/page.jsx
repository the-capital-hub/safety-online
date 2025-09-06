"use client";

import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/SellerPanel/Layout/LoadingSpinner.jsx";

// Lazy load components for better performance
const HeroSection = lazy(() =>
	import("@/components/SellerPanel/LandingPage/HeroSection.jsx")
);
const SellerJourney = lazy(() =>
	import("@/components/SellerPanel/LandingPage/SellerJourney.jsx")
);
const SellerFeatures = lazy(() =>
	import("@/components/SellerPanel/LandingPage/SellerFeatures.jsx")
);
const ProductCategoriesSearch = lazy(() =>
	import("@/components/SellerPanel/LandingPage/ProductCategoriesSearch.jsx")
);
const FeaturedSellerCarousel = lazy(() =>
	import("@/components/SellerPanel/LandingPage/FeaturedSellerCarousel.jsx")
);
const SellerStorefrontShowcase = lazy(() =>
	import("@/components/SellerPanel/LandingPage/SellerStorefrontShowcase.jsx")
);
const ProductDetailSection = lazy(() =>
	import("@/components/SellerPanel/LandingPage/ProductDetailSection.jsx")
);
const SellerBenefits = lazy(() =>
	import("@/components/SellerPanel/LandingPage/SellerBenefits.jsx")
);
const TrustSection = lazy(() =>
	import("@/components/SellerPanel/LandingPage/TrustSection.jsx")
);

export default function SellerLandingPage() {
	return (
		<div className="min-h-screen">
			<Suspense fallback={<LoadingSpinner />}>
				<HeroSection />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<SellerJourney />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<SellerFeatures />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<ProductCategoriesSearch />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<FeaturedSellerCarousel />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<SellerStorefrontShowcase />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<ProductDetailSection />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<SellerBenefits />
			</Suspense>

			<Suspense fallback={<LoadingSpinner />}>
				<TrustSection />
			</Suspense>
		</div>
	);
}
