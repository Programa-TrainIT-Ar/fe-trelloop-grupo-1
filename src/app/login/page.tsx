"use client";
import React, { useState } from "react";
import Image from "next/image";
import "./login.css";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState({
    correo: "",
    contrasena: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsuario({
      ...usuario,
      [event.target.name]: event.target.value,
    });
  }

  async function handleLogIn() {
    setError("");
    if (!usuario.correo || !usuario.contrasena) {
      setError("Por favor, completa todos los campos");
      return;
    }
    if (!usuario.correo.includes("@")) {
      setError("Correo electrónico inválido");
      return;
    }
    if (
      !usuario.contrasena.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
    ) {
      setError("Contraseña inválida");
      return;
    }

    setLoading(true);
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/login", {
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

      if (response.ok) {
        console.log("Login exitoso:", data);
        router.push("/dashboard");
      } else {
        // Login fallido
        // El backend envía { error: "Mensaje de error" }
        setError(data.error || "Error al iniciar sesión");
      }

      setLoading(false);
      return response.status === 200;
    } catch (error) {
      console.log("Error de conexión:", error);
      setError("Error al iniciar sesión, intenta de nuevo");
      setLoading(false);
      return false;
    }
  }
  return (
    <>
      <div className="container ">
        <div className="row d-flex justify-content-between">
          <div className="col-5 d-flex imagenLogIn">
            <Image
              src="https://www.freeiconspng.com/thumbs/gear-icon-png/white-gear-png-gear-icon-png-white-gear-icon-30.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </div>

          <div className="col-5 loginForm">
            <form onSubmit={(event) => event.preventDefault}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label>Correo electronico</label>
                <input
                  type="text"
                  className="form-control"
                  id="correo"
                  name="correo"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mt-3">
                <label>Contraseña</label>
                <input
                  className="form-control"
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mt-3">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
              <div className="row justify-content-center mt-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleLogIn}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Iniciar Sesion"}
                </button>
              </div>

              <p className="mt-3">
                No tienes una cuenta? <a href="/register">Registrate</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
