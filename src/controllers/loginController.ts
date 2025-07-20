import { loginService } from "@/services/loginService"

export async function loginController(usuario) {
  if (!usuario.correo || !usuario.contrasena) {
    return { error: true, message: "Por favor, completa todos los campos" };
  }
  if (!usuario.correo.includes("@")) {
    return { error: true, message: "Correo electrónico inválido" };
  }

  return await loginService(usuario);
}
