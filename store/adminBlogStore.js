"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

const defaultFilters = {
        search: "",
        status: "all",
        category: "",
        tag: "",
};

const defaultPagination = {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
};

export const useAdminBlogStore = create((set, get) => ({
        posts: [],
        categories: [],
        tags: [],
        filters: defaultFilters,
        pagination: defaultPagination,
        isLoading: false,
        isSaving: false,

        setFilters: (updates) =>
                set((state) => ({ filters: { ...state.filters, ...updates } })),

        resetFilters: () => set({ filters: defaultFilters }),

        setPage: (page) =>
                set((state) => ({
                        pagination: { ...state.pagination, page },
                })),

        fetchPosts: async () => {
                set({ isLoading: true });

                try {
                        const { filters, pagination } = get();
                        const params = new URLSearchParams();

                        params.set("page", pagination.page.toString());
                        params.set("limit", pagination.limit.toString());

                        if (filters.search) {
                                params.set("search", filters.search);
                        }

                        if (filters.status && filters.status !== "all") {
                                params.set("status", filters.status);
                        }

                        if (filters.category) {
                                params.set("category", filters.category);
                        }

                        if (filters.tag) {
                                params.set("tag", filters.tag);
                        }

                        const response = await fetch(
                                `/api/admin/blog/posts?${params.toString()}`,
                                {
                                        cache: "no-store",
                                }
                        );
                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to fetch posts");
                        }

                        set({
                                posts: data.posts || [],
                                categories: data.categories || [],
                                tags: data.tags || [],
                                pagination: data.pagination || defaultPagination,
                                isLoading: false,
                        });
                } catch (error) {
                        console.error("Admin blog fetch error", error);
                        set({ isLoading: false });
                        toast.error(error?.message || "Unable to load blog posts");
                }
        },

        fetchCategories: async () => {
                try {
                        const response = await fetch("/api/admin/blog/categories", {
                                cache: "no-store",
                        });
                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to fetch categories");
                        }

                        set({ categories: data.categories || [] });
                } catch (error) {
                        console.error("Admin blog categories fetch error", error);
                        toast.error(error?.message || "Unable to load categories");
                }
        },

        createCategory: async (payload) => {
                try {
                        const response = await fetch("/api/admin/blog/categories", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                        });

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to create category");
                        }

                        set((state) => ({
                                categories: [...state.categories, data.category],
                        }));

                        toast.success("Category created successfully");
                        return true;
                } catch (error) {
                        console.error("Create category error", error);
                        toast.error(error?.message || "Unable to create category");
                        return false;
                }
        },

        updateCategory: async (categoryId, payload) => {
                try {
                        const response = await fetch(
                                `/api/admin/blog/categories/${categoryId}`,
                                {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                }
                        );

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to update category");
                        }

                        set((state) => ({
                                categories: state.categories.map((category) =>
                                        category._id === categoryId ? data.category : category
                                ),
                        }));

                        toast.success("Category updated successfully");
                        return true;
                } catch (error) {
                        console.error("Update category error", error);
                        toast.error(error?.message || "Unable to update category");
                        return false;
                }
        },

        deleteCategory: async (categoryId) => {
                try {
                        const response = await fetch(
                                `/api/admin/blog/categories/${categoryId}`,
                                {
                                        method: "DELETE",
                                }
                        );

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to delete category");
                        }

                        set((state) => ({
                                categories: state.categories.filter(
                                        (category) => category._id !== categoryId
                                ),
                        }));

                        toast.success("Category deleted successfully");
                        return true;
                } catch (error) {
                        console.error("Delete category error", error);
                        toast.error(error?.message || "Unable to delete category");
                        return false;
                }
        },

        createPost: async (payload) => {
                set({ isSaving: true });

                try {
                        const response = await fetch("/api/admin/blog/posts", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                        });

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to create post");
                        }

                        toast.success("Blog post created successfully");
                        await get().fetchPosts();
                        return true;
                } catch (error) {
                        console.error("Create post error", error);
                        toast.error(error?.message || "Unable to create blog post");
                        return false;
                } finally {
                        set({ isSaving: false });
                }
        },

        updatePost: async (postId, payload) => {
                set({ isSaving: true });

                try {
                        const response = await fetch(`/api/admin/blog/posts/${postId}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                        });

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to update post");
                        }

                        toast.success("Blog post updated successfully");
                        await get().fetchPosts();
                        return true;
                } catch (error) {
                        console.error("Update post error", error);
                        toast.error(error?.message || "Unable to update blog post");
                        return false;
                } finally {
                        set({ isSaving: false });
                }
        },

        deletePost: async (postId) => {
                try {
                        const response = await fetch(`/api/admin/blog/posts/${postId}`, {
                                method: "DELETE",
                        });

                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Failed to delete post");
                        }

                        toast.success("Blog post deleted successfully");
                        await get().fetchPosts();
                        return true;
                } catch (error) {
                        console.error("Delete post error", error);
                        toast.error(error?.message || "Unable to delete blog post");
                        return false;
                }
        },
}));
