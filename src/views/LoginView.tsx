"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../styles/login.css";
import { useRouter } from "next/navigation";
import {loginController} from "../controllers/loginController"

// Instalar fontawsome para los iconos
// npm install @fortawesome/fontawesome-free

import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginView = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState({
    correo: "",
    contrasena: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
                <label className="loginLabel">Correo electrónico</label>
                <input
                  type="text"
                  id="correo"
                  name="correo"
                  placeholder="Escribe tu correo electrónico..."
                  onChange={handleChange}
                  required
                  className="inputLogin w-full border border-gray-300 p-2 rounded mt-2"
                />
              </div>

              <div className="mb-4">
                <label className="loginLabel">Contraseña</label>
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="contrasena"
                  name="contrasena"
                  placeholder="Escribe tu contraseña"
                  onChange={handleChange}
                  required
                  className="inputLogin w-full border border-gray-300 p-2 rounded mt-2"
                />
                <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 mt-1"
                >
                  {showPassword ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>}
                </button>
                </div>
              </div>

              <div className="mb-4 flex items-center space-x-2">
                <input type="checkbox" id="remember" name="remember" className="divRememberButton"/>
                <label htmlFor="remember" className="divRemember">
                  Recordarme
                </label>
              </div>

              <div className="flex justify-center mb-4">
                <button
                  type="submit"
                  onClick={handleLogIn}
                  disabled={loading}
                  className="loginButton bg-blue-500 text-white py-2 px-4 focus:outline-none focus:shadow-outline"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>

              <p className="textLogin">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="loginLink text-blue-600 hover:underline">
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


