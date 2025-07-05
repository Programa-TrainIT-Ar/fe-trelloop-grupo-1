import Link from "next/link";
import React from "react";

export const Breadcrumb: React.FC = () => {
    return (


        <nav className="flex" aria-label="Breadcrumb">
            <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
                    <svg className="w-3 h-3 me-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="" />
                    </svg>
                    Home
            </Link>
        </nav>

    )
}