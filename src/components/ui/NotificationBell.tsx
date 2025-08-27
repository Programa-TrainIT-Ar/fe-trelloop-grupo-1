"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GoBell } from "react-icons/go";
import type { AppNotification } from "@/types/notifications";
import { useAuthStore } from "@/store/auth/store";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    pushLocalNotification,
    loading,
    loadHistoricalNotifications,
    hasMoreNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((state) => state.accessToken);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => setOpen((o) => !o);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative rounded-full text-white hover:text-white hover:bg-[--global-color-neutral-700] p-2"
      >
        <GoBell className="size-10" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "red",
              color: "white",
              borderRadius: "999px",
              padding: "2px 6px",
              fontSize: 12,
            }}
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Lista de notificaciones"
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[--global-color-neutral-700] text-white rounded-xl shadow-lg p-3 z-50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <strong>Notificaciones</strong>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm px-2 py-1 rounded hover:bg-[--global-color-neutral-800]"
                  disabled={loading}
                >
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-300">No tienes notificaciones.</p>
            </div>
          ) : (
            <>
              {notifications.map((n: AppNotification) => (
                <div
                  key={n.id}
                  className={`p-2 rounded mb-2 ${n.read ? "bg-transparent" : "bg-white/10"}`}
                >
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-sm text-gray-200">{n.message}</div>

                  <div className="mt-2 flex items-center gap-3">
                    {n.resource?.kind === "board" && (
                      <Link
                        href={`/board/${n.resource.id}`}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs underline"
                      >
                        Ir al tablero
                      </Link>
                    )}
                    {n.resource?.kind === "card" && (
                      <Link
                        href={`/board/cards/${n.resource.id}`}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs underline"
                      >
                        Ver tarjeta
                      </Link>
                    )}

                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs px-2 py-1 rounded hover:bg-[--global-color-neutral-800]"
                    >
                      Marcar leída
                    </button>
                  </div>
                </div>
              ))}

              {/* Mostrar botón "Cargar más" si hay más notificaciones */}
              {hasMoreNotifications && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => loadHistoricalNotifications()}
                    disabled={loading}
                    className="w-full text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
                  >
                    {loading ? "Cargando..." : "Cargar más"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Botones de prueba en development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 border-t border-white/10 pt-2">
              <p className="text-xs text-gray-400 mb-2">Herramientas de desarrollo:</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => pushLocalNotification()}
                  className="w-full px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-xs"
                >
                  Probar notificación local
                </button>
                {token && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/test-notification", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        if (!response.ok)
                          throw new Error("Error sending test notification");
                      } catch (error) {
                        console.error("Error testing notification:", error);
                      }
                    }}
                    className="w-full px-3 py-2 rounded bg-blue-700/30 hover:bg-blue-700/50 text-xs"
                  >
                    Probar notificación desde API
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
