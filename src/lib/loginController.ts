export function loginController(usuario) {

    if (!usuario.correo || !usuario.contrasena) {
      return {error: true, message: "Por favor, completa todos los campos", type: "contrasena"}
    }
    if (!usuario.correo.includes("@")) {
      return {error: true, message: "Por favor ingresa un correo válido", type: "correo"}
    }
    if (usuario.contrasena.length < 8) {
      return {error: true, message: "La contraseña debe tener al menos 8 carácteres", type: "contrasena"}
    }
    
    return true;
}
