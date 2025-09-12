"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { AppNotification, NotificationType } from "@/types/notifications";
import { subscribeToUserChannel, disconnectPusher } from "@/lib/pusherClient";
import { createNotificationServiceHooks } from "@/services/notificationService";
import { useAuthStore } from "@/store/auth";

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  pushLocalNotification: (n?: Partial<AppNotification>) => void; // para pruebas locales
  loading: boolean;
  loadHistoricalNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  hasMoreNotifications: boolean;
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
  const [loading, setLoading] = useState(false);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // Crear hooks del servicio de notificaciones
  const notificationService = useMemo(
    () => createNotificationServiceHooks(token),
    [token],
  );

  useEffect(() => {
    if (!userId) {
      console.log(
        "[NotificationProvider] No userId provided, skipping Pusher subscription",
      );
      return;
    }

    console.log("[NotificationProvider] Setting up Pusher for user:", userId);

    let channel: any;
    try {
      channel = subscribeToUserChannel(userId);

      const handler = (data: AppNotification) => {
        console.log("[NotificationProvider] Received notification:", data);
        setNotifications((prev) => {
          // Evitar duplicados
          const exists = prev.some((n) => n.id === data.id);
          if (exists) {
            console.log("[NotificationProvider] Notification already exists, skipping");
            return prev;
          }
          return [{ ...data, read: false }, ...prev].sort(
            (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          );
        });
      };

      channel.bind("notification", handler);
      console.log("[NotificationProvider] Notification handler bound successfully");

      return () => {
        try {
          console.log("[NotificationProvider] Cleaning up Pusher subscription");
          channel.unbind("notification", handler);
          channel.unsubscribe();
        } catch (e) {
          console.warn("[NotificationProvider] Error during cleanup:", e);
        }
      };
    } catch (error) {
      console.error("[NotificationProvider] Error setting up Pusher:", error);
    }
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[NotificationProvider] Component unmounting, disconnecting Pusher");
      disconnectPusher();
    };
  }, []);

  // Marcar una notificación como leída (local + sincronizar con backend)
  const markAsRead = useCallback(
    (id: string) => {
      console.log("[NotificationProvider] Marking notification as read:", id);

      // Función de actualización local
      const updateLocalState = (id: string) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      };

      // Sincronizar con el backend si hay token
      if (token) {
        notificationService
          .markAsReadWithSync(id, updateLocalState)
          .catch((error) =>
            console.error("[NotificationProvider] Error syncing read status:", error),
          );
      } else {
        updateLocalState(id);
      }
    },
    [token, notificationService],
  );

  // Marcar todas las notificaciones como leídas (local + sincronizar con backend)
  const markAllAsRead = useCallback(() => {
    console.log("[NotificationProvider] Marking all notifications as read");

    // Función de actualización local
    const updateLocalState = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // Sincronizar con el backend si hay token
    if (token) {
      notificationService
        .markAllAsReadWithSync(updateLocalState)
        .catch((error) =>
          console.error("[NotificationProvider] Error syncing all read status:", error),
        );
    } else {
      updateLocalState();
    }
  }, [token, notificationService]);

  // Cargar notificaciones históricas desde el backend (carga inicial)
  const loadHistoricalNotifications = useCallback(async () => {
    if (!token || !userId) {
      console.log("[NotificationProvider] No token or userId, skipping load");
      return;
    }

    try {
      setLoading(true);
      console.log("[NotificationProvider] Loading historical notifications with token:", token?.substring(0, 10) + '...');

      const result = await notificationService.loadNotifications({
        limit: 20,
        offset: 0,
      });

      // Reemplazar completamente las notificaciones con los datos del servidor
      setNotifications(result.notifications.sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      ));

      // Verificar si hay más notificaciones para cargar
      setHasMoreNotifications(result.meta.total_count > result.notifications.length);
    } catch (error) {
      console.error(
        "[NotificationProvider] Error loading historical notifications:",
        error,
      );
      // Si es error 401, podría ser que el token expiró
      if (error instanceof Error && error.message.includes('401')) {
        console.log("[NotificationProvider] Token might be expired, clearing notifications");
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, notificationService]);

  // Cargar más notificaciones (paginación)
  const loadMoreNotifications = useCallback(async () => {
    if (!token || !userId || loading) return;

    try {
      setLoading(true);
      const result = await notificationService.loadNotifications({
        limit: 20,
        offset: notifications.length,
      });

      setNotifications((prev) => {
        const newNotifications = result.notifications.filter(
          (newNotif) => !prev.some((existing) => existing.id === newNotif.id),
        );
        return [...prev, ...newNotifications].sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      });

      setHasMoreNotifications(
        result.meta.total_count > notifications.length + result.notifications.length,
      );
    } catch (error) {
      console.error("[NotificationProvider] Error loading more notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token, userId, loading, notifications.length, notificationService]);

  // Cargar notificaciones iniciales al montar el componente
  useEffect(() => {
    if (userId && token && notifications.length === 0) {
      loadHistoricalNotifications();
    } else if (!userId || !token) {
      setNotifications([]);
    }
  }, [userId, token]);

  // Utilidad para probar la UI sin backend
  const pushLocalNotification = useCallback((n?: Partial<AppNotification>) => {
    const id = crypto.randomUUID();
    const demo: AppNotification = {
      id,
      type: (n?.type as NotificationType) || "BOARD_MEMBER_ADDED",
      title: n?.title || "Notificación de prueba",
      message: n?.message || "Fuiste agregado a un tablero",
      resource: n?.resource || { kind: "board", id: "demo" },
      createdAt: new Date().toISOString(),
      read: false,
      metadata: n?.metadata,
      actorId: n?.actorId,
    };
    console.log("[NotificationProvider] Pushing local notification:", demo);
    setNotifications((prev) => [demo, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      pushLocalNotification,
      loading,
      loadHistoricalNotifications,
      loadMoreNotifications,
      hasMoreNotifications,
    }),
    [
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      pushLocalNotification,
      loading,
      loadHistoricalNotifications,
      loadMoreNotifications,
      hasMoreNotifications,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
