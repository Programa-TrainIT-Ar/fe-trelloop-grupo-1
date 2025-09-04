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
    loadMoreNotifications,
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
      {/* Botón de campana */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative rounded-full text-white hover:bg-neutral-700 p-2"
      >
        <GoBell className="size-8" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full shadow"
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
          className="absolute right-0 mt-3 w-96 max-h-[32rem] overflow-y-auto bg-neutral-800 text-white rounded-2xl shadow-2xl border border-neutral-700 z-50"
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
            <h3 className="font-semibold text-lg">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs px-2 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600"
                disabled={loading}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="p-3">
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No tienes notificaciones.</p>
              </div>
            ) : (
              <>
                {notifications.map((n: AppNotification) => (
                  <div
                    key={n.id}
                    className={`p-4 mb-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-700/40 transition ${n.read ? "" : "border-l-4 border-l-purple-500"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm">{n.title}</div>
                        <p className="text-sm text-gray-300 mt-1">{n.message}</p>
                      </div>
                      {!n.read && <span className="w-3 h-3 rounded-full bg-red-600 mt-1"></span>}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      {n.resource?.kind === "board" && (
                        <Link
                          href={`/dashboard/boards/${n.resource.id}`}
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1 text-purple-400 hover:underline"
                        >
                          Ver tablero →
                        </Link>
                      )}
                      {n.resource?.kind === "card" && (
                        <Link
                          href={`/dashboard/cards/view?cardId=${n.resource.id}`}
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1 text-purple-400 hover:underline"
                        >
                          Ver tarea →
                        </Link>
                      )}
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="ml-auto px-2 py-1 rounded-md bg-neutral-700 hover:bg-neutral-600"
                      >
                        Marcar leída
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón "Cargar más" */}
                {hasMoreNotifications && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => loadMoreNotifications()}
                      disabled={loading}
                      className="w-full text-sm px-3 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50"
                    >
                      {loading ? "Cargando..." : "Cargar más"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

