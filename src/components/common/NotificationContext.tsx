"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppNotification } from "@/types/notifications";
import { subscribeToUserChannel, disconnectPusher } from "@/lib/pusherClient";

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  pushLocalNotification: (n?: Partial<AppNotification>) => void; // para pruebas locales
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({ userId, children }: { userId?: string; children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    console.log("NotificationProvider: subscribing to pusher for user", userId);

    const channel = subscribeToUserChannel(userId);
    const handler = (data: AppNotification) => {
      console.log("NotificationProvider: received notification", data);
      setNotifications((prev) => [{ ...data, read: false }, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    channel.bind("notification", handler);

    return () => {
      channel.unbind("notification", handler);
      disconnectPusher();
    };
  }, [userId]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAllAsRead: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))),
    markAsRead: (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    pushLocalNotification: (n?: Partial<AppNotification>) => {
      const id = crypto.randomUUID();
      const demo: AppNotification = {
        id,
        type: (n?.type as any) || "BOARD_MEMBER_ADDED",
        title: n?.title || "Notificación de prueba",
        message: n?.message || "Fuiste agregado a un tablero",
        resource: n?.resource || { kind: "board", id: "demo" },
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [demo, ...prev]);
      setUnreadCount(c => c + 1);
    },
  }), [notifications, unreadCount]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};