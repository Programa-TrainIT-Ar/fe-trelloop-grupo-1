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

        const response = await fetch(process.env.BACKEND_URL || "http://localhost:5000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "no se pudo registrar el usuario" };

        }

        return { error: false, message: "" };
    } catch (error) {
        console.error("Error:", error);
        return { error: true, message: "Error de red o el servodor no responde" };
    }
}




