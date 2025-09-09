"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import { useAuthStore } from "@/store/auth/store";
import { useState, useEffect } from "react";

export default function TestNotificationsPage() {
  const { notifications, unreadCount, pushLocalNotification, markAsRead, markAllAsRead } = useNotifications();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [pusherInfo, setPusherInfo] = useState<any>({});

  useEffect(() => {
    // Obtener información de Pusher y auth-storage
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      let parsedAuth = null;

      try {
        if (authStorage) {
          parsedAuth = JSON.parse(authStorage);
        }
      } catch (e) {
        console.error("Error parsing auth-storage:", e);
      }

      setPusherInfo({
        authStorage: parsedAuth,
        pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY,
        pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        pusherAuthEndpoint: process.env.NEXT_PUBLIC_PUSHER_AUTH_ENDPOINT,
      });
    }
  }, []);

  const testNotifications = [
    {
      type: "BOARD_MEMBER_ADDED" as const,
      title: "Agregado a tablero",
      message: "Fuiste agregado al tablero 'Mi Proyecto'",
      resource: { kind: "board" as const, id: "123" },
    },
    {
      type: "CARD_ASSIGNED" as const,
      title: "Tarjeta asignada",
      message: "Se te asignó la tarjeta 'Implementar login'",
      resource: { kind: "card" as const, id: "456" },
    },
  ];

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Test de Notificaciones</h1>

      {/* Información del Usuario */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado de Autenticación</h2>
        <div className="space-y-2 font-mono text-sm">
          <p>
            <strong>Usuario ID:</strong> {user?.id || "No hay usuario"}
          </p>
          <p>
            <strong>Usuario Email:</strong> {user?.email || "No hay email"}
          </p>
          <p>
            <strong>Token presente:</strong> {accessToken ? "✅ Sí" : "❌ No"}
          </p>
          <p>
            <strong>Token (primeros 20 chars):</strong>{" "}
            {accessToken ? accessToken.substring(0, 20) + "..." : "N/A"}
          </p>
        </div>
      </div>

      {/* Información de Pusher */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuración de Pusher</h2>
        <div className="space-y-2 font-mono text-sm">
          <p>
            <strong>Pusher Key:</strong> {pusherInfo.pusherKey || "No configurado"}
          </p>
          <p>
            <strong>Pusher Cluster:</strong> {pusherInfo.pusherCluster || "No configurado"}
          </p>
          <p>
            <strong>Auth Endpoint:</strong> {pusherInfo.pusherAuthEndpoint || "http://localhost:5000/pusher/auth"}
          </p>
        </div>
      </div>

      {/* Auth Storage Debug */}
      <details className="mb-6">
        <summary className="cursor-pointer bg-gray-100 p-4 rounded font-semibold">
          Auth Storage (click para expandir)
        </summary>
        <pre className="bg-gray-900 text-white p-4 rounded mt-2 overflow-auto text-xs">
          {JSON.stringify(pusherInfo.authStorage, null, 2)}
        </pre>
      </details>

      {/* Estado de Notificaciones */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado de Notificaciones</h2>
        <p>
          <strong>Total de notificaciones:</strong> {notifications.length}
        </p>
        <p>
          <strong>No leídas:</strong> {unreadCount}
        </p>
        <p className="text-sm text-green-600 mt-2">
          ✅ Sistema de notificaciones funcionando correctamente
        </p>
      </div>

      {/* Botones de Prueba */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Acciones de Prueba</h2>
        <div className="flex flex-wrap gap-2">
          {testNotifications.map((notif, index) => (
            <button
              key={index}
              onClick={() => pushLocalNotification(notif)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Probar: {notif.title}
            </button>
          ))}
          <button
            onClick={() => markAllAsRead()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Marcar todas como leídas
          </button>
          <button
            onClick={async () => {
              if (!accessToken) {
                alert('No hay token de acceso');
                return;
              }
              try {
                const response = await fetch('http://localhost:5000/realtime/notifications/test-push', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify({
                    title: 'Notificación desde backend',
                    message: 'Esta es una notificación de prueba desde el servidor'
                  })
                });
                if (response.ok) {
                  alert('Notificación enviada desde el backend');
                } else {
                  alert('Error al enviar notificación');
                }
              } catch (error) {
                alert('Error de conexión');
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Probar desde Backend
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:5000/test-notif', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userid: 7,
                    title: '¡Bienvenido!',
                    message: 'Esta es tu primera notificación'
                  })
                });
                if (response.ok) {
                  const result = await response.json();
                  alert(`Notificación creada: ${result.notif_id}`);
                } else {
                  alert(`Error ${response.status}`);
                }
              } catch (error) {
                alert(`Error: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Crear Notificación DB
          </button>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Notificaciones Actuales</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No hay notificaciones</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded border ${
                  notif.read ? "bg-gray-50 border-gray-300" : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{notif.title}</h3>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {notif.id} | Tipo: {notif.type}
                    </p>
                    {notif.resource && (
                      <p className="text-xs text-gray-500">
                        Recurso: {notif.resource.kind} - {notif.resource.id}
                      </p>
                    )}
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logs de Consola */}
      <div className="mt-8 p-4 bg-gray-900 text-white rounded">
        <h2 className="text-xl font-semibold mb-2">Instrucciones de Debug</h2>
        <p className="text-sm">
          Abre la consola del navegador (F12) para ver los logs de:
        </p>
        <ul className="list-disc list-inside text-sm mt-2">
          <li>[LayoutProviders] - Estado del usuario</li>
          <li>[pusher] - Conexión y suscripciones</li>
          <li>[NotificationProvider] - Recepción de notificaciones</li>
        </ul>
      </div>
    </div>
  );
}
