"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Search,
  Store,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/BuyerPanel/products/ProductCard";

const categories = [
  "All Products",
  "Road Safety",
  "Industrial Safety",
  "Fire Safety",
  "Queue Management",
  "Road Signs",
  "Personal Protection"
];

export default function SellerPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await fetch(`/api/seller/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setSeller(data.seller);
        }
      } catch (error) {
        console.error("Error fetching seller details:", error);
      }
    };

    const fetchSellerProducts = async () => {
      try {
        const response = await fetch(`/api/seller/${id}/products?category=${activeCategory !== "All Products" ? activeCategory : ""}`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching seller products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
    fetchSellerProducts();
  }, [id, activeCategory]);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHeadOfficeAddress = () => {
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

  const toSentenceCase = (str) => {
    if (!str) return "";

    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const headOfficeAddress = seller ? getHeadOfficeAddress() : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seller Not Found</h1>
          <p className="text-gray-600 mb-8">The requested seller could not be found.</p>
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
      {/* Seller Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
              <Image
                src={seller.companyLogo || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"}
                alt={seller.companyName}
                fill
                className="object-contain p-2"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{seller.companyName}</h1>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified Seller
                </Badge>
              </div>
              
              <p className="mt-2 text-gray-600 max-w-3xl">{seller.brandDescription || "Authorized safety equipment partner offering reliable quality and dedicated service."}</p>
              
              <div className="mt-4 flex flex-wrap gap-6">
                {seller.companyEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{seller.companyEmail}</span>
                  </div>
                )}
                
                {seller.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{seller.phone}</span>
                  </div>
                )}
                
                {headOfficeAddress && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{headOfficeAddress.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold ml-1">4.8</span>
              </div>
              <span className="text-xs text-gray-500">Seller Rating</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "ghost"}
                  className={`rounded-full text-sm ${
                    activeCategory === category 
                      ? "bg-orange-500 text-white hover:bg-orange-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeCategory === "All Products" 
              ? "All Products" 
              : `${activeCategory} Products`}
          </h2>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">{filteredProducts.length} products</span>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No products match "${searchQuery}". Try a different search term.` 
                : `No ${activeCategory !== "All Products" ? activeCategory : ""} products available from this seller.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      {/* Seller Information */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">About {seller.companyName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {seller.gstinNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">GSTIN</span>
                        <span className="font-medium">{seller.gstinNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Type</span>
                      <span className="font-medium">Manufacturer & Distributor</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Established</span>
                      <span className="font-medium">2010</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certifications</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          ISO 9001
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          CE Certified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Highlights</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">98%</div>
                      <div className="text-sm text-gray-600 text-center">On-time Delivery</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">4.8</div>
                      <div className="text-sm text-gray-600 text-center">Quality Rating</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">24h</div>
                      <div className="text-sm text-gray-600 text-center">Response Time</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">500+</div>
                      <div className="text-sm text-gray-600 text-center">Products</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}