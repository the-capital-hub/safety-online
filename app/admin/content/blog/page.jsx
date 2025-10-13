"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
} from "@/components/ui/table";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminBlogStore } from "@/store/adminBlogStore.js";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { BlogPostDialog } from "@/components/AdminPanel/Blog/BlogPostDialog.jsx";
import { BlogCategoryManager } from "@/components/AdminPanel/Blog/BlogCategoryManager.jsx";
import { Plus, Search, Filter, Edit, Trash2, RefreshCw, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

const statusOptions = [
        { label: "All statuses", value: "all" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
];

export default function AdminBlogPage() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();

        const {
                posts,
                categories,
                tags,
                filters,
                pagination,
                isLoading,
                isSaving,
                fetchPosts,
                fetchCategories,
                setFilters,
                setPage,
                resetFilters,
                createPost,
                updatePost,
                deletePost,
                createCategory,
                updateCategory,
                deleteCategory,
        } = useAdminBlogStore();

        const [dialogOpen, setDialogOpen] = useState(false);
        const [dialogMode, setDialogMode] = useState("create");
        const [editingPost, setEditingPost] = useState(null);
        const [searchTerm, setSearchTerm] = useState(filters.search);
        const [selectedTag, setSelectedTag] = useState(filters.tag || "all");

        useEffect(() => {
                if (!isAuthenticated) {
                        const timer = setTimeout(() => {
                                router.push("/admin/login");
                        }, 100);
                        return () => clearTimeout(timer);
                }

                fetchPosts();
                fetchCategories();
        }, [isAuthenticated, router, fetchPosts, fetchCategories]);

        useEffect(() => {
                setSearchTerm(filters.search);
                setSelectedTag(filters.tag || "all");
        }, [filters.search, filters.tag]);

        const formatDate = (date) =>
                new Intl.DateTimeFormat("en", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                }).format(new Date(date));

        const refreshData = () => {
                fetchPosts();
                fetchCategories();
        };

        const handleCreatePost = async (payload) => {
                const success = await createPost(payload);
                if (success) {
                        setDialogOpen(false);
                }
                return success;
        };

        const handleUpdatePost = async (payload) => {
                if (!editingPost?._id) {
                        toast.error("Select a post to update");
                        return false;
                }

                const success = await updatePost(editingPost._id, payload);
                if (success) {
                        setDialogOpen(false);
                        setEditingPost(null);
                }
                return success;
        };

        const openCreateDialog = () => {
                setDialogMode("create");
                setEditingPost(null);
                setDialogOpen(true);
        };

        const openEditDialog = (post) => {
                setDialogMode("edit");
                setEditingPost(post);
                setDialogOpen(true);
        };

        const handleDeletePost = async (postId) => {
                const confirmed = window.confirm(
                        "Delete this post? This action cannot be undone."
                );
                if (!confirmed) return;

                await deletePost(postId);
        };

        const applyFilters = () => {
                setFilters({
                        search: searchTerm.trim(),
                        tag: selectedTag === "all" ? "" : selectedTag,
                });
                setPage(1);
                fetchPosts();
        };

        const resetAllFilters = () => {
                resetFilters();
                setSearchTerm("");
                setSelectedTag("all");
                setPage(1);
                fetchPosts();
        };

        const handleStatusChange = (value) => {
                setFilters({ status: value });
                setPage(1);
                fetchPosts();
        };

        const handleCategoryFilter = (value) => {
                setFilters({ category: value === "all" ? "" : value });
                setPage(1);
                fetchPosts();
        };

        const handleTagFilter = (value) => {
                setSelectedTag(value);
                setFilters({ tag: value === "all" ? "" : value });
                setPage(1);
                fetchPosts();
        };

        const totalPages = pagination.totalPages || 1;

        const paginationLabel = useMemo(() => {
                const start = (pagination.page - 1) * pagination.limit + 1;
                const end = Math.min(pagination.page * pagination.limit, pagination.totalItems);
                return `${start}-${end} of ${pagination.totalItems || 0}`;
        }, [pagination.page, pagination.limit, pagination.totalItems]);

        if (!isAuthenticated) {
                return null;
        }

        return (
                <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                        <h1 className="text-2xl font-semibold text-gray-900">Blog manager</h1>
                                        <p className="text-sm text-gray-500">
                                                Publish insightful content, optimize SEO, and highlight stories for
                                                your audience.
                                        </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                                variant="outline"
                                                onClick={refreshData}
                                                disabled={isLoading || isSaving}
                                                className="gap-2"
                                        >
                                                <RefreshCw className="h-4 w-4" /> Refresh
                                        </Button>
                                        <Button onClick={openCreateDialog} className="gap-2">
                                                <Plus className="h-4 w-4" /> New post
                                        </Button>
                                </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                                <div className="space-y-6">
                                        <Card className="border-none shadow-sm">
                                                <CardHeader className="pb-4">
                                                        <CardTitle className="text-base font-semibold text-gray-900">
                                                                Posts overview
                                                        </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                                                <form
                                                                        onSubmit={(event) => {
                                                                                event.preventDefault();
                                                                                applyFilters();
                                                                        }}
                                                                        className="relative"
                                                                >
                                                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                                        <Input
                                                                                value={searchTerm}
                                                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                                                placeholder="Search posts"
                                                                                className="pl-9"
                                                                        />
                                                                </form>
                                                                <Select
                                                                        value={filters.status}
                                                                        onValueChange={handleStatusChange}
                                                                >
                                                                        <SelectTrigger>
                                                                                <SelectValue placeholder="Status" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                                {statusOptions.map((option) => (
                                                                                        <SelectItem key={option.value} value={option.value}>
                                                                                                {option.label}
                                                                                        </SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                </Select>
                        <Select
                                value={filters.category || "all"}
                                onValueChange={handleCategoryFilter}
                        >
                                                                        <SelectTrigger>
                                                                                <SelectValue placeholder="Category" />
                                                                        </SelectTrigger>
                                <SelectContent>
                                        <SelectItem value="all">All categories</SelectItem>
                                        {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                </SelectItem>
                                        ))}
                                </SelectContent>
                        </Select>
                        <Select value={selectedTag} onValueChange={handleTagFilter}>
                                <SelectTrigger>
                                        <SelectValue placeholder="All tags" />
                                </SelectTrigger>
                                <SelectContent>
                                        <SelectItem value="all">All tags</SelectItem>
                                        {tags.map((tag) => (
                                                <SelectItem key={tag} value={tag}>
                                                        {tag}
                                                </SelectItem>
                                        ))}
                                                                        </SelectContent>
                                                                </Select>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                                <Button type="button" variant="secondary" onClick={applyFilters}>
                                                                        <Filter className="mr-2 h-4 w-4" /> Apply filters
                                                                </Button>
                                                                <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={resetAllFilters}
                                                                >
                                                                        Clear filters
                                                                </Button>
                                                                <span className="text-xs text-gray-400">
                                                                        {pagination.totalItems || 0} posts found
                                                                </span>
                                                        </div>
                                                        <div className="overflow-hidden rounded-xl border border-gray-200">
                                                                <Table>
                                                                        <TableHeader className="bg-gray-50">
                                                                                <TableRow>
                                                                                        <TableHead className="w-16">Cover</TableHead>
                                                                                        <TableHead>Title</TableHead>
                                                                                        <TableHead>Status</TableHead>
                                                                                        <TableHead>Categories</TableHead>
                                                                                        <TableHead>Updated</TableHead>
                                                                                        <TableHead className="text-right">Actions</TableHead>
                                                                                </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                                {!isLoading && posts.length === 0 && (
                                                                                        <TableRow>
                                                                                                <TableCell
                                                                                                        colSpan={6}
                                                                                                        className="py-10 text-center text-sm text-gray-500"
                                                                                                >
                                                                                                        No posts found. Create your first article to
                                                                                                        engage readers.
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                )}
                                                                                {posts.map((post) => {
                                                                                        const publishedDate = post.publishedAt
                                                                                                ? formatDate(post.publishedAt)
                                                                                                : "Draft";
                                                                                        return (
                                                                                                <TableRow key={post._id} className="hover:bg-gray-50">
                                                                                                        <TableCell>
                                                                                                                {post.coverImage?.url ? (
                                                                                                                        <Image
                                                                                                                                src={post.coverImage.url}
                                                                                                                                alt={post.coverImage.alt || post.title}
                                                                                                                                width={56}
                                                                                                                                height={56}
                                                                                                                                className="h-14 w-14 rounded-md object-cover"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                                                                                                                <BookOpen className="h-5 w-5" />
                                                                                                                        </div>
                                                                                                                )}
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <div className="space-y-1">
                                                                                                                        <p className="font-medium text-gray-900">
                                                                                                                                {post.title}
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-gray-500 line-clamp-2">
                                                                                                                                {post.excerpt || "No excerpt"}
                                                                                                                        </p>
                                                                                                                        <Link
                                                                                                                                href={`/blog/${post.slug}`}
                                                                                                                                target="_blank"
                                                                                                                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                                                                                                        >
                                                                                                                                View live
                                                                                                                        </Link>
                                                                                                                </div>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <div className="flex flex-col gap-1">
                                                                                                                        <Badge
                                                                                                                                variant={
                                                                                                                                        post.status === "published"
                                                                                                                                                ? "default"
                                                                                                                                                : "outline"
                                                                                                                                }
                                                                                                                                className={
                                                                                                                                        post.status === "published"
                                                                                                                                                ? "bg-green-600 text-white"
                                                                                                                                                : "text-gray-600"
                                                                                                                                }
                                                                                                                        >
                                                                                                                                {post.status}
                                                                                                                        </Badge>
                                                                                                                        {post.isFeatured && (
                                                                                                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                                                                                                                        Featured
                                                                                                                                </Badge>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <div className="flex flex-wrap gap-1">
                                                                                                                        {post.categories?.length ? (
                                                                                                                                post.categories.map((category) => (
                                                                                                                                        <Badge
                                                                                                                                                key={category._id}
                                                                                                                                                variant="outline"
                                                                                                                                                className="border-blue-200 text-xs text-blue-700"
                                                                                                                                        >
                                                                                                                                                {category.name}
                                                                                                                                        </Badge>
                                                                                                                                ))
                                                                                                                        ) : (
                                                                                                                                <span className="text-xs text-gray-400">
                                                                                                                                        Uncategorized
                                                                                                                                </span>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <div className="text-sm text-gray-600">
                                                                                                                        {formatDate(post.updatedAt)}
                                                                                                                </div>
                                                                                                                <p className="text-xs text-gray-400">{publishedDate}</p>
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                                <div className="flex justify-end gap-2">
                                                                                                                        <Button
                                                                                                                                variant="ghost"
                                                                                                                                size="sm"
                                                                                                                                onClick={() => openEditDialog(post)}
                                                                                                                                className="text-blue-600 hover:bg-blue-50"
                                                                                                                        >
                                                                                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                                                                                        </Button>
                                                                                                                        <Button
                                                                                                                                variant="ghost"
                                                                                                                                size="sm"
                                                                                                                                onClick={() => handleDeletePost(post._id)}
                                                                                                                                className="text-red-600 hover:bg-red-50"
                                                                                                                        >
                                                                                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                                                                        </Button>
                                                                                                                </div>
                                                                                                        </TableCell>
                                                                                                </TableRow>
                                                                                        );
                                                                                })}
                                                                                {isLoading && (
                                                                                        <TableRow>
                                                                                                <TableCell colSpan={6} className="py-10 text-center">
                                                                                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                                                                Loading posts...
                                                                                                        </div>
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                )}
                                                                        </TableBody>
                                                                </Table>
                                                        </div>
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <span className="text-sm text-gray-500">{paginationLabel}</span>
                                                                <div className="flex items-center gap-2">
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={pagination.page <= 1}
                                                                                onClick={() => {
                                                                                        setPage(Math.max(pagination.page - 1, 1));
                                                                                        fetchPosts();
                                                                                }}
                                                                        >
                                                                                Previous
                                                                        </Button>
                                                                        <span className="text-xs text-gray-500">
                                                                                Page {pagination.page} of {totalPages}
                                                                        </span>
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={pagination.page >= totalPages}
                                                                                onClick={() => {
                                                                                        setPage(Math.min(pagination.page + 1, totalPages));
                                                                                        fetchPosts();
                                                                                }}
                                                                        >
                                                                                Next
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>
                                </div>
                                <div className="space-y-6">
                                        <BlogCategoryManager
                                                categories={categories}
                                                onCreate={createCategory}
                                                onUpdate={updateCategory}
                                                onDelete={deleteCategory}
                                        />
                                        <Card className="border-none shadow-sm">
                                                <CardHeader>
                                                        <CardTitle className="text-base font-semibold text-gray-900">
                                                                Popular tags
                                                        </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                        {tags.length === 0 ? (
                                                                <p className="text-sm text-gray-500">
                                                                        Tags appear after you publish posts with tagged topics.
                                                                </p>
                                                        ) : (
                                                                <div className="flex flex-wrap gap-2">
                                                                        {tags.map((tag) => (
                                                                                <Badge
                                                                                        key={tag}
                                                                                        variant={selectedTag === tag ? "default" : "outline"}
                                                                                        className={
                                                                                                selectedTag === tag
                                                                                                        ? "bg-blue-600 text-white"
                                                                                                        : "border-blue-200 text-blue-700"
                                                                                        }
                                                                                        onClick={() => handleTagFilter(tag)}
                                                                                >
                                                                                        #{tag}
                                                                                </Badge>
                                                                        ))}
                                                                </div>
                                                        )}
                                                </CardContent>
                                        </Card>
                                </div>
                        </div>

                        <BlogPostDialog
                                open={dialogOpen}
                                onOpenChange={setDialogOpen}
                                mode={dialogMode}
                                initialData={editingPost}
                                categories={categories}
                                onSubmit={dialogMode === "edit" ? handleUpdatePost : handleCreatePost}
                                isSaving={isSaving}
                        />
                </motion.div>
        );
}
