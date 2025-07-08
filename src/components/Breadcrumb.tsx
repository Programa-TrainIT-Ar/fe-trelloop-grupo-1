import Link from "next/link";
import React from "react";

export const Breadcrumb: React.FC = () => {
    return (


        <nav className="flex flex-col" aria-label="Breadcrumb">
            <Link
                href="/"
                className="inline-flex items-center text-xl text-white italic m-2"
            >
                <svg className="w-10 h-10 text-gray-800 dark:text-white mx-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4" />
                </svg>
                Registro de usuario
            </Link>
            <hr className="border-t border-gray-300 my-2 w-full" />
        </nav>

    )
}



