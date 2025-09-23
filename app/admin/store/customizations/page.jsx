// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Upload } from "lucide-react";

// export default function StoreCustomizationsPage() {
// 	const [activeTab, setActiveTab] = useState("home-page");
// 	const [formData, setFormData] = useState({
// 		// Home Page
// 		headerContacts: "",
// 		headerText: "We are available 24/7, Need help?",
// 		phoneNumber: "+91 9999999767",
// 		headerLogo: null,
// 		menuItems: {
// 			categories: true,
// 			aboutUs: true,
// 			contactUs: true,
// 			offers: true,
// 			faq: true,
// 			privacyPolicy: true,
// 			termsConditions: true,
// 			login: true,
// 			logout: true,
// 			pages: true,
// 			myAccount: true,
// 			checkout: true,
// 		},
// 		// Slider
// 		sliderImages: null,
// 		sliderTitle: "",
// 		sliderDescription: "",
// 		sliderButtonName: "",
// 		sliderButtonLink: "",
// 		discountCouponShow: true,
// 		discountTitle: "Latest Super Discount Active Coupon Code",
// 		discountCode: "Latest Super Discount Active Coupon Code",
// 		// Promotion Banner
// 		promotionBannerShow: true,
// 		promotionTitle: "",
// 		promotionDescription: "",
// 		promotionButtonName: "",
// 		promotionButtonLink: "",
// 		// Featured Categories
// 		featuredCategoriesShow: true,
// 		featuredCategoriesTitle: "",
// 		featuredCategories: "",
// 		productsLimit: "",
// 		// Popular Products
// 		popularProductsShow: true,
// 		popularProductsTitle: "",
// 		popularProductsDescription: "",
// 		popularProductsLimit: "",
// 		// Quick Delivery
// 		quickDeliveryEnabled: true,
// 		quickDeliverySubTitle: "",
// 		quickDeliveryTitle: "",
// 		quickDeliveryDescription: "",
// 		quickDeliveryButtonName: "",
// 		quickDeliveryButtonLink: "",
// 		quickDeliveryImages: null,
// 		// About Us
// 		aboutUsEnabled: true,
// 		aboutUsPageHeader: "",
// 		aboutUsPageHeaderBackground: null,
// 		aboutUsPageTitle: "",
// 		aboutUsDescriptionThree: "",
// 		aboutUsDescriptionFour: "",
// 		// Product Slug Page
// 		productSlugEnabled: true,
// 		productSlugDescriptionOne: "",
// 		productSlugDescriptionTwo: "",
// 		productSlugDescriptionThree: "",
// 		productSlugDescriptionFour: "",
// 		// Contact Us
// 		contactUsEnabled: true,
// 		contactUsPageTitle: "",
// 		contactUsPageHeaderBackground: null,
// 		contactUsEmailBoxEnabled: true,
// 		contactUsEmailTitle: "",
// 		contactUsEmail: "",
// 		contactUsText: "",
// 		// Offers
// 		offersEnabled: true,
// 		offersPageHeader: "",
// 		offersPageHeaderBackground: null,
// 		offersPageTitle: "",
// 		// Privacy Policy
// 		privacyPolicyEnabled: true,
// 		privacyPolicyPageHeaderBackground: null,
// 		privacyPolicyPageTitle: "",
// 		privacyPolicyPageText: "",
// 	});

// 	const handleInputChange = (field, value) => {
// 		setFormData((prev) => ({ ...prev, [field]: value }));
// 	};

// 	const handleMenuItemToggle = (item, value) => {
// 		setFormData((prev) => ({
// 			...prev,
// 			menuItems: { ...prev.menuItems, [item]: value },
// 		}));
// 	};

// 	const handleFileUpload = (field, files) => {
// 		setFormData((prev) => ({ ...prev, [field]: files }));
// 	};

// 	const handleSubmit = (e) => {
// 		e.preventDefault();
//              if (!e.currentTarget.checkValidity()) {
//                      e.currentTarget.reportValidity();
//                      return;
//              }
// 		console.log("Updating store customizations:", formData);
// 	};

// 	const FileUploadArea = ({ field, label }) => (
// 		<div>
// 			<Label>{label}</Label>
// 			<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-1">
// 				<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
// 				<p className="text-sm text-gray-600 mb-2">Drag your images here</p>
// 				<input
// 					type="file"
// 					accept="image/*"
// 					multiple
// 					onChange={(e) => handleFileUpload(field, e.target.files)}
// 					className="hidden"
// 					id={`${field}-upload`}
// 				/>
// 				<label htmlFor={`${field}-upload`}>
// 					<Button
// 						type="button"
// 						variant="outline"
// 						className="cursor-pointer bg-transparent"
// 					>
// 						Browse Files
// 					</Button>
// 				</label>
// 			</div>
// 		</div>
// 	);

// 	return (
// 		<div className="space-y-6">
// 			<motion.div
// 				initial={{ opacity: 0, y: 20 }}
// 				animate={{ opacity: 1, y: 0 }}
// 				transition={{ duration: 0.3 }}
// 			>
// 				<h1 className="text-3xl font-bold text-gray-900">
// 					Store Customizations
// 				</h1>
// 			</motion.div>

// 			<Card>
// 				<CardContent className="p-6">
// 					<Tabs value={activeTab} onValueChange={setActiveTab}>
// 						<TabsList className="grid w-full grid-cols-6">
// 							<TabsTrigger value="home-page">Home Page</TabsTrigger>
// 							<TabsTrigger value="product-slug-page">
// 								Product Slug Page
// 							</TabsTrigger>
// 							<TabsTrigger value="about-us">About Us</TabsTrigger>
// 							<TabsTrigger value="privacy-policy">
// 								Privacy Policy and T&C
// 							</TabsTrigger>
// 							<TabsTrigger value="offers">Offers</TabsTrigger>
// 							<TabsTrigger value="contact-us">Contact Us</TabsTrigger>
// 						</TabsList>

// 						<form onSubmit={handleSubmit} className="mt-6">
// 							{/* Home Page Tab */}
// 							<TabsContent value="home-page" className="space-y-6">
// 								{/* Header Section */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Header</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div>
// 											<Label htmlFor="header-contacts">Header Contacts</Label>
// 											<Input
// 												id="header-contacts"
// 												value={formData.headerContacts}
// 												onChange={(e) =>
// 													handleInputChange("headerContacts", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="header-text">Header Text</Label>
// 											<Input
// 												id="header-text"
// 												value={formData.headerText}
// 												onChange={(e) =>
// 													handleInputChange("headerText", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="phone-number">Phone Number</Label>
// 											<Input
// 												id="phone-number"
// 												value={formData.phoneNumber}
// 												onChange={(e) =>
// 													handleInputChange("phoneNumber", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<FileUploadArea field="headerLogo" label="Header Logo" />
// 									</CardContent>
// 								</Card>

// 								{/* Menu Section */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Menu</CardTitle>
// 									</CardHeader>
// 									<CardContent>
// 										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// 											{Object.entries(formData.menuItems).map(
// 												([key, value]) => (
// 													<div
// 														key={key}
// 														className="flex items-center justify-between"
// 													>
// 														<Label className="capitalize">
// 															{key.replace(/([A-Z])/g, " $1").trim()}
// 														</Label>
// 														<Switch
// 															checked={value}
// 															onCheckedChange={(checked) =>
// 																handleMenuItemToggle(key, checked)
// 															}
// 														/>
// 													</div>
// 												)
// 											)}
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Main Slider Section */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Main Slider</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex gap-2 mb-4">
// 											{[1, 2, 3, 4, 5].map((num) => (
// 												<Button key={num} variant="outline" size="sm">
// 													Slider {num}
// 												</Button>
// 											))}
// 										</div>

// 										<FileUploadArea
// 											field="sliderImages"
// 											label="Slider Images"
// 										/>

// 										<div>
// 											<Label htmlFor="slider-title">Slider Title</Label>
// 											<Input
// 												id="slider-title"
// 												placeholder="Slider Title"
// 												value={formData.sliderTitle}
// 												onChange={(e) =>
// 													handleInputChange("sliderTitle", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="slider-description">
// 												Slider Description
// 											</Label>
// 											<Textarea
// 												id="slider-description"
// 												placeholder="Slider Description"
// 												value={formData.sliderDescription}
// 												onChange={(e) =>
// 													handleInputChange("sliderDescription", e.target.value)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="slider-button-name">
// 												Slider Button Name
// 											</Label>
// 											<Input
// 												id="slider-button-name"
// 												placeholder="Slider Button Name"
// 												value={formData.sliderButtonName}
// 												onChange={(e) =>
// 													handleInputChange("sliderButtonName", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="slider-button-link">
// 												Slider Button Link
// 											</Label>
// 											<Input
// 												id="slider-button-link"
// 												placeholder="Slider Button Link"
// 												value={formData.sliderButtonLink}
// 												onChange={(e) =>
// 													handleInputChange("sliderButtonLink", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Discount Coupon Code Box */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Discount Coupon Code Box</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Show / Hide</Label>
// 											<Switch
// 												checked={formData.discountCouponShow}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("discountCouponShow", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="discount-title">
// 												Home Page Discount Title
// 											</Label>
// 											<Input
// 												id="discount-title"
// 												value={formData.discountTitle}
// 												onChange={(e) =>
// 													handleInputChange("discountTitle", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="discount-code">
// 												Super Discount Active Coupon Code
// 											</Label>
// 											<Input
// 												id="discount-code"
// 												value={formData.discountCode}
// 												onChange={(e) =>
// 													handleInputChange("discountCode", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Promotion Banner */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Promotion Banner</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Show / Hide</Label>
// 											<Switch
// 												checked={formData.promotionBannerShow}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("promotionBannerShow", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="promotion-title">Title</Label>
// 											<Input
// 												id="promotion-title"
// 												value={formData.promotionTitle}
// 												onChange={(e) =>
// 													handleInputChange("promotionTitle", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="promotion-description">Description</Label>
// 											<Textarea
// 												id="promotion-description"
// 												value={formData.promotionDescription}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"promotionDescription",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="promotion-button-name">Button Name</Label>
// 											<Input
// 												id="promotion-button-name"
// 												value={formData.promotionButtonName}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"promotionButtonName",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="promotion-button-link">Button Link</Label>
// 											<Input
// 												id="promotion-button-link"
// 												value={formData.promotionButtonLink}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"promotionButtonLink",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Featured Categories */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Featured Categories</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Show / Hide</Label>
// 											<Switch
// 												checked={formData.featuredCategoriesShow}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("featuredCategoriesShow", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="featured-categories-title">Title</Label>
// 											<Input
// 												id="featured-categories-title"
// 												value={formData.featuredCategoriesTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"featuredCategoriesTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="featured-categories">
// 												Featured Categories
// 											</Label>
// 											<Textarea
// 												id="featured-categories"
// 												value={formData.featuredCategories}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"featuredCategories",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="products-limit">Products Limit</Label>
// 											<Input
// 												id="products-limit"
// 												value={formData.productsLimit}
// 												onChange={(e) =>
// 													handleInputChange("productsLimit", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Popular Products */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Popular Products</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Show / Hide</Label>
// 											<Switch
// 												checked={formData.popularProductsShow}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("popularProductsShow", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="popular-products-title">Title</Label>
// 											<Input
// 												id="popular-products-title"
// 												value={formData.popularProductsTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"popularProductsTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="popular-products-description">
// 												Description
// 											</Label>
// 											<Textarea
// 												id="popular-products-description"
// 												value={formData.popularProductsDescription}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"popularProductsDescription",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="popular-products-limit">
// 												Products Limit
// 											</Label>
// 											<Input
// 												id="popular-products-limit"
// 												value={formData.popularProductsLimit}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"popularProductsLimit",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>

// 								{/* Quick Delivery Section */}
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Quick Delivery Section</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.quickDeliveryEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("quickDeliveryEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="quick-delivery-sub-title">
// 												Sub Title
// 											</Label>
// 											<Input
// 												id="quick-delivery-sub-title"
// 												placeholder="Sub Title"
// 												value={formData.quickDeliverySubTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"quickDeliverySubTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="quick-delivery-title">Title</Label>
// 											<Input
// 												id="quick-delivery-title"
// 												placeholder="Title"
// 												value={formData.quickDeliveryTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"quickDeliveryTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="quick-delivery-description">
// 												Description
// 											</Label>
// 											<Textarea
// 												id="quick-delivery-description"
// 												placeholder="Description"
// 												value={formData.quickDeliveryDescription}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"quickDeliveryDescription",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="quick-delivery-button-name">
// 												Button Name
// 											</Label>
// 											<Input
// 												id="quick-delivery-button-name"
// 												placeholder="Button Name"
// 												value={formData.quickDeliveryButtonName}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"quickDeliveryButtonName",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="quick-delivery-button-link">
// 												Button Link
// 											</Label>
// 											<Input
// 												id="quick-delivery-button-link"
// 												placeholder="Button Link"
// 												value={formData.quickDeliveryButtonLink}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"quickDeliveryButtonLink",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<FileUploadArea
// 											field="quickDeliveryImages"
// 											label="Images"
// 										/>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							{/* Product Slug Page Tab */}
// 							<TabsContent value="product-slug-page" className="space-y-6">
// 								<Card>
// 									<CardContent className="space-y-4 pt-6">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this break</Label>
// 											<Switch
// 												checked={formData.productSlugEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("productSlugEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="product-slug-description-one">
// 												Description One
// 											</Label>
// 											<Textarea
// 												id="product-slug-description-one"
// 												value={formData.productSlugDescriptionOne}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"productSlugDescriptionOne",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="product-slug-description-two">
// 												Description Two
// 											</Label>
// 											<Textarea
// 												id="product-slug-description-two"
// 												value={formData.productSlugDescriptionTwo}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"productSlugDescriptionTwo",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="product-slug-description-three">
// 												Description Three
// 											</Label>
// 											<Textarea
// 												id="product-slug-description-three"
// 												value={formData.productSlugDescriptionThree}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"productSlugDescriptionThree",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="product-slug-description-four">
// 												Description Four
// 											</Label>
// 											<Textarea
// 												id="product-slug-description-four"
// 												value={formData.productSlugDescriptionFour}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"productSlugDescriptionFour",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							{/* About Us Tab */}
// 							<TabsContent value="about-us" className="space-y-6">
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>About Us</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.aboutUsEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("aboutUsEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="about-us-page-header">Page Header</Label>
// 											<Input
// 												id="about-us-page-header"
// 												value={formData.aboutUsPageHeader}
// 												onChange={(e) =>
// 													handleInputChange("aboutUsPageHeader", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<FileUploadArea
// 											field="aboutUsPageHeaderBackground"
// 											label="Page Header Background"
// 										/>

// 										<div>
// 											<Label htmlFor="about-us-page-title">Page Title</Label>
// 											<Input
// 												id="about-us-page-title"
// 												value={formData.aboutUsPageTitle}
// 												onChange={(e) =>
// 													handleInputChange("aboutUsPageTitle", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="about-us-description-three">
// 												Description Three
// 											</Label>
// 											<Textarea
// 												id="about-us-description-three"
// 												value={formData.aboutUsDescriptionThree}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"aboutUsDescriptionThree",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="about-us-description-four">
// 												Description Four
// 											</Label>
// 											<Textarea
// 												id="about-us-description-four"
// 												value={formData.aboutUsDescriptionFour}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"aboutUsDescriptionFour",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							{/* Privacy Policy Tab */}
// 							<TabsContent value="privacy-policy" className="space-y-6">
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Privacy Policy and T&C</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.privacyPolicyEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("privacyPolicyEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<FileUploadArea
// 											field="privacyPolicyPageHeaderBackground"
// 											label="Page Header Background"
// 										/>

// 										<div>
// 											<Label htmlFor="privacy-policy-page-title">
// 												Page Title
// 											</Label>
// 											<Input
// 												id="privacy-policy-page-title"
// 												value={formData.privacyPolicyPageTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"privacyPolicyPageTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="privacy-policy-page-text">
// 												Page Text
// 											</Label>
// 											<Textarea
// 												id="privacy-policy-page-text"
// 												value={formData.privacyPolicyPageText}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"privacyPolicyPageText",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 												rows={5}
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							{/* Offers Tab */}
// 							<TabsContent value="offers" className="space-y-6">
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Offers</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.offersEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("offersEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="offers-page-header">Page Header</Label>
// 											<Input
// 												id="offers-page-header"
// 												value={formData.offersPageHeader}
// 												onChange={(e) =>
// 													handleInputChange("offersPageHeader", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<FileUploadArea
// 											field="offersPageHeaderBackground"
// 											label="Page Header Background"
// 										/>

// 										<div>
// 											<Label htmlFor="offers-page-title">Page Title</Label>
// 											<Input
// 												id="offers-page-title"
// 												value={formData.offersPageTitle}
// 												onChange={(e) =>
// 													handleInputChange("offersPageTitle", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							{/* Contact Us Tab */}
// 							<TabsContent value="contact-us" className="space-y-6">
// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Contact Us</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.contactUsEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("contactUsEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="contact-us-page-title">Page Title</Label>
// 											<Input
// 												id="contact-us-page-title"
// 												value={formData.contactUsPageTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"contactUsPageTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<FileUploadArea
// 											field="contactUsPageHeaderBackground"
// 											label="Page Header Background"
// 										/>
// 									</CardContent>
// 								</Card>

// 								<Card>
// 									<CardHeader>
// 										<CardTitle>Email Us Box</CardTitle>
// 									</CardHeader>
// 									<CardContent className="space-y-4">
// 										<div className="flex items-center justify-between">
// 											<Label>Enable this block</Label>
// 											<Switch
// 												checked={formData.contactUsEmailBoxEnabled}
// 												onCheckedChange={(checked) =>
// 													handleInputChange("contactUsEmailBoxEnabled", checked)
// 												}
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="contact-us-email-title">Title</Label>
// 											<Input
// 												id="contact-us-email-title"
// 												value={formData.contactUsEmailTitle}
// 												onChange={(e) =>
// 													handleInputChange(
// 														"contactUsEmailTitle",
// 														e.target.value
// 													)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="contact-us-email">Email</Label>
// 											<Input
// 												id="contact-us-email"
// 												type="email"
// 												value={formData.contactUsEmail}
// 												onChange={(e) =>
// 													handleInputChange("contactUsEmail", e.target.value)
// 												}
// 												className="mt-1"
// 											/>
// 										</div>

// 										<div>
// 											<Label htmlFor="contact-us-text">Text</Label>
// 											<Textarea
// 												id="contact-us-text"
// 												value={formData.contactUsText}
// 												onChange={(e) =>
// 													handleInputChange("contactUsText", e.target.value)
// 												}
// 												className="mt-1"
// 												rows={3}
// 											/>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</TabsContent>

// 							<div className="flex justify-end pt-6">
// 								<Button
// 									type="submit"
// 									className="bg-green-600 hover:bg-green-700"
// 								>
// 									Update
// 								</Button>
// 							</div>
// 						</form>
// 					</Tabs>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all section components
import { HeaderSection } from "@/components/AdminPanel/StoreCustomization/HeaderSection.jsx";
import { MenuSection } from "@/components/AdminPanel/StoreCustomization/MenuSection.jsx";
import { SliderSection } from "@/components/AdminPanel/StoreCustomization/SliderSection.jsx";
import { DiscountCouponSection } from "@/components/AdminPanel/StoreCustomization/DiscountCouponSection.jsx";
import { PromotionBannerSection } from "@/components/AdminPanel/StoreCustomization/PromotionBannerSection.jsx";
import { FeaturedCategoriesSection } from "@/components/AdminPanel/StoreCustomization/FeaturedCategoriesSection.jsx";
import { PopularProductsSection } from "@/components/AdminPanel/StoreCustomization/PopularProductsSection.jsx";
import { QuickDeliverySection } from "@/components/AdminPanel/StoreCustomization/QuickDeliverySection.jsx";
import { FeaturePromoSection } from "@/components/AdminPanel/StoreCustomization/FeaturePromoSection.jsx";
import { FooterSection } from "@/components/AdminPanel/StoreCustomization/FooterSection.jsx";
import { FooterBlock2Section } from "@/components/AdminPanel/StoreCustomization/FooterBlock2Section.jsx";
import { SocialLinksSection } from "@/components/AdminPanel/StoreCustomization/SocialLinksSection.jsx";
import { PaymentMethodSection } from "@/components/AdminPanel/StoreCustomization/PaymentMethodSection.jsx";
import { FooterContactSection } from "@/components/AdminPanel/StoreCustomization/FooterContactSection.jsx";
import { LatestDiscountedProductsSection } from "@/components/AdminPanel/StoreCustomization/LatestDiscountedProductsSection.jsx";
import { DailyNeedsSection } from "@/components/AdminPanel/StoreCustomization/DailyNeedsSection.jsx";

// Import other tab components
import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";


import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

export default function StoreCustomizationsPage() {
	const [activeTab, setActiveTab] = useState("home-page");
	const [updatingSection, setUpdatingSection] = useState(null);
	const [formData, setFormData] = useState({
		// Home Page
		headerContacts: "",
		headerText: "We are available 24/7, Need help?",
		phoneNumber: "+91 9999999767",
		headerLogo: null,
		menuItems: {
			categories: true,
			aboutUs: true,
			contactUs: true,
			offers: true,
			faq: true,
			privacyPolicy: true,
			termsConditions: true,
			login: true,
			logout: true,
			pages: true,
			myAccount: true,
			checkout: true,
		},
		// Slider
		sliderImages: null,
		sliderTitle: "",
		sliderDescription: "",
		sliderButtonName: "",
		sliderButtonLink: "",
		discountCouponShow: true,
		discountTitle: "Latest Super Discount Active Coupon Code",
		discountCode: "Latest Super Discount Active Coupon Code",
		// Promotion Banner
		promotionBannerShow: true,
		promotionTitle: "",
		promotionDescription: "",
		promotionButtonName: "",
		promotionButtonLink: "",
		// Featured Categories
		featuredCategoriesShow: true,
		featuredCategoriesTitle: "",
		featuredCategories: "",
		productsLimit: "",
		// Popular Products
		popularProductsShow: true,
		popularProductsTitle: "",
		popularProductsDescription: "",
		popularProductsLimit: "",
		// Quick Delivery
		quickDeliveryEnabled: true,
		quickDeliverySubTitle: "",
		quickDeliveryTitle: "",
		quickDeliveryDescription: "",
		quickDeliveryButtonName: "",
		quickDeliveryButtonLink: "",
		quickDeliveryImages: null,
		// Feature Promo Section
		featurePromoEnabled: true,
		freeShipping: "",
		support: "",
		securePayment: "",
		latestOffer: "",
		button1Image: null,
		button1Link: "",
		button2Image: null,
		button2Link: "",
		// Footer Block 1
		footerBlock1Enabled: true,
		footerBlock1Title: "",
		footerBlock1Link1: "",
		footerBlock1Link2: "",
		footerBlock1Link3: "",
		footerBlock1Link4: "",
		// Footer Block 2
		footerBlock2Enabled: true,
		footerBlock2Title: "",
		footerBlock2Link1: "",
		footerBlock2Link2: "",
		footerBlock2Link3: "",
		footerBlock2Link4: "",
		// Social Links
		socialLinksEnabled: true,
		facebookLink: "",
		twitterLink: "",
		pinterestLink: "",
		linkedinLink: "",
		whatsappLink: "",
		// Payment Method
		paymentMethodEnabled: true,
		paymentMethodImage: null,
		// Footer Contact
		footerContactEnabled: true,
		footerContactNumber: "",
		// Latest Discounted Products
		latestDiscountedProductsEnabled: true,
		latestDiscountedProductsTitle: "",
		latestDiscountedProductsDescription: "",
		latestDiscountedProductsLimit: "0",
		// Daily Needs
		dailyNeedsEnabled: true,
		dailyNeedsTitle: "",
		dailyNeedsDescription: "",
		dailyNeedsImageLeft: null,
		dailyNeedsImageRight: null,
		// About Us
		aboutUsEnabled: true,
		aboutUsPageHeader: "",
		aboutUsPageHeaderBackground: null,
		aboutUsPageTitle: "",
		aboutUsDescriptionThree: "",
		aboutUsDescriptionFour: "",
		// Product Slug Page
		productSlugEnabled: true,
		productSlugDescriptionOne: "",
		productSlugDescriptionTwo: "",
		productSlugDescriptionThree: "",
		productSlugDescriptionFour: "",
		// Contact Us
		contactUsEnabled: true,
		contactUsPageTitle: "",
		contactUsPageHeaderBackground: null,
		contactUsEmailBoxEnabled: true,
		contactUsEmailTitle: "",
		contactUsEmail: "",
		contactUsText: "",
		// Offers
		offersEnabled: true,
		offersPageHeader: "",
		offersPageHeaderBackground: null,
		offersPageTitle: "",
		// Privacy Policy
		privacyPolicyEnabled: true,
		privacyPolicyPageHeaderBackground: null,
		privacyPolicyPageTitle: "",
		privacyPolicyPageText: "",
	});

	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleMenuItemToggle = (item, value) => {
		setFormData((prev) => ({
			...prev,
			menuItems: { ...prev.menuItems, [item]: value },
		}));
	};

	const handleFileUpload = (field, files) => {
		setFormData((prev) => ({ ...prev, [field]: files }));
	};

	const handleSectionUpdate = async (sectionName) => {
		setUpdatingSection(sectionName);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log(`Updated ${sectionName} section:`, formData);
		} catch (error) {
			console.error(`Error updating ${sectionName}:`, error);
		} finally {
			setUpdatingSection(null);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);
			
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold text-gray-900">
					Store Customizations
				</h1>
			</motion.div>

			<Card>
				<CardContent className="p-6">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-6">
							<TabsTrigger value="home-page">Home Page</TabsTrigger>
							<TabsTrigger value="product-slug-page">
								Product Slug Page
							</TabsTrigger>
							<TabsTrigger value="about-us">About Us</TabsTrigger>
							<TabsTrigger value="privacy-policy">
								Privacy Policy and T&C
							</TabsTrigger>
							<TabsTrigger value="offers">Offers</TabsTrigger>
							<TabsTrigger value="contact-us">Contact Us</TabsTrigger>
						</TabsList>

						{/* Home Page Tab */}
						<TabsContent value="home-page" className="space-y-6 mt-6">
							<HeaderSection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "header"}
							/>

							<MenuSection
								data={formData}
								onUpdate={handleInputChange}
								onMenuItemToggle={handleMenuItemToggle}
								isUpdating={updatingSection === "menu"}
							/>

							<SliderSection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "slider"}
							/>

							<DiscountCouponSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "discountCoupon"}
							/>

							<PromotionBannerSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "promotionBanner"}
							/>

							<FeaturedCategoriesSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "featuredCategories"}
							/>

							<PopularProductsSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "popularProducts"}
							/>

							<QuickDeliverySection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "quickDelivery"}
							/>

							<FeaturePromoSection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "featurePromo"}
							/>

							<LatestDiscountedProductsSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "latestDiscountedProducts"}
							/>

							<DailyNeedsSection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "dailyNeeds"}
							/>

							<FooterSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "footer"}
							/>

							<FooterBlock2Section
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "footerBlock2"}
							/>

							<SocialLinksSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "socialLinks"}
							/>

							<PaymentMethodSection
								data={formData}
								onUpdate={handleInputChange}
								onFileUpload={handleFileUpload}
								isUpdating={updatingSection === "paymentMethod"}
							/>

							<FooterContactSection
								data={formData}
								onUpdate={handleInputChange}
								isUpdating={updatingSection === "footerContact"}
							/>
						</TabsContent>

						{/* Product Slug Page Tab */}
						<TabsContent value="product-slug-page" className="space-y-6 mt-6">
							<SectionCard
								title="Product Slug Page"
								onUpdate={() => handleSectionUpdate("productSlug")}
								isUpdating={updatingSection === "productSlug"}
							>
								<ToggleField
									label="Enable this break"
									checked={formData.productSlugEnabled}
									onToggle={(checked) =>
										handleInputChange("productSlugEnabled", checked)
									}
								/>

								<TextareaField
									label="Description One"
									value={formData.productSlugDescriptionOne}
									onChange={(value) =>
										handleInputChange("productSlugDescriptionOne", value)
									}
									id="product-slug-description-one"
								/>

								<TextareaField
									label="Description Two"
									value={formData.productSlugDescriptionTwo}
									onChange={(value) =>
										handleInputChange("productSlugDescriptionTwo", value)
									}
									id="product-slug-description-two"
								/>

								<TextareaField
									label="Description Three"
									value={formData.productSlugDescriptionThree}
									onChange={(value) =>
										handleInputChange("productSlugDescriptionThree", value)
									}
									id="product-slug-description-three"
								/>

								<TextareaField
									label="Description Four"
									value={formData.productSlugDescriptionFour}
									onChange={(value) =>
										handleInputChange("productSlugDescriptionFour", value)
									}
									id="product-slug-description-four"
								/>
							</SectionCard>
						</TabsContent>

						{/* About Us Tab */}
						<TabsContent value="about-us" className="space-y-6 mt-6">
							<SectionCard
								title="About Us"
								onUpdate={() => handleSectionUpdate("aboutUs")}
								isUpdating={updatingSection === "aboutUs"}
							>
								<ToggleField
									label="Enable this block"
									checked={formData.aboutUsEnabled}
									onToggle={(checked) =>
										handleInputChange("aboutUsEnabled", checked)
									}
								/>

								<InputField
									label="Page Header"
									value={formData.aboutUsPageHeader}
									onChange={(value) =>
										handleInputChange("aboutUsPageHeader", value)
									}
									id="about-us-page-header"
								/>

								<FileUploadArea
									field="aboutUsPageHeaderBackground"
									label="Page Header Background"
									onFileUpload={handleFileUpload}
								/>

								<InputField
									label="Page Title"
									value={formData.aboutUsPageTitle}
									onChange={(value) =>
										handleInputChange("aboutUsPageTitle", value)
									}
									id="about-us-page-title"
								/>

								<TextareaField
									label="Description Three"
									value={formData.aboutUsDescriptionThree}
									onChange={(value) =>
										handleInputChange("aboutUsDescriptionThree", value)
									}
									id="about-us-description-three"
								/>

								<TextareaField
									label="Description Four"
									value={formData.aboutUsDescriptionFour}
									onChange={(value) =>
										handleInputChange("aboutUsDescriptionFour", value)
									}
									id="about-us-description-four"
								/>
							</SectionCard>
						</TabsContent>

						{/* Privacy Policy Tab */}
						<TabsContent value="privacy-policy" className="space-y-6 mt-6">
							<SectionCard
								title="Privacy Policy and T&C"
								onUpdate={() => handleSectionUpdate("privacyPolicy")}
								isUpdating={updatingSection === "privacyPolicy"}
							>
								<ToggleField
									label="Enable this block"
									checked={formData.privacyPolicyEnabled}
									onToggle={(checked) =>
										handleInputChange("privacyPolicyEnabled", checked)
									}
								/>

								<FileUploadArea
									field="privacyPolicyPageHeaderBackground"
									label="Page Header Background"
									onFileUpload={handleFileUpload}
								/>

								<InputField
									label="Page Title"
									value={formData.privacyPolicyPageTitle}
									onChange={(value) =>
										handleInputChange("privacyPolicyPageTitle", value)
									}
									id="privacy-policy-page-title"
								/>

								<TextareaField
									label="Page Text"
									value={formData.privacyPolicyPageText}
									onChange={(value) =>
										handleInputChange("privacyPolicyPageText", value)
									}
									rows={5}
									id="privacy-policy-page-text"
								/>
							</SectionCard>
						</TabsContent>

						{/* Offers Tab */}
						<TabsContent value="offers" className="space-y-6 mt-6">
							<SectionCard
								title="Offers"
								onUpdate={() => handleSectionUpdate("offers")}
								isUpdating={updatingSection === "offers"}
							>
								<ToggleField
									label="Enable this block"
									checked={formData.offersEnabled}
									onToggle={(checked) =>
										handleInputChange("offersEnabled", checked)
									}
								/>

								<InputField
									label="Page Header"
									value={formData.offersPageHeader}
									onChange={(value) =>
										handleInputChange("offersPageHeader", value)
									}
									id="offers-page-header"
								/>

								<FileUploadArea
									field="offersPageHeaderBackground"
									label="Page Header Background"
									onFileUpload={handleFileUpload}
								/>

								<InputField
									label="Page Title"
									value={formData.offersPageTitle}
									onChange={(value) =>
										handleInputChange("offersPageTitle", value)
									}
									id="offers-page-title"
								/>
							</SectionCard>
						</TabsContent>

						{/* Contact Us Tab */}
						<TabsContent value="contact-us" className="space-y-6 mt-6">
							<SectionCard
								title="Contact Us"
								onUpdate={() => handleSectionUpdate("contactUs")}
								isUpdating={updatingSection === "contactUs"}
							>
								<ToggleField
									label="Enable this block"
									checked={formData.contactUsEnabled}
									onToggle={(checked) =>
										handleInputChange("contactUsEnabled", checked)
									}
								/>

								<InputField
									label="Page Title"
									value={formData.contactUsPageTitle}
									onChange={(value) =>
										handleInputChange("contactUsPageTitle", value)
									}
									id="contact-us-page-title"
								/>

								<FileUploadArea
									field="contactUsPageHeaderBackground"
									label="Page Header Background"
									onFileUpload={handleFileUpload}
								/>
							</SectionCard>

							<SectionCard
								title="Email Us Box"
								onUpdate={() => handleSectionUpdate("contactUsEmailBox")}
								isUpdating={updatingSection === "contactUsEmailBox"}
							>
								<ToggleField
									label="Enable this block"
									checked={formData.contactUsEmailBoxEnabled}
									onToggle={(checked) =>
										handleInputChange("contactUsEmailBoxEnabled", checked)
									}
								/>

								<InputField
									label="Title"
									value={formData.contactUsEmailTitle}
									onChange={(value) =>
										handleInputChange("contactUsEmailTitle", value)
									}
									id="contact-us-email-title"
								/>

								<InputField
									label="Email"
									type="email"
									value={formData.contactUsEmail}
									onChange={(value) =>
										handleInputChange("contactUsEmail", value)
									}
									id="contact-us-email"
								/>

								<TextareaField
									label="Text"
									value={formData.contactUsText}
									onChange={(value) =>
										handleInputChange("contactUsText", value)
									}
									id="contact-us-text"
								/>
							</SectionCard>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
