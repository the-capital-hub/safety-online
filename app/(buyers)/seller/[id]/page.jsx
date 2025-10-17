"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
        Mail,
        Phone,
        MapPin,
        ShieldCheck,
        Star,
        Search,
        Store,
        CheckCircle2,
        Share2,
        AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/BuyerPanel/products/ProductCard";
import { toast } from "react-hot-toast";

const FALLBACK_LOGO =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

const toSentenceCase = (str) => {
        if (!str) return "";

        return str
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
};

const getHeadOfficeAddress = (seller) => {
        if (!seller?.companyAddress?.length) {
                return null;
        }

        const normalizedAddresses = seller.companyAddress.map((addr) => ({
                ...addr,
                tagName: addr.tagName?.toLowerCase() || "",
        }));

        const headOffice =
                normalizedAddresses.find((addr) => addr.tagName === "head office") ||
                normalizedAddresses[0];

        if (!headOffice) {
                return null;
        }

        const { building, street, city, state, pincode, country, tagName } = headOffice;

        return {
                label: tagName ? toSentenceCase(tagName) : "Registered Address",
                fullAddress: [building, street, city, state, pincode, country]
                        .filter(Boolean)
                        .join(", "),
        };
};

export default function SellerPage() {
        const { id } = useParams();
        const [seller, setSeller] = useState(null);
        const [categories, setCategories] = useState(["All Products"]);
        const [activeCategory, setActiveCategory] = useState("All Products");
        const [products, setProducts] = useState([]);
        const [searchQuery, setSearchQuery] = useState("");
        const [detailsLoading, setDetailsLoading] = useState(true);
        const [productsLoading, setProductsLoading] = useState(true);
        const [detailsError, setDetailsError] = useState(null);
        const [productsError, setProductsError] = useState(null);

        useEffect(() => {
                if (!id) {
                        return;
                }

                const fetchSellerDetails = async () => {
                        setDetailsLoading(true);
                        setDetailsError(null);

                        try {
                                const response = await fetch(`/api/seller/details/${id}`);
                                const data = await response.json();

                                if (data.success) {
                                        setSeller(data.seller);

                                        const uniqueCategories = Array.from(
                                                new Set(
                                                        (data.categories || [])
                                                                .filter((category) => typeof category === "string")
                                                                .map((category) => category.trim())
                                                                .filter(Boolean)
                                                )
                                        );

                                        setCategories(["All Products", ...uniqueCategories]);
                                        setActiveCategory((currentCategory) =>
                                                currentCategory === "All Products" ||
                                                uniqueCategories.includes(currentCategory)
                                                        ? currentCategory
                                                        : "All Products"
                                        );
                                } else {
                                        setDetailsError(
                                                data.message || "We couldn't load this seller right now."
                                        );
                                }
                        } catch (error) {
                                console.error("Error fetching seller details:", error);
                                setDetailsError("Failed to load seller details.");
                        } finally {
                                setDetailsLoading(false);
                        }
                };

                fetchSellerDetails();
        }, [id]);

        useEffect(() => {
                if (!id) {
                        return;
                }

                const controller = new AbortController();

                const fetchSellerProducts = async () => {
                        setProductsLoading(true);
                        setProductsError(null);

                        try {
                                const params = new URLSearchParams({
                                        sellerId: id,
                                        limit: "16",
                                });

                                if (activeCategory && activeCategory !== "All Products") {
                                        params.append("category", activeCategory);
                                }

                                const response = await fetch(
                                        `/api/seller/products?${params.toString()}`,
                                        { signal: controller.signal }
                                );
                                const data = await response.json();

                                if (data.success) {
                                        setProducts(data.products || []);
                                } else {
                                        setProducts([]);
                                        setProductsError(
                                                data.message || "Unable to load this seller's products."
                                        );
                                }
                        } catch (error) {
                                if (error.name === "AbortError") {
                                        return;
                                }

                                console.error("Error fetching seller products:", error);
                                setProducts([]);
                                setProductsError("Failed to load seller products.");
                        } finally {
                                setProductsLoading(false);
                        }
                };

                fetchSellerProducts();

                return () => controller.abort();
        }, [id, activeCategory]);

        const filteredProducts = useMemo(() => {
                if (!searchQuery) {
                        return products;
                }

                return products.filter((product) => {
                        const haystacks = [product.title, product.description]
                                .map((value) => value?.toLowerCase() || "");
                        const needle = searchQuery.toLowerCase();

                        return haystacks.some((value) => value.includes(needle));
                });
        }, [products, searchQuery]);

        const headOfficeAddress = useMemo(() => getHeadOfficeAddress(seller), [seller]);
        const highlightCategories = useMemo(
                () => categories.slice(1, 4).filter(Boolean),
                [categories]
        );

        const sellerDisplayName = seller?.brandName || seller?.companyName || "Seller";

        const handleShareProfile = async () => {
                if (!seller) {
                        toast.error("Seller profile is not available yet.");
                        return;
                }

                if (typeof window === "undefined") {
                        return;
                }

                const shareUrl = window.location.href;
                const shareData = {
                        title: sellerDisplayName,
                        text: `Explore ${sellerDisplayName} on Safety Online`,
                        url: shareUrl,
                };

                try {
                        if (typeof navigator !== "undefined" && navigator.share) {
                                await navigator.share(shareData);
                                return;
                        }

                        if (
                                typeof navigator !== "undefined" &&
                                navigator.clipboard?.writeText
                        ) {
                                await navigator.clipboard.writeText(shareUrl);
                                toast.success("Seller profile link copied to clipboard!");
                                return;
                        }

                        throw new Error("Sharing is not supported");
                } catch (error) {
                        if (error?.name === "AbortError") {
                                return;
                        }

                        console.error("Error sharing seller profile:", error);
                        toast.error("Unable to share this profile right now. Please try again.");
                }
        };

        if (detailsLoading) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                );
        }

        if (detailsError || !seller) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center px-6">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                                Seller Not Available
                                        </h1>
                                        <p className="text-gray-600 mb-8">
                                                {detailsError || "The requested seller could not be found."}
                                        </p>
                                        <Link href="/products">
                                                <Button className="bg-black text-white hover:bg-gray-800">
                                                        Back to Products
                                                </Button>
                                        </Link>
                                </div>
                        </div>
                );
        }

        return (
                <div className="min-h-screen bg-gray-50">
                        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),rgba(255,255,255,0))]"></div>
                                <div className="absolute -top-20 -right-32 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
                                <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
                                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
                                                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:flex-1">
                                                        <div className="relative h-28 w-28 rounded-3xl overflow-hidden border-4 border-white/40 shadow-xl">
                                                                <Image
                                                                        src={seller.companyLogo || FALLBACK_LOGO}
                                                                        alt={sellerDisplayName}
                                                                        fill
                                                                        className="object-contain bg-white/90 p-4"
                                                                />
                                                        </div>

                                                        <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                        <h1 className="text-3xl font-semibold tracking-tight">
                                                                                {sellerDisplayName}
                                                                        </h1>
                                                                        <Badge className="bg-white/15 border-white/30 text-white flex items-center gap-1 px-3 py-1">
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                                Verified Seller
                                                                        </Badge>
                                                                </div>
                                                                <p className="mt-4 max-w-3xl text-base leading-relaxed text-orange-50/90">
                                                                        {seller.brandDescription ||
                                                                                "Premium safety equipment partner delivering quality products, fast support, and reliable service across India."}
                                                                </p>

                                                                {highlightCategories.length > 0 && (
                                                                        <div className="mt-6 flex flex-wrap gap-2">
                                                                                {highlightCategories.map((category) => (
                                                                                        <Badge
                                                                                                key={category}
                                                                                                className="bg-white/15 border-white/25 text-white rounded-full px-4 py-1"
                                                                                        >
                                                                                                {category}
                                                                                        </Badge>
                                                                                ))}
                                                                        </div>
                                                                )}

                                                                <div className="mt-8 flex flex-wrap gap-3">
                                                                        <Button
                                                                                onClick={handleShareProfile}
                                                                                className="bg-white text-orange-600 hover:bg-orange-50 rounded-full px-6"
                                                                        >
                                                                                <Share2 className="h-4 w-4 mr-2" />
                                                                                Share profile
                                                                        </Button>
                                                                        <Button
                                                                                asChild
                                                                                variant="outline"
                                                                                className="rounded-full border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white px-6"
                                                                        >
                                                                                <a href="#seller-products">Browse products</a>
                                                                        </Button>
                                                                </div>

                                                                <div className="mt-8 grid grid-cols-1 gap-4 text-sm text-orange-50/80 sm:grid-cols-3">
                                                                        <div className="flex items-center gap-2">
                                                                                <Mail className="h-4 w-4 text-white/70" />
                                                                                <span>{seller.companyEmail || "Email shared upon request"}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                                <Phone className="h-4 w-4 text-white/70" />
                                                                                <span>{seller.phone || "Phone shared upon request"}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                                <MapPin className="h-4 w-4 mt-0.5 text-white/70" />
                                                                                <span>
                                                                                        {(headOfficeAddress && headOfficeAddress.fullAddress) ||
                                                                                                "Address details coming soon"}
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>

                                                <div className="lg:w-72">
                                                        <div className="rounded-3xl bg-white/10 backdrop-blur p-6 shadow-lg">
                                                                <div className="flex items-center justify-center gap-2 text-3xl font-semibold text-white">
                                                                        <Star className="h-7 w-7 text-yellow-300 fill-yellow-300" />
                                                                        <span>4.8</span>
                                                                </div>
                                                                <p className="mt-2 text-sm text-orange-50/80 text-center">
                                                                        Seller Rating
                                                                </p>
                                                                <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm text-orange-50/90">
                                                                        <div>
                                                                                <p className="text-lg font-semibold text-white">98%</p>
                                                                                <p>On-time delivery</p>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-lg font-semibold text-white">24h</p>
                                                                                <p>Avg. response</p>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-lg font-semibold text-white">4.8</p>
                                                                                <p>Quality rating</p>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-lg font-semibold text-white">250+</p>
                                                                                <p>Products listed</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-orange-100">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                                        {categories.map((category) => (
                                                                <Button
                                                                        key={category}
                                                                        variant={activeCategory === category ? "default" : "ghost"}
                                                                        className={`rounded-full text-sm transition-colors ${
                                                                                activeCategory === category
                                                                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                                                                        : "text-gray-600 hover:text-orange-600"
                                                                        }`}
                                                                        onClick={() => setActiveCategory(category)}
                                                                >
                                                                        {category}
                                                                </Button>
                                                        ))}
                                                </div>

                                                <div className="relative w-full md:w-80">
                                                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                                type="text"
                                                                placeholder="Search products..."
                                                                className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                                                value={searchQuery}
                                                                onChange={(event) => setSearchQuery(event.target.value)}
                                                        />
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div
                                id="seller-products"
                                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                        >
                                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                                        <div>
                                                <h2 className="text-2xl font-semibold text-gray-900">
                                                        {activeCategory === "All Products"
                                                                ? "All Products"
                                                                : `${activeCategory} Collection`}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                        Discover curated safety gear from {sellerDisplayName}.
                                                </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Store className="h-4 w-4 text-orange-500" />
                                                <span>
                                                        {productsLoading
                                                                ? "Loading products..."
                                                                : `${filteredProducts.length} product${
                                                                          filteredProducts.length === 1 ? "" : "s"
                                                                  }`}
                                                </span>
                                        </div>
                                </div>

                                {productsError && !productsLoading && (
                                        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                                {productsError}
                                        </div>
                                )}

                                {productsLoading ? (
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {Array.from({ length: 8 }).map((_, index) => (
                                                        <div
                                                                key={index}
                                                                className="h-72 rounded-2xl border border-orange-100 bg-white shadow-sm animate-pulse"
                                                        ></div>
                                                ))}
                                        </div>
                                ) : filteredProducts.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/60 py-16 text-center">
                                                <ShieldCheck className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        No products found
                                                </h3>
                                                <p className="text-gray-600">
                                                        {searchQuery
                                                                ? `No products match "${searchQuery}". Try adjusting your search.`
                                                                : `No ${activeCategory !== "All Products" ? `${activeCategory} ` : ""}products are available yet.`}
                                                </p>
                                        </div>
                                ) : (
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {filteredProducts.map((product) => (
                                                        <ProductCard key={product.id} product={product} />
                                                ))}
                                        </div>
                                )}
                        </div>

                        <div className="bg-white border-t border-orange-100/70">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                                About {sellerDisplayName}
                                        </h2>

                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                <Card className="shadow-sm border-orange-100/70">
                                                        <CardContent className="p-6">
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                                        Company information
                                                                </h3>
                                                                <div className="space-y-4 text-sm text-gray-600">
                                                                        {seller.gstinNumber && (
                                                                                <div className="flex justify-between">
                                                                                        <span>GSTIN</span>
                                                                                        <span className="font-medium text-gray-800">
                                                                                                {seller.gstinNumber}
                                                                                        </span>
                                                                                </div>
                                                                        )}
                                                                        <div className="flex justify-between">
                                                                                <span>Business type</span>
                                                                                <span className="font-medium text-gray-800">
                                                                                        Manufacturer & Distributor
                                                                                </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                                <span>Year established</span>
                                                                                <span className="font-medium text-gray-800">2010</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                                <span>Certifications</span>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                                                                                ISO 9001
                                                                                        </Badge>
                                                                                        <Badge className="bg-green-50 text-green-700 border-green-200">
                                                                                                CE Certified
                                                                                        </Badge>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                <Card className="shadow-sm border-orange-100/70">
                                                        <CardContent className="p-6">
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                                        Business highlights
                                                                </h3>
                                                                <div className="grid grid-cols-2 gap-4 text-center">
                                                                        <div className="rounded-xl bg-orange-50 p-4">
                                                                                <p className="text-2xl font-bold text-orange-600">
                                                                                        500+
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">Products Delivered</p>
                                                                        </div>
                                                                        <div className="rounded-xl bg-orange-50 p-4">
                                                                                <p className="text-2xl font-bold text-orange-600">
                                                                                        120+
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">Cities Served</p>
                                                                        </div>
                                                                        <div className="rounded-xl bg-orange-50 p-4">
                                                                                <p className="text-2xl font-bold text-orange-600">
                                                                                        15+
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">Industry Partners</p>
                                                                        </div>
                                                                        <div className="rounded-xl bg-orange-50 p-4">
                                                                                <p className="text-2xl font-bold text-orange-600">
                                                                                        4.8
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">Customer Rating</p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                <Card className="shadow-sm border-orange-100/70">
                                                        <CardContent className="p-6">
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                                        Customer assistance
                                                                </h3>
                                                                <div className="space-y-3 text-sm text-gray-600">
                                                                        {seller.companyEmail && (
                                                                                <div className="flex items-center gap-2">
                                                                                        <Mail className="h-4 w-4 text-orange-500" />
                                                                                        <span>{seller.companyEmail}</span>
                                                                                </div>
                                                                        )}
                                                                        {seller.phone && (
                                                                                <div className="flex items-center gap-2">
                                                                                        <Phone className="h-4 w-4 text-orange-500" />
                                                                                        <span>{seller.phone}</span>
                                                                                </div>
                                                                        )}
                                                                        <div className="flex items-start gap-2 text-gray-500">
                                                                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                                                                <span>
                                                                                        Need help with installation or custom orders? Our team responds within 24 hours for all enquiries.
                                                                                </span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                                <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                                                                                <span>
                                                                                        {(headOfficeAddress && headOfficeAddress.fullAddress) ||
                                                                                                "Detailed address will be shared soon."}
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
