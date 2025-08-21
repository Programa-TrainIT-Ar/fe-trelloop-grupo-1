'use client';
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { NotificationProvider } from "@/components/common/NotificationContext";
import { useEffect, useState } from "react";

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isEditRoute = pathname?.startsWith('/board/edit');

  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    if (id && token) setUserId(id);
  }, []);

  return (
    <NotificationProvider userId={userId}>
      {!isDashboardRoute && <Navbar />}
      {!isDashboardRoute && !isEditRoute && <Breadcrumb />}
      <main>{children}</main>
    </NotificationProvider>
  );
}
