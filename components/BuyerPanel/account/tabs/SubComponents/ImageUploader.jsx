"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ImageUploader({ value, onChange, className }) {
	const [preview, setPreview] = useState(value);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		setPreview(value);
	}, [value]);

	async function handleFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}

		// Validate file size (e.g., 5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			setError("File size must be less than 5MB");
			return;
		}

		setError(null);
		setUploading(true);

		try {
			const form = new FormData();
			form.append("file", file);
			form.append("folder", "safety_user_pic");

			const res = await fetch("/api/upload", {
				method: "POST",
				body: form,
			});

			if (!res.ok) {
				throw new Error(`Upload failed: ${res.statusText}`);
			}

			const data = await res.json();

			if (data?.success && data?.url) {
				setPreview(data.url);
				onChange?.(data.url);
			} else {
				throw new Error(data?.message || "Upload failed");
			}
		} catch (error) {
			console.error("Upload error:", error);
			setError(error.message || "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	const handleButtonClick = () => {
		document.getElementById(`profile-pic-input`).click();
	};

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div className="w-16 h-16 overflow-hidden bg-muted flex items-center justify-center rounded-full">
				{preview ? (
					<Image
						src={preview}
						width={64}
						height={64}
						alt="Preview"
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="text-muted-foreground text-xs text-center p-2">
						No image
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<input
					id={`profile-pic-input`}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleFile}
					disabled={uploading}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleButtonClick}
					disabled={uploading}
				>
					{uploading ? "Uploading..." : "Upload New Profile Picture"}
				</Button>

				{error && <p className="text-red-500 text-xs">{error}</p>}
			</div>
		</div>
	);
}
