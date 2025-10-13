"use client";

import { useEffect, useRef } from "react";
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
} from "lucide-react";

const TOOLBAR_BUTTONS = [
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
                icon: ImageIcon,
                label: "Insert image",
                command: () => {
                        const url = window.prompt("Paste the image URL", "https://");
                        if (url) {
                                document.execCommand("insertImage", false, url);
                        }
                },
        },
        {
                icon: Code2,
                label: "Code block",
                command: () => document.execCommand("formatBlock", false, "pre"),
        },
];

const HISTORY_BUTTONS = [
        { icon: Undo2, label: "Undo", command: () => document.execCommand("undo") },
        { icon: Redo2, label: "Redo", command: () => document.execCommand("redo") },
        { icon: Eraser, label: "Clear format", command: () => document.execCommand("removeFormat") },
];

export function RichTextEditor({ value, onChange, label = "Content" }) {
        const editorRef = useRef(null);

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

        const handleButtonClick = (event, command) => {
                event.preventDefault();
                editorRef.current?.focus();
                command();
                handleInput();
        };

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
                                                        onMouseDown={(event) => handleButtonClick(event, command)}
                                                        aria-label={title}
                                                >
                                                        <Icon className="h-4 w-4" />
                                                </Button>
                                        ))}
                                        <div className="mx-2 h-6 w-px bg-gray-200" />
                                        {TOOLBAR_BUTTONS.map(({ icon: Icon, label: title, command }) => (
                                                <Button
                                                        key={title}
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                                                        onMouseDown={(event) => handleButtonClick(event, command)}
                                                        aria-label={title}
                                                >
                                                        <Icon className="h-4 w-4" />
                                                </Button>
                                        ))}
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
