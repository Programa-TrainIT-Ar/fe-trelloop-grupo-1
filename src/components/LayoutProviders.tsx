"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { NotificationProvider } from "@/components/common/NotificationContext";
import { useAuthStore } from "@/store/auth/store";
import { useEffect, useState } from "react";

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isEditRoute = pathname?.startsWith("/board/edit");

  // Obtener el usuario del store de Zustand
  const user = useAuthStore((state) => state.user);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    // Actualizar el userId cuando cambie el usuario
    if (user) {
      // Convertir el id a string si es número
      const id = user.id ? String(user.id) : undefined;
      setUserId(id);
      console.log("[LayoutProviders] User ID updated:", id);
    } else {
      setUserId(undefined);
      console.log("[LayoutProviders] No user found");
    }
  }, [user]);

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
