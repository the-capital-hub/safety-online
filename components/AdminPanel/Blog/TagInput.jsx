"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const normalizeTag = (value = "") => value.toString().trim();

export function TagInput({
        value = [],
        onChange,
        placeholder = "Add a tag and press Enter",
        label = "Tags",
}) {
        const [inputValue, setInputValue] = useState("");

        const addTag = () => {
                const formatted = normalizeTag(inputValue);

                if (!formatted) return;

                const newTags = Array.from(new Set([...(value || []), formatted]));

                onChange?.(newTags);
                setInputValue("");
        };

        const removeTag = (tagToRemove) => {
                const filtered = (value || []).filter((tag) => tag !== tagToRemove);
                onChange?.(filtered);
        };

        const handleKeyDown = (event) => {
                if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag();
                }
                if (event.key === "Backspace" && !inputValue && value?.length) {
                        removeTag(value[value.length - 1]);
                }
        };

        return (
                <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{label}</label>
                        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3">
                                {value?.map((tag) => (
                                        <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        >
                                                {tag}
                                                <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="rounded-full p-0.5 hover:bg-blue-200"
                                                        aria-label={`Remove tag ${tag}`}
                                                >
                                                        <X className="h-3 w-3" />
                                                </button>
                                        </Badge>
                                ))}

                                <input
                                        value={inputValue}
                                        onChange={(event) => setInputValue(event.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        className="flex-1 min-w-[160px] border-none focus:outline-none focus:ring-0 text-sm text-gray-700"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                        Add
                                </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                                Separate tags with Enter or comma. Tags help readers discover
                                related topics.
                        </p>
                </div>
        );
}
