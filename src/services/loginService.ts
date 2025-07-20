// import { useAuthStore } from "@/store/useAuthStore";

import { useState } from 'react';
import { useAuthStore } from '../store/auth/store';
import { useRouter } from 'next/navigation';

export async function loginService(usuario) {

  const setUser=useAuthStore.getState().setUser;
  const setToken=useAuthStore.getState().setToken;

    try {
      const response = await fetch(process.env.BACKEND_URL || "http://localhost:5000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });
      const data = await response.json();
      console.log("Respuesta del servidor:", data); // Para depuración
      console.log("Código de estado:", response.status);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        return {error: true, message: data.error || "Credenciales incorrectas"}

      }
      else if (response.ok) {
        console.log(data.access_token)
        console.log("Login exitoso:", data);
        setToken(data.access_token);
        setUser(data.user);
        return {error: false}
      } else {
        // Login fallido
        // El backend envía { error: "Mensaje de error" }
        return {error: true, message: data.error || "Error al iniciar sesión"}
      }

    } catch (error) {
      console.log("Error de conexión:", error);
        return {error: true, message: "Error al iniciar sesión, intenta de nuevo"}

    }
}