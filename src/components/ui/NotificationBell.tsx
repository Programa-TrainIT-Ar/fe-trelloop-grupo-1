"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import { useState } from "react";
import Link from "next/link";
import { GoBell } from "react-icons/go";
import type { AppNotification } from "@/types/notifications";

export default function NotificationBell() {
    const { notifications, unreadCount, markAllAsRead, markAsRead, pushLocalNotification } =
        useNotifications();
    const [open, setOpen] = useState(false);

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
                    role="dialog"
                    aria-label="Lista de notificaciones"
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[--global-color-neutral-700] text-white rounded-xl shadow-lg p-3 z-50"
                >
                    <div className="flex items-center justify-between mb-2">
                        <strong>Notificaciones</strong>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    markAllAsRead();
                                }}
                                className="text-sm px-2 py-1 rounded hover:bg-[--global-color-neutral-800]"
                            >
                                Marcar todas
                            </button>
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-300">No tienes notificaciones.</p>
                    ) : (
                        notifications.map((n: AppNotification) => (
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
                        ))
                    )}

                    {/* Botón de prueba en development */}
                    {process.env.NODE_ENV === "development" && (
                        <button
                            onClick={() => pushLocalNotification()}
                            className="w-full mt-2 px-3 py-2 rounded bg-white/10 text-sm"
                        >
                            Probar notificación local
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}