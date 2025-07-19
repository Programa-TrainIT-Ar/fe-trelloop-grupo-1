"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../styles/login.css";
import { useRouter } from "next/navigation";
import {loginController} from "../controllers/loginController"
import elipseIzquierdo from "@/assets/images/ellipse-1148.svg";
import elipseDerecho from "@/assets/images/ellipse-1148.svg";
// Importar el controlador de login
import ilustracionCandado from "../assets/images/ilustracion-candado.svg"

// Instalar fontawsome para los iconos
// npm install @fortawesome/fontawesome-free

import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginView = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState({
    correo: "",
    contrasena: "",
  });

  const [error, setError] = useState({error: false, type: "", message: "" })
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
    setLoading(true);
    setError({error: false, message: "", type: ""});
    
    const loginValidation = await loginController(usuario)
    console.log(loginValidation)
    if (loginValidation.error = true) {
      setError({error: true, message: loginValidation.message, type: loginValidation.type})
      setLoading(false);
    }
    else {
      router.push("/");
      setLoading(false);
      
  }
}
  return (
    <>
      <Image alt="elipse" src={elipseIzquierdo} className="elipse-izquierdo" width={0} height={0}/>
      <Image alt="elipse" src={elipseDerecho} className="elipse-derecho" width={590} height={590}/>

      <div className="w-full max-w-6xl mx-auto px-4 py-8 mt-32">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-5/12 flex justify-center items-center">
            <Image alt="ilustración candado" src={ilustracionCandado}/>
          </div>

          <div className="w-full md:w-5/12">
            <form onSubmit={(event) => event.preventDefault()} className="tamano-form">
              <div className="mb-4">
                <label className="login-label">Correo electrónico</label>
                <input
                  type="text"
                  id="correo"
                  name="correo"
                  placeholder="Escribe tu correo electrónico..."
                  onChange={handleChange}
                  required
                  className="input-login w-full border border-gray-300 p-2 rounded mt-2"
                />
              {error.type == "correo" && <div className="text-red-700 pt-1">{error.message}</div>}

              </div>
              
              <div className="mb-4">
                <label className="login-label">Contraseña</label>
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="contrasena"
                  name="contrasena"
                  placeholder="Escribe tu contraseña"
                  onChange={handleChange}
                  required
                  className="input-login w-full border border-gray-300 p-2 rounded mt-2"
                />
                <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 mt-1"
                >
                  {showPassword ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>}
                </button>
                </div>
              {error.type == "contrasena" && <div className="text-red-700 pt-1">{error.message}</div>}

              </div>

              <div className="mb-4 flex items-center space-x-2">
                <input type="checkbox" id="remember" name="remember" className="div-remember-button"/>
                <label htmlFor="remember" className="div-remember">
                  Recordarme
                </label>
              </div>

              <div className="flex justify-center mb-4">
                <button
                  type="submit"
                  onClick={handleLogIn}
                  disabled={loading}
                  className="login-button bg-blue-500 text-white py-2 px-4 focus:outline-none focus:shadow-outline"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>

              <p className="text-login">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="login-link text-blue-600 hover:underline">
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


