// import { useAuthStore } from "@/store/useAuthStore";


export async function loginService(usuario) {

  // const setUser=useAuthStore.getState().setUser;
  // const setToken=useAuthStore.getState().setToken;

    try {
      const response = await fetch(process.env.BACKEND_URL + "/auth/login" || "http://localhost:5000/auth/login", {
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

      if (response.status == 404) {
        return {error: true, message: data.error || "Credenciales incorrectas", type: "contrasena"}

      }
      else if (response.ok) {
        console.log("Login exitoso:", data);
        // setToken(data.access_token);
        // setUser(data.user);
        localStorage.setItem("token", data.access_token)
        return {error: false, message: "", type: ""}
      } else {
        // Login fallido
        // El backend envía { error: "Mensaje de error" }
        return {error: true, message: data.error || "Error al iniciar sesión", type: "contrasena"}
      }

    } catch (error) {
      console.log("Error de conexión:", error);
        return {error: true, message: "Error al iniciar sesión, intenta de nuevo", type: "contrasena"}

    }
}