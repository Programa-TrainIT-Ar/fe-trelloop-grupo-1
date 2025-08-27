// src/services/notificationService.ts
import { AppNotification } from "@/types/notifications";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

/**
 * Obtiene las notificaciones del usuario autenticado.
 *
 * @param token JWT token para autenticación
 * @param options Opciones de paginación y filtrado
 * @returns Lista de notificaciones y metadatos
 */
export async function fetchNotifications(token: string, options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<{
  notifications: AppNotification[];
  meta: {
    total_count: number;
    unread_count: number;
    limit: number;
    offset: number;
  };
}> {
  if (!token) {
    throw new Error("Se requiere autenticación");
  }

  // Construir la URL con los query params
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append("limit", String(options.limit));
  if (options?.offset) queryParams.append("offset", String(options.offset));
  if (options?.unreadOnly) queryParams.append("unread_only", "true");

  const queryString = queryParams.toString();
  const url = `${API_BASE}/realtime/notifications${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[notificationService] Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Marca una notificación específica como leída.
 *
 * @param token JWT token para autenticación
 * @param notificationId ID de la notificación a marcar
 * @returns Datos actualizados de la notificación y contador de no leídas
 */
export async function markNotificationAsRead(token: string, notificationId: string): Promise<{
  notification: AppNotification;
  unread_count: number;
}> {
  if (!token) {
    throw new Error("Se requiere autenticación");
  }

  try {
    const response = await fetch(`${API_BASE}/realtime/notifications/mark-one-read/${notificationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[notificationService] Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Marca todas las notificaciones como leídas o un conjunto específico.
 *
 * @param token JWT token para autenticación
 * @param options Opciones para marcar como leídas (todas o específicas)
 * @returns Contador actualizado de notificaciones no leídas
 */
export async function markNotificationsAsRead(token: string, options: {
  all?: boolean;
  ids?: string[];
}): Promise<{
  updated_count: number;
  unread_count: number;
}> {
  if (!token) {
    throw new Error("Se requiere autenticación");
  }

  // Validar opciones
  if (!options.all && (!options.ids || options.ids.length === 0)) {
    throw new Error("Se debe especificar 'all' o proporcionar 'ids'");
  }

  try {
    const response = await fetch(`${API_BASE}/realtime/notifications/mark-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[notificationService] Error marking notifications as read:", error);
    throw error;
  }
}

/**
 * Envía una notificación de prueba al usuario actual.
 * Útil para testing del sistema de notificaciones.
 *
 * @param token JWT token para autenticación
 * @param data Datos de la notificación de prueba
 * @returns ID de la notificación creada
 */
export async function sendTestNotification(token: string, data?: {
  title?: string;
  message?: string;
  type?: string;
  resource_kind?: string;
  resource_id?: string;
}): Promise<{
  notification_id: string;
}> {
  if (!token) {
    throw new Error("Se requiere autenticación");
  }

  try {
    const response = await fetch(`${API_BASE}/realtime/notifications/test-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data || {})
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[notificationService] Error sending test notification:", error);
    throw error;
  }
}

/**
 * Integración con el contexto de notificaciones.
 * Actualiza el estado local y en el servidor.
 */
export function createNotificationServiceHooks(token: string | null) {
  return {
    /**
     * Marca una notificación como leída tanto localmente como en el servidor.
     */
    markAsReadWithSync: async (
      id: string,
      localMarkAsRead: (id: string) => void,
    ): Promise<void> => {
      if (!token) {
        // Si no hay token, sólo actualizamos localmente
        localMarkAsRead(id);
        return;
      }

      try {
        // Primero actualizamos localmente para una UI responsiva
        localMarkAsRead(id);

        // Luego sincronizamos con el servidor
        await markNotificationAsRead(token, id);
      } catch (error) {
        console.error("[notificationService] Error syncing read status:", error);
        // No revertimos el estado local para evitar confusión en la UI
      }
    },

    /**
     * Marca todas las notificaciones como leídas tanto localmente como en el servidor.
     */
    markAllAsReadWithSync: async (
      localMarkAllAsRead: () => void,
    ): Promise<void> => {
      if (!token) {
        // Si no hay token, sólo actualizamos localmente
        localMarkAllAsRead();
        return;
      }

      try {
        // Primero actualizamos localmente para una UI responsiva
        localMarkAllAsRead();

        // Luego sincronizamos con el servidor
        await markNotificationsAsRead(token, { all: true });
      } catch (error) {
        console.error("[notificationService] Error syncing all read status:", error);
        // No revertimos el estado local para evitar confusión en la UI
      }
    },

    /**
     * Carga las notificaciones desde el servidor
     */
    loadNotifications: async (options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }) => {
      if (!token) {
        return { notifications: [], meta: { total_count: 0, unread_count: 0, limit: 0, offset: 0 } };
      }

      try {
        return await fetchNotifications(token, options);
      } catch (error) {
        console.error("[notificationService] Error loading notifications:", error);
        return { notifications: [], meta: { total_count: 0, unread_count: 0, limit: 0, offset: 0 } };
      }
    }
  };
}
