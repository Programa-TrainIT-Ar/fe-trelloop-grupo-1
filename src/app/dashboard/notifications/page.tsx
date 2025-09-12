"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import Link from "next/link";
import { useState } from "react";
import type { AppNotification } from "@/types/notifications";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    loading,
    loadMoreNotifications,
    hasMoreNotifications,
  } = useNotifications();
  
  const [visibleCount, setVisibleCount] = useState(7);
  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMoreToShow = notifications.length > visibleCount;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              Marcar todas como leídas ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No tienes notificaciones.</p>
            </div>
          ) : (
            <>
              {visibleNotifications.map((n: AppNotification) => (
                <div
                  key={n.id}
                  className={`p-6 rounded-xl border bg-neutral-800 hover:bg-neutral-700/40 transition ${
                    n.read ? "border-neutral-700" : "border-l-4 border-l-purple-500 border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{n.title}</div>
                      <p className="text-gray-300 mt-2">{n.message}</p>
                      {n.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {!n.read && <span className="w-4 h-4 rounded-full bg-red-600 mt-1"></span>}
                  </div>

                  <div className="mt-4 flex items-center gap-4">
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
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="ml-auto px-3 py-1 rounded-md bg-neutral-700 hover:bg-neutral-600"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Show More Button */}
              {(hasMoreToShow || hasMoreNotifications) && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      if (hasMoreToShow) {
                        setVisibleCount(prev => prev + 3);
                      } else {
                        loadMoreNotifications();
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50"
                  >
                    {loading ? "Cargando..." : "Mostrar más"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}