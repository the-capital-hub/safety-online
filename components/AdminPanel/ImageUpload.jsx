"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

export function ImageUpload({
        images = [], // Array of base64 strings
        onImagesChange,
        label = "Product Images",
        required = true,
        mainImageIndex = -1,
        onMainImageChange,
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState([]);
	const [imageMetadata, setImageMetadata] = useState([]); // Store metadata separately
	const fileInputRef = useRef(null);

	const MAX_IMAGES = 5;
	const MAX_SIZE = 5 * 1024 * 1024; // 5MB
	const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

	const validateFile = (file) => {
		if (!VALID_TYPES.includes(file.type)) {
			return "Please select a valid image file (JPEG, PNG, WebP)";
		}
		if (file.size > MAX_SIZE) {
			return "Image size should be less than 5MB";
		}
		return null;
	};

	const convertToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const handleFileSelect = async (files) => {
		const fileArray = Array.from(files);
		const newErrors = [];

		// Check total count limit
		if (images.length + fileArray.length > MAX_IMAGES) {
			newErrors.push(`Maximum ${MAX_IMAGES} images allowed`);
			setErrors(newErrors);
			return;
		}

		// Validate files
		const validFiles = [];
		fileArray.forEach((file, index) => {
			const error = validateFile(file);
			if (error) {
				newErrors.push(`File ${index + 1}: ${error}`);
			} else {
				validFiles.push(file);
			}
		});

		if (newErrors.length > 0) {
			setErrors(newErrors);
			return;
		}

		// Convert valid files to base64
		try {
			const results = await Promise.all(
				validFiles.map(async (file) => {
					const base64 = await convertToBase64(file);
					return {
						base64,
						metadata: {
							name: file.name,
							size: file.size,
							type: file.type,
						},
					};
				})
			);

			const newBase64Images = results.map((r) => r.base64);
			const newMetadata = results.map((r) => r.metadata);

			const updatedImages = [...images, ...newBase64Images];
			const updatedMetadata = [...imageMetadata, ...newMetadata];

			onImagesChange(updatedImages);
			setImageMetadata(updatedMetadata);
			setErrors([]);
		} catch (error) {
			setErrors(["Error processing images. Please try again."]);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleFileInputChange = (e) => {
		const files = e.target.files;
		if (files.length > 0) {
			handleFileSelect(files);
		}
	};

        const removeImage = (index) => {
                const updatedImages = images.filter((_, i) => i !== index);
                const updatedMetadata = imageMetadata.filter((_, i) => i !== index);
                onImagesChange(updatedImages);
                setImageMetadata(updatedMetadata);
        };

        const handleSetAsMain = (index) => {
                if (typeof onMainImageChange !== "function") {
                        return;
                }

                onMainImageChange(index);
        };

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	// Validation for required field
	const hasValidationError = required && images.length === 0;

	return (
		<div className="space-y-4">
			<div>
				<Label className="text-sm font-medium">
					{label} {required && <span className="text-red-500">*</span>}
				</Label>
				<p className="text-xs text-gray-500 mt-1">
					Upload up to {MAX_IMAGES} images. At least 1 image is required.
					Supported formats: JPEG, PNG, WebP (Max 5MB each)
				</p>
			</div>

			{/* Upload Area */}
			<div
				className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
					isDragging
						? "border-blue-400 bg-blue-50"
						: hasValidationError
						? "border-red-300 hover:border-red-400"
						: "border-gray-300 hover:border-gray-400"
				}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
				<p className="text-sm text-gray-600 mb-2">
					Drag and drop your images here, or{" "}
					<button
						type="button"
						onClick={openFileDialog}
						className="text-blue-600 hover:text-blue-700 underline"
					>
						browse files
					</button>
				</p>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/jpg,image/png,image/webp"
					multiple
					onChange={handleFileInputChange}
					className="hidden"
				/>
			</div>

			{/* Required Field Error */}
			{hasValidationError && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<p className="text-sm text-red-700">At least one image is required</p>
				</div>
			)}

			{/* Other Error Messages */}
			{errors.length > 0 && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<div className="text-sm text-red-700">
						{errors.map((error, index) => (
							<p key={index}>• {error}</p>
						))}
					</div>
				</div>
			)}

			{/* Image Previews */}
                        {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {images.map((base64, index) => (
                                                <div
                                                        key={index}
                                                        className={`relative group rounded-lg ${
                                                                mainImageIndex === index
                                                                        ? "ring-2 ring-blue-500"
                                                                        : ""
                                                        }`}
                                                >
                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                                <img
                                                                        src={base64}
                                                                        alt={`Upload ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                />
                                                        </div>
                                                        {typeof onMainImageChange === "function" && (
                                                                <button
                                                                        type="button"
                                                                        onClick={() => handleSetAsMain(index)}
                                                                        className={`absolute left-2 top-2 rounded-full px-3 py-1 text-xs font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                                                                mainImageIndex === index
                                                                                        ? "bg-blue-600 text-white"
                                                                                        : "bg-white/80 text-gray-700 hover:bg-white"
                                                                        }`}
                                                                        aria-pressed={mainImageIndex === index}
                                                                >
                                                                        {mainImageIndex === index ? "Main Image" : "Set as Main"}
                                                                </button>
                                                        )}
                                                        <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                                <X className="w-4 h-4" />
                                                        </button>
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                                {imageMetadata[index]?.name || `Image ${index + 1}`}
                                                        </p>
                                                </div>
                                        ))}
                                </div>
                        )}

			{/* Image Counter */}
			<div className="text-right">
				<span
					className={`text-xs ${
						hasValidationError ? "text-red-500" : "text-gray-500"
					}`}
				>
					{images.length} / {MAX_IMAGES} images
				</span>
			</div>
		</div>
	);
}
