export interface Usuario {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}


export async function registerService(usuario: Usuario) {
    try {
        const payload = {
            firstName: usuario.firstName,
            lastName: usuario.lastName,
            email: usuario.email,
            password: usuario.password,
        };

       const API = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
});

        const data = await response.json();

        if (!response.ok) {
            // Si es error 409 (Conflict), probablemente es correo duplicado
            if (response.status === 409) {
                return { error: true, message: "El usuario ya existe", type: "email" };
            }
            return { error: true, message: data.message || "no se pudo registrar el usuario" };
        }

        return { error: false, message: "" };
    } catch (error) {
        console.error("Error:", error);
        return { error: true, message: "Error de red o el servodor no responde", type: "contrasena" };
    }
}




