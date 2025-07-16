import { Suspense } from "react";
import SellerHeader from "@/components/SellerPanel/Header.jsx";
import SellerFooter from "@/components/SellerPanel/Footer.jsx";
import LoadingSpinner from "@/components/SellerPanel/LoadingSpinner.jsx";

export default function SellerLayout({ children }) {
	return (
		<div className="min-h-screen bg-white">
			<Suspense fallback={<LoadingSpinner />}>
				<SellerHeader />
			</Suspense>

			<main className="relative">
				<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
			</main>

			<Suspense fallback={<LoadingSpinner />}>
				<SellerFooter />
			</Suspense>
		</div>
	);
}
