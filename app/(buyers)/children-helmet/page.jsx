import HeroSection from "@/components/BuyerPanel/ChildrenHelmet/HeroSection.jsx";
import ProductCategories from "@/components/BuyerPanel/ChildrenHelmet/ProductCategories.jsx";
import SafetyFeatures from "@/components/BuyerPanel/ChildrenHelmet/SafetyFeatures.jsx";
import ProductShowcase from "@/components/BuyerPanel/ChildrenHelmet/ProductShowcase.jsx";
import CollisionPreventionSection from "@/components/BuyerPanel/ChildrenHelmet/CollisionPreventionSection.jsx";
import TestimonialsSection from "@/components/BuyerPanel/ChildrenHelmet/TestimonialsSection.jsx";
import AboutSection from "@/components/BuyerPanel/ChildrenHelmet/AboutSection.jsx";
import Footer from "@/components/BuyerPanel/ChildrenHelmet/Footer";

export default function ChildrenHelmetPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Little Heads Big Adventures Section */}
			<HeroSection />

			{/* Safety Helmet Protection Section */}
			<SafetyFeatures />

			{/* Choose The Best Section */}
			<ProductShowcase />

			{/* Prevent Collisions from Happening Section */}
			<CollisionPreventionSection />

			{/* Reduce Impact To The Head */}
			<ProductCategories />

			{/* About Safety Online Section */}
			<AboutSection />

			{/* Testimonials Section */}
			<TestimonialsSection />

			<Footer/>
		</div>
	);
}
