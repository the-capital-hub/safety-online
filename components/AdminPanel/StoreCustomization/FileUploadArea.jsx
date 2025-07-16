"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function FileUploadArea({ field, label, onFileUpload }) {
	return (
		<div>
			<Label>{label}</Label>
			<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-1">
				<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
				<p className="text-sm text-gray-600 mb-2">Drag your images here</p>
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={(e) => onFileUpload(field, e.target.files)}
					className="hidden"
					id={`${field}-upload`}
				/>
				<label htmlFor={`${field}-upload`}>
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer bg-transparent"
					>
						Browse Files
					</Button>
				</label>
			</div>
		</div>
	);
}
