"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { AppNotification } from "@/types/notifications";
import NotificationFilters from "@/components/notifications/NotificationFilters";

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
  const [filteredNotifications, setFilteredNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotifications(filtered);
    }
  }, [notifications, searchQuery]);
  
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMoreToShow = filteredNotifications.length > visibleCount;
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(7);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(7);
  };

  return (
    <div className="min-h-screen text-white p-0">
      
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Historial de notificaciones</h1>
        <NotificationFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />
      </div>

         
      {/* Header */}
      <div className="px-6 mb-6">
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
      <div className="bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] mx-6 p-6">
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{searchQuery ? 'No se encontraron notificaciones.' : 'No tienes notificaciones.'}</p>
            </div>
          ) : (
            <>

              {visibleNotifications.map((n: AppNotification) => (
                <div
                  key={n.id}
                  className={`w-full p-6 rounded-xl border bg-neutral-800 hover:bg-neutral-700/40 transition ${
                    n.read ? "border-neutral-700" : "border-l-4 border-l-purple-500 border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between ">
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