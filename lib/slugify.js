export const slugify = (value = "") =>
        value
                .toString()
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

export const ensureSlug = (value = "") => {
        const slug = slugify(value);
        return slug || "";
};

export const isSlugMatch = (value = "", slug = "") => {
        if (!value && !slug) return true;
        return ensureSlug(value) === ensureSlug(slug);
};
