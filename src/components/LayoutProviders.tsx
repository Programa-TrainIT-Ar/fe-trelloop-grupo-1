'use client';

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Breadcrumb } from "./Breadcrumb";

export function LayoutProviders({children}: {children: React.ReactNode}) {
    const pathname = usePathname();
    const isDashboardRoute = pathname?.startsWith('/dashboard');

    return (
        <>
            {!isDashboardRoute && <Navbar />}
            {!isDashboardRoute && <Breadcrumb />}
            <main>{children}</main>
        </>
    )
}