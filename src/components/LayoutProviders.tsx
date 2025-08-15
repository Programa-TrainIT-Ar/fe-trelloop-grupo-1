'use client';

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { NotificationProvider } from "@/components/common/NotificationContext";


function useCurrentUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const id = localStorage.getItem("userId") || undefined;
  const token = localStorage.getItem("accessToken") || undefined;
  if (!id || !token) return undefined;
  return id;
}

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isEditRoute = pathname?.startsWith('/board/edit');

  // 🔐 Trae el userId (luego cámbialo por tu store real)
  const userId = useCurrentUserId();

  return (
    <NotificationProvider userId={userId}>
      <>
        {!isDashboardRoute && <Navbar />}
        {!isDashboardRoute && !isEditRoute && <Breadcrumb />}
        <main>{children}</main>
      </>
    </NotificationProvider>
  );
}