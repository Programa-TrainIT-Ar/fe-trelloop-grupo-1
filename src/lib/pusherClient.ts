// lib/pusherClient.ts
import Pusher, { Channel } from "pusher-js";

let pusher: Pusher | null = null;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // Obtener el token del store de Zustand
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const authData = JSON.parse(authStorage);
    return authData?.state?.accessToken || null;
  } catch (error) {
    console.error("Error parsing auth-storage:", error);
    return null;
  }
}

function initPusher(): Pusher | null {
  if (typeof window === "undefined") return null;
  if (pusher) return pusher;

  // debug
  // @ts-ignore
  Pusher.logToConsole = true;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const authEndpoint = process.env.NEXT_PUBLIC_PUSHER_AUTH_ENDPOINT || "http://localhost:5000/pusher/auth";

  if (!key || !cluster) {
    console.warn("Pusher env vars missing (NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER)");
    return null;
  }

  const token = getAccessToken();
  if (!token) {
    console.warn("[pusher] No JWT access token found; will not auth private channels");
  }

  pusher = new Pusher(key, {
    cluster,
    forceTLS: true,
    authEndpoint,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  });

  pusher.connection.bind("error", (err: any) => {
    console.error("[pusher] connection error", err);
  });

  pusher.connection.bind("connected", () => {
    console.log("[pusher] Connected successfully");
  });

  pusher.connection.bind("state_change", (states: any) => {
    console.log("[pusher] State changed from", states.previous, "to", states.current);
  });

  return pusher;
}

export function subscribeToUserChannel(userId: string, onNotification?: (data: any) => void) {
  const instance = initPusher();
  if (!instance) throw new Error("Pusher not initialized");

  const channelName = `private-user-${userId}`;
  console.log(`[pusher] Attempting to subscribe to channel: ${channelName}`);

  // Verificar si ya estamos suscritos a este canal
  const existingChannel = instance.channel(channelName);
  if (existingChannel && existingChannel.subscribed) {
    console.log(`[pusher] Already subscribed to ${channelName}, reusing channel`);
    return existingChannel as Channel;
  }

  const channel = instance.subscribe(channelName) as Channel;

  // DEBUG: ver si nos suscribimos correctamente
  channel.bind("pusher:subscription_succeeded", () => {
    console.log(`[pusher] subscription succeeded to ${channelName}`);
  });

  channel.bind("pusher:subscription_error", (status: any) => {
    console.error(`[pusher] subscription error for ${channelName}`, status);
    // Si hay error de autenticación, reiniciar pusher
    if (status === 401 || status === 403) {
      console.error("[pusher] Authentication failed. Check your auth endpoint and token.");
    }
  });

  return channel;
}

export function disconnectPusher() {
  if (pusher) {
    try {
      pusher.disconnect();
    } catch (e) {
      console.warn("pusher disconnect error", e);
    } finally {
      pusher = null;
    }
  }
}
