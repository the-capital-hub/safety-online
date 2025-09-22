import Link from "next/link";

export default function NotFound() {
        return (
                <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-16 text-center">
                        <div className="max-w-md space-y-6">
                                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                        404 error
                                </p>
                                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                                        We can{"'"}t find that page
                                </h1>
                                <p className="text-base text-gray-600">
                                        Sorry, the page you are looking for doesn{"'"}t exist or has been moved.
                                        You can return to the homepage to continue browsing safety gear.
                                </p>
                                <div className="flex justify-center">
                                        <Link
                                                href="/"
                                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        >
                                                Back to home
                                        </Link>
                                </div>
                        </div>
                </main>
        );
}
