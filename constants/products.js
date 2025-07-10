import {
	ISP1, // green helmet
	ISP2, // Industrial safety kit combo - Orange helmet + Safety glasses + Gloves + Headset / HeadPhone
	ISP3, // yellow helmet
	ISP4, // reflective jacket
	ISP5, // Fire Extinguisher
	PSP1, // mask
	PSP2, // First Aid Kit
	PSP3, // Orange helmet and Reflective jacket
	PSP4, // Life Jacket
	PSP5, // Quick Heal - First Aid Kit
	PSP6, // Snake Bite Kit
	PSP7, // First Aid Kit - Multi purpose (Green)
	PSP8, // First Aid Kit - Multi purpose (Orange)
	QPP1, // Q-Please Variant 1
	QPP2, // Q-Please Variant 2
	QPP3, // Q-Please Variant 3
	QPP4, // Q-Please Variant 4
	QPP5, // Q-Please Variant 5
	QPP6, // Q-Please Variant 6
	RSP1, // Combo (Road safety) - Road Barricade + Road Safety Sign
	RSP2, // Convex Mirror (Road safety)
	RSP3, // Chains (Road safety, Plastic)
	RSP4, // Plastic Speed Bump for high visibility and concrete road traffic control
	RSP5, // Yellow Two Way, Reflective, ABS Road Studs / Reflectors (Road safety)
	RSP6, // Impact Resistant Road Traffic Safety Cones with Reflective Strips Collar
	SBP1, // Barrier Ahead Cautionary Sign
	SBP2, // STOP SIGNALS Sign
	SBP3, // Airport Sign
	SBP4, // No Entry Sign
	SBP5, // Bullock Carts Prohibited Sign
} from "@/public/images/products";

// ISP - Industrial Safety Products - category - industrial-safety
// PSP - Personal Safety Products - category - personal-safety
// QPP - Q-Please Products - category - queue-management
// RSP - Road Safety Products - category - road-safety
// SBP - Sign Board Products - category - signage

const products = [
	// Industrial Safety Products
	{
		id: "ISP1",
		name: "Green Safety Helmet",
		description: "High-quality green safety helmet for industrial protection.",
		longDescription:
			"This green safety helmet is designed to provide maximum protection for industrial workers. Made from high-density polyethylene (HDPE) material, it offers excellent impact resistance and durability. The helmet features an adjustable suspension system for comfortable fit and proper weight distribution. It meets international safety standards and is ideal for construction sites, manufacturing facilities, and other industrial environments.",
		price: 1200,
		image: ISP1.src,
		category: "industrial-safety",
		inStock: true,
		features: [
			{
				title: "Impact Resistant",
				description:
					"Made from high-density polyethylene for superior impact protection against falling objects.",
			},
			{
				title: "Adjustable Suspension",
				description:
					"6-point suspension system ensures comfortable fit and proper weight distribution.",
			},
			{
				title: "Ventilation System",
				description:
					"Strategic ventilation holes provide airflow while maintaining structural integrity.",
			},
			{
				title: "Safety Certified",
				description:
					"Meets IS 2925 and international safety standards for industrial head protection.",
			},
		],
		gallery: [ISP1.src, ISP3.src, PSP3.src],
		relatedProducts: ["ISP3", "ISP2", "PSP3"],
	},
	{
		id: "ISP2",
		name: "Industrial Safety Kit Combo",
		description:
			"Complete safety kit with orange helmet, safety glasses, gloves, and headset.",
		longDescription:
			"This comprehensive industrial safety kit provides complete protection for workers in hazardous environments. The combo includes an orange safety helmet, protective safety glasses, industrial gloves, and noise-cancelling headset. Each component is carefully selected to work together, providing head, eye, hand, and hearing protection. Perfect for construction sites, factories, and industrial facilities where multiple safety hazards exist.",
		price: 4500,
		image: ISP2.src,
		category: "industrial-safety",
		inStock: true,
		featured: true,
		features: [
			{
				title: "Complete Protection",
				description:
					"All-in-one safety solution covering head, eyes, hands, and hearing protection.",
			},
			{
				title: "High-Quality Components",
				description:
					"Each item meets individual safety standards while working together as a complete system.",
			},
			{
				title: "Comfortable Design",
				description:
					"Ergonomically designed components ensure comfort during extended use.",
			},
			{
				title: "Cost-Effective",
				description:
					"Bundled pricing offers significant savings compared to purchasing items separately.",
			},
		],
		gallery: [ISP2.src, ISP1.src, PSP3.src, PSP1.src],
		relatedProducts: ["ISP1", "ISP3", "PSP1"],
	},
	{
		id: "ISP3",
		name: "Yellow Safety Helmet",
		description:
			"High-visibility yellow safety helmet for construction and industrial use.",
		longDescription:
			"The yellow safety helmet is designed for maximum visibility and protection in industrial environments. Its bright yellow color makes workers easily identifiable, enhancing safety in busy work areas. Constructed from impact-resistant materials with a comfortable interior suspension system, this helmet provides reliable protection while ensuring worker comfort throughout long shifts.",
		price: 1150,
		image: ISP3.src,
		category: "industrial-safety",
		inStock: true,
		features: [
			{
				title: "High Visibility",
				description:
					"Bright yellow color ensures maximum visibility in various lighting conditions.",
			},
			{
				title: "Lightweight Design",
				description:
					"Optimized weight distribution reduces neck strain during extended wear.",
			},
			{
				title: "Moisture Management",
				description:
					"Interior padding wicks away moisture for enhanced comfort.",
			},
			{
				title: "Universal Fit",
				description:
					"Adjustable sizing system accommodates most head sizes comfortably.",
			},
		],
		gallery: [ISP3.src, ISP1.src, PSP3.src],
		relatedProducts: ["ISP1", "PSP3", "ISP2"],
	},
	{
		id: "ISP4",
		name: "Reflective Safety Jacket",
		description:
			"High-visibility reflective jacket for worker safety and identification.",
		longDescription:
			"This reflective safety jacket is essential for workers who need to be visible in low-light conditions or high-traffic areas. Made from lightweight, breathable fabric with strategically placed reflective strips, it provides 360-degree visibility while allowing freedom of movement. The jacket features multiple pockets for tools and personal items, making it practical for various work environments.",
		price: 800,
		image: ISP4.src,
		category: "industrial-safety",
		inStock: true,
		features: [
			{
				title: "360-Degree Visibility",
				description:
					"Reflective strips positioned for maximum visibility from all angles.",
			},
			{
				title: "Breathable Fabric",
				description:
					"Lightweight mesh material allows airflow while maintaining durability.",
			},
			{
				title: "Multiple Pockets",
				description:
					"Convenient pockets for tools, phones, and personal belongings.",
			},
			{
				title: "Easy Care",
				description:
					"Machine washable fabric maintains reflective properties after multiple washes.",
			},
		],
		gallery: [ISP4.src, PSP3.src, ISP2.src],
		relatedProducts: ["PSP3", "ISP2", "ISP1"],
	},
	{
		id: "ISP5",
		name: "Fire Extinguisher",
		description:
			"Professional-grade fire extinguisher for industrial and commercial use.",
		longDescription:
			"This professional-grade fire extinguisher is designed to handle various types of fires in industrial and commercial settings. Filled with dry chemical powder, it's effective against Class A, B, and C fires. The extinguisher features a durable steel cylinder with corrosion-resistant coating, ergonomic handle, and clear pressure gauge. Regular maintenance and inspection ensure reliable performance when needed most.",
		price: 2800,
		image: ISP5.src,
		category: "fire-safety",
		inStock: true,
		features: [
			{
				title: "Multi-Class Protection",
				description:
					"Effective against Class A (ordinary combustibles), B (flammable liquids), and C (electrical) fires.",
			},
			{
				title: "Pressure Gauge",
				description:
					"Easy-to-read gauge shows charge level for quick inspection and maintenance.",
			},
			{
				title: "Durable Construction",
				description:
					"Steel cylinder with corrosion-resistant coating ensures long-term reliability.",
			},
			{
				title: "Easy Operation",
				description:
					"Simple PASS (Pull, Aim, Squeeze, Sweep) operation for effective fire suppression.",
			},
		],
		gallery: [ISP5.src, PSP2.src, PSP7.src],
		relatedProducts: ["PSP2", "PSP7", "PSP8"],
	},

	// Personal Safety Products
	{
		id: "PSP1",
		name: "Protective Face Mask",
		description: "High-filtration face mask for respiratory protection.",
		longDescription:
			"This protective face mask provides superior respiratory protection against dust, particles, and airborne contaminants. Featuring multiple filtration layers and a comfortable fit, it's ideal for industrial environments, construction sites, and areas with poor air quality. The mask includes adjustable ear loops and a flexible nose bridge for a secure, comfortable seal.",
		price: 150,
		image: PSP1.src,
		category: "personal-safety",
		inStock: true,
		features: [
			{
				title: "Multi-Layer Filtration",
				description:
					"Advanced filtration system blocks 95% of particles and airborne contaminants.",
			},
			{
				title: "Comfortable Fit",
				description:
					"Soft, breathable materials ensure comfort during extended wear.",
			},
			{
				title: "Adjustable Design",
				description:
					"Flexible ear loops and nose bridge provide customizable fit for all face shapes.",
			},
			{
				title: "Lightweight Construction",
				description:
					"Minimal weight reduces fatigue while maintaining protection standards.",
			},
		],
		gallery: [PSP1.src, ISP2.src, PSP3.src],
		relatedProducts: ["ISP2", "PSP3", "PSP2"],
	},
	{
		id: "PSP2",
		name: "First Aid Kit",
		description: "Comprehensive first aid kit for emergency medical response.",
		longDescription:
			"This comprehensive first aid kit contains essential medical supplies for emergency situations. Designed for workplace, home, and vehicle use, it includes bandages, antiseptics, pain relievers, and other critical supplies. The kit comes in a durable, organized case that makes it easy to find and use supplies quickly during emergencies.",
		price: 1800,
		image: PSP2.src,
		category: "first-aid",
		inStock: true,
		features: [
			{
				title: "Comprehensive Contents",
				description:
					"Contains 75+ medical supplies for treating various injuries and emergencies.",
			},
			{
				title: "Organized Storage",
				description:
					"Clearly labeled compartments make it easy to locate needed supplies quickly.",
			},
			{
				title: "Durable Case",
				description:
					"Water-resistant case protects contents and withstands rough handling.",
			},
			{
				title: "Instruction Guide",
				description:
					"Includes step-by-step emergency response guide for common injuries.",
			},
		],
		gallery: [PSP2.src, PSP5.src, PSP6.src, PSP7.src],
		relatedProducts: ["PSP5", "PSP6", "PSP7"],
	},
	{
		id: "PSP3",
		name: "Orange Helmet & Reflective Jacket",
		description:
			"High-visibility safety combo with orange helmet and reflective jacket.",
		longDescription:
			"This safety combo combines a bright orange helmet with a high-visibility reflective jacket for maximum worker protection and visibility. The helmet provides impact protection while the jacket ensures 360-degree visibility in low-light conditions. This combination is perfect for construction sites, road work, and industrial facilities where both head protection and visibility are critical.",
		price: 2000,
		image: PSP3.src,
		category: "personal-safety",
		inStock: true,
		featured: true,
		features: [
			{
				title: "Maximum Visibility",
				description:
					"Bright orange helmet and reflective jacket combination ensures workers are seen from all angles.",
			},
			{
				title: "Complete Protection",
				description:
					"Combines head protection with body visibility for comprehensive safety coverage.",
			},
			{
				title: "Comfortable Wear",
				description:
					"Both items designed for extended wear without compromising comfort or mobility.",
			},
			{
				title: "Weather Resistant",
				description:
					"Materials withstand various weather conditions while maintaining safety properties.",
			},
		],
		gallery: [PSP3.src, ISP1.src, ISP3.src, ISP4.src],
		relatedProducts: ["ISP1", "ISP3", "ISP4"],
	},
	{
		id: "PSP4",
		name: "Life Jacket",
		description: "Coast Guard approved life jacket for water safety.",
		longDescription:
			"This Coast Guard approved life jacket provides reliable flotation and safety for water activities. Constructed with high-quality foam and durable fabric, it offers excellent buoyancy while maintaining comfort and freedom of movement. Features include adjustable straps, reflective trim, and multiple attachment points for safety accessories.",
		price: 2500,
		image: PSP4.src,
		category: "water-safety",
		inStock: true,
		features: [
			{
				title: "Coast Guard Approved",
				description:
					"Meets all Coast Guard safety requirements for personal flotation devices.",
			},
			{
				title: "Superior Buoyancy",
				description:
					"High-quality foam provides reliable flotation even in rough water conditions.",
			},
			{
				title: "Comfortable Fit",
				description:
					"Adjustable straps and ergonomic design ensure secure, comfortable wear.",
			},
			{
				title: "High Visibility",
				description:
					"Bright colors and reflective trim make wearer easily visible in water.",
			},
		],
		gallery: [PSP4.src, PSP2.src, PSP5.src],
		relatedProducts: ["PSP2", "PSP5", "PSP6"],
	},
	{
		id: "PSP5",
		name: "Quick Heal First Aid Kit",
		description: "Compact first aid kit for immediate injury treatment.",
		longDescription:
			"Quick Heal is a streamlined first aid kit designed for rapid response to minor injuries. This compact kit contains essential medical supplies in an easy-to-carry case, making it perfect for vehicles, small offices, and personal use. Despite its compact size, it includes all necessary items for treating cuts, burns, sprains, and other common injuries.",
		price: 900,
		image: PSP5.src,
		category: "first-aid",
		inStock: true,
		features: [
			{
				title: "Rapid Response",
				description:
					"Specially selected supplies for quick and effective treatment of minor injuries.",
			},
			{
				title: "Compact Design",
				description:
					"Small, lightweight case fits easily in glove compartments, desks, or backpacks.",
			},
			{
				title: "Essential Supplies",
				description:
					"Contains bandages, antiseptics, pain relievers, and other critical first aid items.",
			},
			{
				title: "Clear Instructions",
				description:
					"Simple, illustrated guide shows proper use of all included supplies.",
			},
		],
		gallery: [PSP5.src, PSP2.src, PSP6.src, PSP7.src],
		relatedProducts: ["PSP2", "PSP6", "PSP7"],
	},
	{
		id: "PSP6",
		name: "Snake Bite Kit",
		description: "Specialized emergency kit for snake bite treatment.",
		longDescription:
			"This specialized snake bite kit is designed for emergency treatment of venomous snake bites. Essential for outdoor workers, hikers, and rural areas where snake encounters are possible. The kit includes suction devices, antiseptics, pressure bandages, and detailed instructions for proper emergency response while awaiting professional medical care.",
		price: 1200,
		image: PSP6.src,
		category: "emergency-kit",
		inStock: true,
		features: [
			{
				title: "Specialized Treatment",
				description:
					"Contains tools and supplies specifically designed for snake bite emergency response.",
			},
			{
				title: "Suction Device",
				description:
					"Professional-grade suction pump helps remove venom from bite wounds.",
			},
			{
				title: "Pressure Bandages",
				description:
					"Elastic bandages for proper pressure application to slow venom spread.",
			},
			{
				title: "Emergency Instructions",
				description:
					"Clear, step-by-step guide for proper snake bite first aid procedures.",
			},
		],
		gallery: [PSP6.src, PSP2.src, PSP5.src, PSP7.src],
		relatedProducts: ["PSP2", "PSP5", "PSP7"],
	},
	{
		id: "PSP7",
		name: "Multi-Purpose First Aid Kit (Green)",
		description:
			"Versatile green first aid kit for multiple emergency scenarios.",
		longDescription:
			"This multi-purpose first aid kit in a distinctive green case is designed to handle a wide variety of emergency situations. It contains an extensive selection of medical supplies suitable for both minor and more serious injuries. The green color coding helps identify it quickly in emergency situations, and the organized interior makes finding specific supplies fast and efficient.",
		price: 2200,
		image: PSP7.src,
		category: "first-aid",
		inStock: true,
		features: [
			{
				title: "Versatile Contents",
				description:
					"Wide range of medical supplies suitable for various types of injuries and emergencies.",
			},
			{
				title: "Color-Coded Design",
				description:
					"Distinctive green case makes it easy to identify and locate during emergencies.",
			},
			{
				title: "Professional Grade",
				description:
					"Hospital-quality supplies suitable for professional and personal use.",
			},
			{
				title: "Expandable Storage",
				description:
					"Case designed to accommodate additional supplies as needed.",
			},
		],
		gallery: [PSP7.src, PSP2.src, PSP5.src, PSP8.src],
		relatedProducts: ["PSP2", "PSP8", "PSP5"],
	},
	{
		id: "PSP8",
		name: "Multi-Purpose First Aid Kit (Orange)",
		description: "High-visibility orange first aid kit for emergency response.",
		longDescription:
			"This multi-purpose first aid kit features a bright orange case for maximum visibility during emergencies. It contains comprehensive medical supplies for treating a wide range of injuries and medical situations. The high-visibility orange color makes it easy to spot in emergency situations, while the organized interior ensures quick access to needed supplies.",
		price: 2200,
		image: PSP8.src,
		category: "first-aid",
		inStock: true,
		features: [
			{
				title: "High Visibility",
				description:
					"Bright orange case ensures the kit is easily visible during emergency situations.",
			},
			{
				title: "Comprehensive Supplies",
				description:
					"Contains extensive medical supplies for treating various injuries and conditions.",
			},
			{
				title: "Emergency Response",
				description:
					"Designed for professional emergency responders and workplace safety teams.",
			},
			{
				title: "Durable Construction",
				description:
					"Rugged case protects contents and withstands demanding emergency use.",
			},
		],
		gallery: [PSP8.src, PSP7.src, PSP2.src, PSP5.src],
		relatedProducts: ["PSP7", "PSP2", "PSP5"],
	},

	// Q-Please Products
	{
		id: "QPP1",
		name: "Q-Please Variant 1",
		description:
			"Premium queue management solution for organized customer flow.",
		longDescription:
			"Q-Please Variant 1 is an advanced queue management system designed to streamline customer flow and reduce waiting times. This system helps businesses organize customer queues efficiently, providing a professional appearance while improving customer satisfaction. Perfect for banks, hospitals, retail stores, and service centers.",
		price: 15000,
		image: QPP1.src,
		category: "queue-management",
		inStock: true,
		features: [
			{
				title: "Digital Display",
				description:
					"Clear LED display shows current serving numbers and queue status.",
			},
			{
				title: "Easy Operation",
				description:
					"Simple button interface for customers to take queue numbers.",
			},
			{
				title: "Professional Design",
				description:
					"Sleek, modern appearance complements any business environment.",
			},
			{
				title: "Customizable Settings",
				description:
					"Adjustable parameters for different business needs and queue types.",
			},
		],
		gallery: [QPP1.src, QPP2.src, QPP3.src],
		relatedProducts: ["QPP2", "QPP3", "QPP4"],
	},
	{
		id: "QPP2",
		name: "Q-Please Variant 2",
		description: "Advanced queue management system with enhanced features.",
		longDescription:
			"Q-Please Variant 2 offers enhanced queue management capabilities with additional features for complex business environments. This system includes advanced display options, multiple queue support, and improved customer interaction features. Ideal for large retail stores, government offices, and multi-service facilities.",
		price: 18000,
		image: QPP2.src,
		category: "queue-management",
		inStock: true,
		features: [
			{
				title: "Multiple Queue Support",
				description:
					"Manages multiple service queues simultaneously for complex operations.",
			},
			{
				title: "Enhanced Display",
				description:
					"Larger, more detailed display with service information and estimated wait times.",
			},
			{
				title: "Voice Announcements",
				description: "Audio announcements for queue numbers and service calls.",
			},
			{
				title: "Data Analytics",
				description:
					"Built-in reporting features track queue performance and customer patterns.",
			},
		],
		gallery: [QPP2.src, QPP1.src, QPP4.src, QPP5.src],
		relatedProducts: ["QPP1", "QPP3", "QPP4"],
	},
	{
		id: "QPP3",
		name: "Q-Please Variant 3",
		description: "Compact queue management solution for small businesses.",
		longDescription:
			"Q-Please Variant 3 is designed for small to medium businesses requiring efficient queue management without complex features. This compact system provides essential queue management functions in a space-saving design. Perfect for small retail stores, clinics, and service counters with moderate customer traffic.",
		price: 12000,
		image: QPP3.src,
		category: "queue-management",
		inStock: true,
		features: [
			{
				title: "Compact Design",
				description:
					"Space-saving form factor suitable for small business environments.",
			},
			{
				title: "Simple Operation",
				description:
					"Easy-to-use system requires minimal training for staff and customers.",
			},
			{
				title: "Cost Effective",
				description:
					"Affordable solution providing essential queue management features.",
			},
			{
				title: "Reliable Performance",
				description:
					"Proven technology ensures consistent operation during business hours.",
			},
		],
		gallery: [QPP3.src, QPP1.src, QPP2.src, QPP6.src],
		relatedProducts: ["QPP1", "QPP2", "QPP6"],
	},
	{
		id: "QPP4",
		name: "Q-Please Variant 4",
		description: "Professional queue management with wireless connectivity.",
		longDescription:
			"Q-Please Variant 4 features wireless connectivity and remote management capabilities. This advanced system allows managers to monitor and control queue operations from mobile devices or computers. Includes cloud-based reporting and real-time monitoring features for professional service environments.",
		price: 22000,
		image: QPP4.src,
		category: "queue-management",
		inStock: true,
		features: [
			{
				title: "Wireless Connectivity",
				description:
					"Wi-Fi enabled system allows remote monitoring and management capabilities.",
			},
			{
				title: "Mobile App Control",
				description:
					"Dedicated mobile app for managers to control system remotely.",
			},
			{
				title: "Cloud Reporting",
				description:
					"Real-time data synchronization with cloud-based analytics and reporting.",
			},
			{
				title: "Smart Notifications",
				description:
					"Automated alerts for system status, queue lengths, and performance metrics.",
			},
		],
		gallery: [QPP4.src, QPP2.src, QPP5.src, QPP6.src],
		relatedProducts: ["QPP2", "QPP5", "QPP6"],
	},
	{
		id: "QPP5",
		name: "Q-Please Variant 5",
		description: "Enterprise-grade queue management for large facilities.",
		longDescription:
			"Q-Please Variant 5 is an enterprise-grade queue management system designed for large facilities with high customer volumes. Features include advanced scheduling, priority queue management, and integration capabilities with existing business systems. Perfect for hospitals, large retail chains, and government facilities.",
		price: 28000,
		image: QPP5.src,
		category: "queue-management",
		inStock: true,
		featured: true,
		features: [
			{
				title: "Enterprise Scale",
				description:
					"Handles high-volume customer traffic with multiple service points and queues.",
			},
			{
				title: "Priority Management",
				description:
					"Advanced algorithms for VIP customers, appointments, and emergency situations.",
			},
			{
				title: "System Integration",
				description:
					"APIs and connectors for integration with existing business management systems.",
			},
			{
				title: "Advanced Analytics",
				description:
					"Comprehensive reporting and predictive analytics for operational optimization.",
			},
		],
		gallery: [QPP5.src, QPP4.src, QPP6.src, QPP2.src],
		relatedProducts: ["QPP4", "QPP6", "QPP2"],
	},
	{
		id: "QPP6",
		name: "Q-Please Variant 6",
		description: "Touchscreen queue management with customer feedback system.",
		longDescription:
			"Q-Please Variant 6 features an interactive touchscreen interface with built-in customer feedback system. This advanced model allows customers to rate their service experience and provide feedback directly through the system. Includes multilingual support and accessibility features for diverse customer bases.",
		price: 25000,
		image: QPP6.src,
		category: "queue-management",
		inStock: true,
		features: [
			{
				title: "Touchscreen Interface",
				description:
					"Interactive touchscreen for easy customer interaction and queue selection.",
			},
			{
				title: "Customer Feedback",
				description:
					"Built-in feedback system collects customer satisfaction ratings and comments.",
			},
			{
				title: "Multilingual Support",
				description:
					"Multiple language options for diverse customer populations.",
			},
			{
				title: "Accessibility Features",
				description:
					"ADA compliant design with features for customers with disabilities.",
			},
		],
		gallery: [QPP6.src, QPP5.src, QPP4.src, QPP3.src],
		relatedProducts: ["QPP5", "QPP4", "QPP3"],
	},

	// Road Safety Products
	{
		id: "RSP1",
		name: "Road Safety Combo - Barricade & Sign",
		description: "Complete road safety combo with barricade and warning signs.",
		longDescription:
			"This comprehensive road safety combo includes both road barricades and warning signs for complete traffic control and safety. The combination provides visual barriers and clear messaging to guide traffic safely around work zones, construction areas, and temporary hazards. Made from durable materials with high-visibility colors and reflective elements.",
		price: 3500,
		image: RSP1.src,
		category: "road-safety",
		inStock: true,
		features: [
			{
				title: "Complete Solution",
				description:
					"Includes both physical barriers and warning signage for comprehensive traffic control.",
			},
			{
				title: "High Visibility",
				description:
					"Bright colors and reflective materials ensure visibility in all lighting conditions.",
			},
			{
				title: "Durable Construction",
				description:
					"Weather-resistant materials withstand outdoor conditions and repeated use.",
			},
			{
				title: "Easy Setup",
				description:
					"Quick deployment and removal for temporary road work and construction zones.",
			},
		],
		gallery: [RSP1.src, RSP6.src, SBP1.src, RSP2.src],
		relatedProducts: ["RSP6", "SBP1", "RSP2"],
	},
	{
		id: "RSP2",
		name: "Convex Traffic Mirror",
		description: "Convex mirror for improved road visibility and safety.",
		longDescription:
			"This convex traffic mirror enhances road safety by providing expanded visibility around blind corners, intersections, and parking areas. The durable acrylic mirror surface resists weather and impact while providing clear, distortion-free viewing. Includes mounting hardware for poles, walls, or overhead installation.",
		price: 2800,
		image: RSP2.src,
		category: "road-safety",
		inStock: true,
		features: [
			{
				title: "Wide Viewing Angle",
				description:
					"Convex design provides expanded field of view for better visibility around corners.",
			},
			{
				title: "Weather Resistant",
				description:
					"Durable acrylic material withstands UV rays, rain, and temperature extremes.",
			},
			{
				title: "Shatter Resistant",
				description:
					"Impact-resistant construction prevents dangerous breakage from accidents or vandalism.",
			},
			{
				title: "Versatile Mounting",
				description:
					"Includes hardware for various mounting options including poles, walls, and overhangs.",
			},
		],
		gallery: [RSP2.src, RSP1.src, RSP3.src, RSP5.src],
		relatedProducts: ["RSP1", "RSP3", "RSP5"],
	},
	{
		id: "RSP3",
		name: "Plastic Safety Chains",
		description: "Durable plastic chains for traffic control and area marking.",
		longDescription:
			"These heavy-duty plastic safety chains are designed for traffic control and area marking applications. Made from UV-resistant plastic, they maintain their bright colors and strength in outdoor conditions. The interlocking design allows for easy connection and length adjustment, making them perfect for temporary barriers, crowd control, and hazard marking.",
		price: 800,
		image: RSP3.src,
		category: "road-safety",
		inStock: true,
		features: [
			{
				title: "UV Resistant",
				description:
					"Special plastic formulation resists fading and degradation from sunlight exposure.",
			},
			{
				title: "Interlocking Design",
				description:
					"Easy-connect links allow for custom lengths and quick deployment.",
			},
			{
				title: "High Visibility",
				description:
					"Bright colors ensure chains are easily seen by drivers and pedestrians.",
			},
			{
				title: "Lightweight & Portable",
				description:
					"Easy to transport, install, and remove as needed for temporary applications.",
			},
		],
		gallery: [RSP3.src, RSP1.src, RSP4.src, RSP5.src],
		relatedProducts: ["RSP1", "RSP4", "RSP5"],
	},
	{
		id: "RSP4",
		name: "Plastic Speed Bump",
		description:
			"High-visibility plastic speed bump for traffic speed control.",
		longDescription:
			"This plastic speed bump is designed to effectively control vehicle speeds in parking lots, residential areas, and low-speed zones. Made from durable, recycled plastic with high-visibility yellow coloring and reflective strips. The modular design allows for custom width installation, and the lightweight construction makes installation and removal simple.",
		price: 1500,
		image: RSP4.src,
		category: "road-safety",
		inStock: true,
		features: [
			{
				title: "Effective Speed Control",
				description:
					"Optimal height and angle design effectively reduces vehicle speeds without damage.",
			},
			{
				title: "Modular System",
				description:
					"Interlocking sections allow for custom width installations to fit any roadway.",
			},
			{
				title: "Reflective Strips",
				description:
					"High-visibility reflective tape ensures visibility during nighttime and low-light conditions.",
			},
			{
				title: "Easy Installation",
				description:
					"Lightweight design with pre-drilled holes makes installation quick and simple.",
			},
		],
		gallery: [RSP4.src, RSP3.src, RSP5.src, RSP6.src],
		relatedProducts: ["RSP3", "RSP5", "RSP6"],
	},
	{
		id: "RSP5",
		name: "Reflective Road Studs",
		description: "Yellow two-way reflective ABS road studs for lane marking.",
		longDescription:
			"These yellow reflective road studs are designed for permanent lane marking and road delineation. Made from durable ABS plastic with embedded retroreflective elements, they provide excellent visibility from both directions. The studs are designed to withstand heavy traffic loads while maintaining their reflective properties over time.",
		price: 200,
		image: RSP5.src,
		category: "road-safety",
		inStock: true,
		features: [
			{
				title: "Two-Way Reflectivity",
				description:
					"Retroreflective elements provide visibility from both traffic directions.",
			},
			{
				title: "Heavy-Duty Construction",
				description:
					"ABS plastic construction withstands vehicle loads and weather conditions.",
			},
			{
				title: "Easy Installation",
				description:
					"Adhesive backing and simple installation process requires minimal equipment.",
			},
			{
				title: "Long-Lasting Performance",
				description:
					"Designed for years of reliable service with minimal maintenance required.",
			},
		],
		gallery: [RSP5.src, RSP4.src, RSP2.src, RSP3.src],
		relatedProducts: ["RSP4", "RSP2", "RSP3"],
	},
	{
		id: "RSP6",
		name: "Traffic Safety Cones with Reflective Strips",
		description:
			"Impact-resistant traffic cones with high-visibility reflective collars.",
		longDescription:
			"These professional-grade traffic cones feature impact-resistant construction with high-visibility reflective strip collars. Designed for heavy-duty use in construction zones, emergency situations, and traffic control applications. The weighted base provides stability in windy conditions, while the bright orange color and reflective strips ensure maximum visibility.",
		price: 450,
		image: RSP6.src,
		category: "road-safety",
		inStock: true,
		featured: true,
		features: [
			{
				title: "Impact Resistant",
				description:
					"Flexible PVC construction bounces back from vehicle contact without breaking.",
			},
			{
				title: "Reflective Collars",
				description:
					"High-intensity reflective strips provide 360-degree visibility in all conditions.",
			},
			{
				title: "Weighted Base",
				description:
					"Heavy base design prevents tipping in windy conditions or light vehicle contact.",
			},
			{
				title: "Stackable Design",
				description:
					"Nested stacking saves storage space and makes transportation efficient.",
			},
		],
		gallery: [RSP6.src, RSP1.src, RSP4.src, RSP5.src],
		relatedProducts: ["RSP1", "RSP4", "RSP5"],
	},

	// Sign Board Products
	{
		id: "SBP1",
		name: "Barrier Ahead Cautionary Sign",
		description:
			"Warning sign to alert drivers of upcoming barriers or obstacles.",
		longDescription:
			"This barrier ahead cautionary sign is essential for alerting drivers to upcoming obstacles, construction zones, or road barriers. Made from durable aluminum with weather-resistant graphics, it provides clear, long-distance visibility of potential hazards. The sign meets traffic control standards and includes mounting hardware for quick installation.",
		price: 800,
		image: SBP1.src,
		category: "signage",
		inStock: true,
		featured: true,
		features: [
			{
				title: "High Visibility Graphics",
				description:
					"Bold, contrasting colors and symbols ensure clear visibility from long distances.",
			},
			{
				title: "Weather Resistant",
				description:
					"Durable aluminum construction with fade-resistant graphics withstands outdoor conditions.",
			},
			{
				title: "Standard Compliance",
				description:
					"Meets traffic control device standards for proper road safety applications.",
			},
			{
				title: "Easy Installation",
				description:
					"Pre-drilled mounting holes and included hardware enable quick setup and removal.",
			},
		],
		gallery: [SBP1.src, SBP2.src, RSP1.src, SBP4.src],
		relatedProducts: ["SBP2", "RSP1", "SBP4"],
	},
	{
		id: "SBP2",
		name: "STOP SIGNALS Sign",
		description: "Official stop signal sign for traffic control and safety.",
		longDescription:
			"This official STOP SIGNALS sign is designed for traffic control at intersections, construction zones, and temporary traffic control situations. Made from reflective aluminum with bold, easy-to-read lettering, it provides clear direction to drivers and helps maintain safe traffic flow. Suitable for both permanent and temporary installations.",
		price: 750,
		image: SBP2.src,
		category: "signage",
		inStock: true,
		features: [
			{
				title: "Reflective Surface",
				description:
					"High-intensity reflective material ensures visibility in all lighting conditions.",
			},
			{
				title: "Bold Lettering",
				description:
					"Large, clear text is easily readable from appropriate stopping distances.",
			},
			{
				title: "Aluminum Construction",
				description:
					"Lightweight yet durable aluminum won't rust or corrode in outdoor conditions.",
			},
			{
				title: "Versatile Mounting",
				description:
					"Compatible with standard sign posts and temporary mounting systems.",
			},
		],
		gallery: [SBP2.src, SBP1.src, SBP3.src, SBP5.src],
		relatedProducts: ["SBP1", "SBP3", "SBP5"],
	},
	{
		id: "SBP3",
		name: "Airport Sign",
		description:
			"Directional airport sign for navigation and facility identification.",
		longDescription:
			"This professional airport sign provides clear directional information and facility identification for airport environments. Made from durable materials with high-contrast graphics, it helps passengers and vehicles navigate airport grounds safely. The sign meets aviation authority standards for airport signage and wayfinding systems.",
		price: 1200,
		image: SBP3.src,
		category: "signage",
		inStock: true,
		features: [
			{
				title: "Aviation Standard",
				description:
					"Meets airport authority requirements for ground signage and wayfinding systems.",
			},
			{
				title: "High Contrast Design",
				description:
					"Bold colors and clear typography ensure readability from vehicles and on foot.",
			},
			{
				title: "Durable Materials",
				description:
					"Weather-resistant construction withstands airport environmental conditions.",
			},
			{
				title: "Professional Appearance",
				description:
					"Clean, professional design complements airport architecture and branding.",
			},
		],
		gallery: [SBP3.src, SBP2.src, SBP4.src, SBP1.src],
		relatedProducts: ["SBP2", "SBP4", "SBP1"],
	},
	{
		id: "SBP4",
		name: "No Entry Sign",
		description: "Prohibition sign to restrict access to unauthorized areas.",
		longDescription:
			"This No Entry sign clearly prohibits access to restricted areas, ensuring security and safety compliance. Made from durable aluminum with bold, internationally recognized symbols and text. Perfect for private property, construction sites, secure facilities, and areas where access must be controlled for safety or security reasons.",
		price: 600,
		image: SBP4.src,
		category: "signage",
		inStock: true,
		features: [
			{
				title: "Universal Symbol",
				description:
					"Internationally recognized no entry symbol transcends language barriers.",
			},
			{
				title: "Bold Graphics",
				description:
					"High-contrast red and white design ensures immediate recognition and compliance.",
			},
			{
				title: "Theft Resistant",
				description:
					"Lightweight aluminum construction with tamper-resistant mounting options.",
			},
			{
				title: "Multiple Sizes",
				description:
					"Available in various sizes to suit different applications and visibility requirements.",
			},
		],
		gallery: [SBP4.src, SBP3.src, SBP5.src, SBP1.src],
		relatedProducts: ["SBP3", "SBP5", "SBP1"],
	},
	{
		id: "SBP5",
		name: "Bullock Carts Prohibited Sign",
		description:
			"Traffic restriction sign prohibiting bullock carts on roadways.",
		longDescription:
			"This specialized traffic sign prohibits bullock carts from using specific roadways or areas. Common in rural and semi-urban areas where traditional animal-drawn vehicles must be restricted from certain roads for safety reasons. Made from reflective aluminum with clear pictographic symbols that are easily understood regardless of literacy level.",
		price: 700,
		image: SBP5.src,
		category: "signage",
		inStock: true,
		features: [
			{
				title: "Clear Pictographs",
				description:
					"Easy-to-understand symbols communicate restrictions without requiring text literacy.",
			},
			{
				title: "Reflective Material",
				description:
					"High-visibility reflective surface ensures sign is visible during dawn and dusk hours.",
			},
			{
				title: "Rural Application",
				description:
					"Specifically designed for rural and semi-urban traffic management needs.",
			},
			{
				title: "Weather Resistant",
				description:
					"Durable construction withstands monsoon conditions and extreme temperatures.",
			},
		],
		gallery: [SBP5.src, SBP4.src, SBP2.src, SBP3.src],
		relatedProducts: ["SBP4", "SBP2", "SBP3"],
	},
];

const categories = [
	// { id: "all", label: "All Products", count: products.length },
	{ id: "personal-safety", label: "Personal Safety", count: 120 },
	{ id: "road-safety", label: "Road Safety", count: 120 },
	{ id: "signage", label: "Retro Reflective Sign", count: 120 },
	{ id: "industrial-safety", label: "Industrial Safety/PPE", count: 120 },
	{ id: "queue-management", label: "Q-Please", count: 120 },
	{ id: "fire-safety", label: "Fire Safety", count: 120 },
	{ id: "first-aid", label: "First Aid", count: 120 },
	{ id: "water-safety", label: "Water Safety", count: 120 },
	{ id: "emergency-kit", label: "Emergency Kit", count: 120 },
];

export { categories };
export default products;
