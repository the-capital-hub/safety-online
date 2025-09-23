"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useIsAuthenticated } from "@/store/authStore";

const buildLoginUrl = (targetPath) => {
        if (!targetPath || targetPath === "/login") {
                return "/login";
        }
        return "/login";
};

export function useRequireAuth(defaultMessage = "Please login to continue") {
        const isAuthenticated = useIsAuthenticated();
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        const currentLocation = useMemo(() => {
                if (!pathname) return "/";
                const query = searchParams?.toString();
                return query ? `${pathname}?${query}` : pathname;
        }, [pathname, searchParams]);

        return useCallback(
                (options = {}) => {
                        const opts =
                                typeof options === "string"
                                        ? { message: options }
                                        : options || {};
                        const message = opts.message ?? defaultMessage;
                        const redirectTo = opts.redirectTo ?? currentLocation;

                        if (!isAuthenticated) {
                                if (message) {
                                        toast.error(message);
                                }

                                const loginUrl = buildLoginUrl(redirectTo);
                                router.push(loginUrl);
                                return false;
                        }

                        return true;
                },
                [currentLocation, defaultMessage, isAuthenticated, router]
        );
}

export default useRequireAuth;
