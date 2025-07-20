import { registerService } from "@/services/registerService";

interface UsuarioConConfirmacion {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;

}

interface RegisterServiceResponse {
    error: boolean;
    message: any;
    type?: string;
}

export async function registerController(usuario: UsuarioConConfirmacion) {
    const {firstName, lastName, email,  password, confirmPassword } = usuario;
     

    if (!firstName || !lastName || !email || !password || !confirmPassword ) {
        return { error: true, message: "Por favor, completa todos los campos", type: "form" };
    }
    if (!email.includes("@")) {
        return { error: true, message: "Por favor ingresa un correo válido", type: "email" };
    }
    if (password.length < 8) {
        return { error: true, message: "La contraseña debe tener al menos 8 caracteres", type: "password_length" };
    }
    if (password !== confirmPassword) {
    return { error: true, message: "Las contraseñas no coinciden", type: "password_mismatch" };
}
    console.log("Datos enviados:", {
        firstName,
        lastName,
        email,
        password
    });


    const response: RegisterServiceResponse = await registerService({
        firstName,
        lastName,
        email,
        password,
    });

    // Asegura que siempre haya un type
    if (response.error && !response.type) {
        return { ...response, type: "" };
    }
    return response;
}