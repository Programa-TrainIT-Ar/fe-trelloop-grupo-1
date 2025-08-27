// lib/pusherClient.ts
import Pusher, { Channel } from "pusher-js";

let pusher: Pusher | null = null;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
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

  const token = getAccessToken() ?? "";
  if (!token) {
    console.warn("[pusher] No JWT accestoken found in localStorage; will not auth private channels");
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

  return pusher;
}

export function subscribeToUserChannel(userId: string) {
  const instance = initPusher();
  if (!instance) throw new Error("Pusher not initialized");

  const channelName = `private-user-${userId}`;
  const channel = instance.subscribe(channelName) as Channel;

  // DEBUG: ver si nos suscribimos correctamente
  channel.bind("pusher:subscription_succeeded", () => {
    console.log(`[pusher] subscription succeeded to ${channelName}`);
  });

  channel.bind("pusher:subscription_error", (status: any) => {
    console.error(`[pusher] subscription error for ${channelName}`, status);
  });

  // el evento real que usas es "notification"
  channel.bind("notification", (data: any) => {
    console.log("[pusher] received notification event", data);
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
