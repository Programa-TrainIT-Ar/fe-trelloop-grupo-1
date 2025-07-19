import { registerService } from "@/services/registerService";

export async function registerController(usuario) {
    const { nombre, apellido, correo, contrasena, confirmacion } = usuario;

    if (!nombre || !apellido || !correo || !contrasena || !confirmacion ) {
        return { error: true, message: "Por favor, completa todos los campos", type: "form" };
    }
    if (!correo.includes("@")) {
        return { error: true, message: "Por favor ingresa un correo válido", type: "correo" };
    }
    if (contrasena.length < 8) {
        return { error: true, message: "La contraseña debe tener al menos 8 carácteres", type: "contrasena" };
    }
    if (contrasena !== confirmacion) {
        return { error: true, message: "Las contraseñas no coinciden", type: "contrasena" };
    }   

    return await registerService({
        nombre,
        apellido,
        correo,
        contrasena
    });


}