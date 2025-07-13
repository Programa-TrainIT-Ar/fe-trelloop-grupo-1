"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../styles/login.css";
import { useRouter } from "next/navigation";
import {loginController} from "../controllers/loginController"

const LoginView = () => {
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

  async function handleLogIn(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setError("");
    
    const loginValidation = loginController(usuario)
    console.log(loginValidation)
    setLoading(true);
    if (loginValidation.error = true) {
      setError(loginValidation.message)
      setLoading(false);
    }
    else {
      router.push("/");
      setLoading(false);
      
  }
}
  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-8 mt-32">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-5/12 flex justify-center items-center">
            <img
              src="https://www.freeiconspng.com/thumbs/gear-icon-png/white-gear-png-gear-icon-png-white-gear-icon-30.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </div>

          <div className="w-full md:w-5/12">
            <form onSubmit={(event) => event.preventDefault()}>
              {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

              <div className="mb-4">
                <label className="block mb-1 text-gray-700">Correo electrónico</label>
                <input
                  type="text"
                  id="correo"
                  name="correo"
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="mb-4 flex items-center space-x-2">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  Recordarme
                </label>
              </div>

              <div className="flex justify-center mb-4">
                <button
                  type="submit"
                  onClick={handleLogIn}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  Regístrate
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

    </>
  );
};

export default LoginView;
