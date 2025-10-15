"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/public/LogoSeller.png";

export default function UnsubscribePage() {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("loading"); // loading, success, error
	const [message, setMessage] = useState("");

	useEffect(() => {
		const emailParam = searchParams.get("email");
		if (!emailParam) {
			setStatus("error");
			setMessage("Email parameter is missing");
			return;
		}

		setEmail(emailParam);
		handleUnsubscribe(emailParam);
	}, [searchParams]);

	const handleUnsubscribe = async (email) => {
		try {
			const response = await fetch(
				`/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
			);
			const data = await response.json();

			if (response.ok) {
				setStatus("success");
				setMessage(
					data.message ||
						"You have been successfully unsubscribed from our newsletter."
				);
			} else {
				setStatus("error");
				setMessage(data.message || "Failed to unsubscribe. Please try again.");
			}
		} catch (error) {
			setStatus("error");
			setMessage("An error occurred. Please try again later.");
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
			<div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
				<div className="flex justify-center mb-6">
					<Image src={Logo} alt="Safety Online Logo" width={180} height={60} />
				</div>

				<h1 className="text-2xl font-bold text-center mb-6">
					Newsletter Unsubscribe
				</h1>

				{status === "loading" && (
					<div className="text-center py-8">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
						<p className="mt-4 text-gray-600">Processing your request...</p>
					</div>
				)}

				{status === "success" && (
					<div className="text-center py-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
						<h2 className="text-xl font-semibold mb-2">
							Unsubscribed Successfully
						</h2>
						<p className="text-gray-600 mb-6">{message}</p>
						<p className="text-gray-600 mb-6">
							Email: <span className="font-medium">{email}</span>
						</p>
						<p className="text-sm text-gray-500 mb-6">
							If you unsubscribed by mistake, you can always subscribe again
							through our website.
						</p>
					</div>
				)}

				{status === "error" && (
					<div className="text-center py-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</div>
						<h2 className="text-xl font-semibold mb-2">Error</h2>
						<p className="text-gray-600 mb-6">{message}</p>
					</div>
				)}

				<div className="flex justify-center mt-4">
					<Link href="/">
						<Button className="bg-black hover:bg-black/90 text-white">
							Return to Homepage
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
