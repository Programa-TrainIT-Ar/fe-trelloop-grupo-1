'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import Swal from "sweetalert2";

export const Breadcrumb: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === "/") {
        return null;
    }

    const routeTitles: Record<string, string> = {
        "/login": "LOGIN",
        "/register": "REGISTER",
        "/registro": "Registro de usuario",
    };

    const currentTitle = routeTitles[pathname] || pathname.replace("/", "").toUpperCase();

    const handleRegisterBack = (e: React.MouseEvent) => {
        e.preventDefault();
        Swal.fire({
            icon: "warning",
            title: "¿Estás seguro que deseas salir?",
            text: "Los datos no guardados se perderán.",
            background: "rgb(26, 26, 26)",
            iconColor: "#6A5FFF",
            color: "#FFFFFF",
            showCancelButton: true,
            confirmButtonText: "Salir",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#FB7A7A",
            customClass: {
                popup: "swal2-dark",
                confirmButton: "swal2-outline-confirm",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.push("/");
            }
        });
    };

    return (

        <nav className="flex flex-col" aria-label="Breadcrumb">
            <div className="flex items-center text-xl italic m-2">
                {pathname === "/register" ? (
                    <button onClick={handleRegisterBack} className="inline-flex items-center">
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
                    </button>
                ) : (
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
                )}
              <span className="breadcrumb-title"> {currentTitle}</span>
            </div>
            <hr className="border-t border-gray-600 my-2 w-full" />
        </nav>
    );
};


