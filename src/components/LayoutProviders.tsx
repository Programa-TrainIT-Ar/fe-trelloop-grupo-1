'use client';

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export function LayoutProviders({children}: {children: React.ReactNode}) {
    const pathname = usePathname();
    const isDashboardRoute = pathname?.startsWith('/dashboard');
    const isEditRoute = pathname?.startsWith('/board/edit');

    return (
        <>
            {!isDashboardRoute && <Navbar />}
            {!isDashboardRoute && !isEditRoute && <Breadcrumb />}
            <main>{children}</main>
        </>
    )
}