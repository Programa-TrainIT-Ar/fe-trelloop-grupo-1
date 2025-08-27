"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppNotification } from "@/types/notifications";
import { subscribeToUserChannel, disconnectPusher } from "@/lib/pusherClient";
import Pusher from "pusher-js";

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  pushLocalNotification: (n?: Partial<AppNotification>) => void; // para pruebas locales
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);


  useEffect(() => {
    if (!userId) return;
    console.log("NotificationProvider: subscribing to pusher for user", userId);
    const channel = subscribeToUserChannel(userId);
    const handler = (data: AppNotification) => {
      console.log("NotificationProvider: received notification", data);
      setNotifications((prev) => [{ ...data, read: false }, ...prev]);
    };
    channel.bind("notification", handler);
    return () => {
      try {
        channel.unbind("notification", handler);
      } catch (e) {
        console.warn("Error unbinding channel", e);
      }
      disconnectPusher();
    };
  }, [userId]);


  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Utilidad para probar la UI sin backend
  const pushLocalNotification = (n?: Partial<AppNotification>) => {
    const id = crypto.randomUUID();
    const demo: AppNotification = {
      id,
      type: (n?.type as any) || "BOARD_MEMBER_ADDED",
      title: n?.title || "Notificación de prueba",
      message: n?.message || "Fuiste agregado a un tablero",
      resource: n?.resource || { kind: "board", id: "demo" },
      createdAt: new Date().toISOString(),
      read: false,
      metadata: n?.metadata,
      actorId: n?.actorId,
    };
    setNotifications((prev) => [demo, ...prev]);
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, markAllAsRead, markAsRead, pushLocalNotification }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};