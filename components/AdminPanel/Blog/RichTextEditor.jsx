"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
        Bold,
        Italic,
        Underline,
        Heading2,
        Heading3,
        List,
        ListOrdered,
        Link2,
        Image as ImageIcon,
        Quote,
        Code2,
        AlignLeft,
        AlignCenter,
        AlignRight,
        Undo2,
        Redo2,
        Eraser,
        Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const HISTORY_BUTTONS = [
        { icon: Undo2, label: "Undo", command: () => document.execCommand("undo") },
        { icon: Redo2, label: "Redo", command: () => document.execCommand("redo") },
        { icon: Eraser, label: "Clear format", command: () => document.execCommand("removeFormat") },
];

const TOOLBAR_BUTTONS = ({ handleImageButtonClick, isUploadingImage }) => [
        { icon: Bold, label: "Bold", command: () => document.execCommand("bold") },
        { icon: Italic, label: "Italic", command: () => document.execCommand("italic") },
        { icon: Underline, label: "Underline", command: () => document.execCommand("underline") },
        {
                icon: Heading2,
                label: "Heading 2",
                command: () => document.execCommand("formatBlock", false, "h2"),
        },
        {
                icon: Heading3,
                label: "Heading 3",
                command: () => document.execCommand("formatBlock", false, "h3"),
        },
        { icon: List, label: "Bulleted list", command: () => document.execCommand("insertUnorderedList") },
        { icon: ListOrdered, label: "Numbered list", command: () => document.execCommand("insertOrderedList") },
        {
                icon: Quote,
                label: "Blockquote",
                command: () => document.execCommand("formatBlock", false, "blockquote"),
        },
        {
                icon: AlignLeft,
                label: "Align left",
                command: () => document.execCommand("justifyLeft"),
        },
        {
                icon: AlignCenter,
                label: "Align center",
                command: () => document.execCommand("justifyCenter"),
        },
        {
                icon: AlignRight,
                label: "Align right",
                command: () => document.execCommand("justifyRight"),
        },
        {
                icon: Link2,
                label: "Insert link",
                command: () => {
                        const url = window.prompt("Paste the URL to link", "https://");
                        if (url) {
                                document.execCommand("createLink", false, url);
                        }
                },
        },
        {
                icon: isUploadingImage ? Loader2 : ImageIcon,
                label: isUploadingImage ? "Uploading image" : "Insert image",
                command: handleImageButtonClick,
                shouldUpdate: false,
                disabled: isUploadingImage,
        },
        {
                icon: Code2,
                label: "Code block",
                command: () => document.execCommand("formatBlock", false, "pre"),
        },
];

export function RichTextEditor({ value, onChange, label = "Content" }) {
        const editorRef = useRef(null);
        const fileInputRef = useRef(null);
        const [isUploadingImage, setIsUploadingImage] = useState(false);

        useEffect(() => {
                if (editorRef.current && editorRef.current.innerHTML !== value) {
                        editorRef.current.innerHTML = value || "";
                }
        }, [value]);

        const handleInput = () => {
                if (editorRef.current) {
                        onChange?.(editorRef.current.innerHTML);
                }
        };

        const insertImageAtCursor = (url) => {
                if (!url) return;
                editorRef.current?.focus();
                document.execCommand("insertImage", false, url);
                handleInput();
        };

        const uploadImage = async (file) => {
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "blog_content");

                setIsUploadingImage(true);

                try {
                        const response = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                        });
                        const data = await response.json();

                        if (!data.success || !data.url) {
                                throw new Error(data.message || "Upload failed");
                        }

                        insertImageAtCursor(data.url);
                        toast.success("Image added to the post");
                } catch (error) {
                        console.error("RichTextEditor image upload error", error);
                        toast.error(error?.message || "Failed to upload image");
                } finally {
                        setIsUploadingImage(false);
                }
        };

        const handleImageSelection = (event) => {
                const file = event.target.files?.[0];
                if (file) {
                        uploadImage(file);
                }
                event.target.value = "";
        };

        const handleImageButtonClick = (event) => {
                event.preventDefault();
                if (isUploadingImage) return;
                fileInputRef.current?.click();
        };

        const handleButtonClick = (event, button) => {
                event.preventDefault();
                if (button?.disabled) return;

                if (button?.shouldUpdate !== false) {
                        editorRef.current?.focus();
                }

                const command = button?.command;
                if (typeof command === "function") {
                        command(event);
                }

                if (button?.shouldUpdate !== false) {
                        handleInput();
                }
        };

        const toolbarButtons = TOOLBAR_BUTTONS({ handleImageButtonClick, isUploadingImage });

        return (
                <div className="space-y-3">
                        <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                <span className="text-xs text-gray-400">
                                        Format your article with headings, lists, and media embeds
                                </span>
                        </div>

                        <div className="rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                                        {HISTORY_BUTTONS.map(({ icon: Icon, label: title, command }) => (
                                                <Button
                                                        key={title}
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                                                        onMouseDown={(event) => handleButtonClick(event, { command })}
                                                        aria-label={title}
                                                >
                                                        <Icon className="h-4 w-4" />
                                                </Button>
                                        ))}
                                        <div className="mx-2 h-6 w-px bg-gray-200" />
                                        {toolbarButtons.map(({ icon: Icon, label: title, command, shouldUpdate, disabled }) => (
                                                <Button
                                                        key={title}
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                                                        onMouseDown={(event) =>
                                                                handleButtonClick(event, { command, shouldUpdate, disabled })
                                                        }
                                                        aria-label={title}
                                                        disabled={disabled}
                                                >
                                                        <Icon className={`h-4 w-4 ${Icon === Loader2 ? "animate-spin" : ""}`} />
                                                </Button>
                                        ))}
                                        <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageSelection}
                                        />
                                </div>

                                <div
                                        ref={editorRef}
                                        className="min-h-[320px] space-y-3 px-4 py-4 text-sm leading-relaxed text-slate-800 outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={handleInput}
                                        onBlur={handleInput}
                                />
                        </div>
                </div>
        );
}
