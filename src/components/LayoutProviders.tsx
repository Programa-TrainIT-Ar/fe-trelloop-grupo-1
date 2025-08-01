'use client';

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Breadcrumb } from "@/components/common/Breadcrumb";

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