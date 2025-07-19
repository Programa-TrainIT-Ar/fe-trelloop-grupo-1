'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Breadcrumb: React.FC = () => {
    const pathname = usePathname();

    if (pathname === "/") {
        return null;
    }

    const routeTitles: Record<string, string> = {
        "/login": "LOGIN",
        "/registro": "Registro de usuario",
    };

    const currentTitle = routeTitles[pathname] || pathname.replace("/", "").toUpperCase();

    return (

        <nav className="flex flex-col" aria-label="Breadcrumb">
            <div className="flex items-center text-xl italic m-2">
                <Link href="/" className="inline-flex items-center">
                    <svg
                        className="w-6 h-6 text-white mx-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h14M5 12l4-4m-4 4 4 4"
                        />
                    </svg>
                </Link>
              <span className="breadcrumb-title"> {currentTitle}</span>
            </div>
            <hr className="border-t border-gray-600 my-2 w-full" />
        </nav>
    );
};


