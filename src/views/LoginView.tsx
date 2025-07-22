"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../styles/login.css";
import { useRouter } from "next/navigation";
import {loginController} from "../controllers/loginController"
import elipseIzquierdo from "@/assets/ellipse-1148.svg";
import elipseDerecho from "@/assets/ellipse-1147.svg";
// Importar el controlador de login
import ilustracionCandado from "../assets/ilustracion-candado.svg"


// Instalar fontawsome para los iconos
// npm install @fortawesome/fontawesome-free

import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuthStore } from "@/store/auth";
import { useStore } from "zustand";

const LoginView = () => {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const globalError = useAuthStore(state => state.error);

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

    const parametersValidation = loginController(usuario)

    if (parametersValidation.error == true) {
      setError({error: true, type: parametersValidation.type, message: parametersValidation.message})
      setLoading(false)
      return
    }
    try {
      const loginValidation = await login(usuario.correo, usuario.contrasena);
      
      console.log(loginValidation)
      if (loginValidation.error) {
        console.log("errorr")
        setError({error: true, type: "contrasena", message: loginValidation.message || "Error al iniciar sesión"})
        setLoading(false);
      }
      else if (loginValidation) {
        console.log("prueba")
        router.push("/");
        setLoading(false);
        return
      }

    } catch (error) {
      console.log(error)
      return
    }
    const data = useStore(useAuthStore, (state) => state.accessToken)

  
      
  
  
}
  return (
    <>
      <Image alt="elipse" src={elipseIzquierdo} className="elipse-izquierdo" width={0} height={0}/>
      <Image alt="elipse" src={elipseDerecho} className="elipse-derecho" width={590} height={590}/>

      <div className="div-tamano px-4 flex justify-center items-center py-8 mx-64">
        <div className="w-full flex justify-between">
          <div className="w flex justify-center items-center">
            <Image alt="ilustración candado" src={ilustracionCandado}/>
          </div>

          <div className="">
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

              <div className="mb-4 flex items-center">
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
                  className="login-button --global-color-primary-500 text-white py-2 px-4 focus:outline-none focus:shadow-outline"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>

              <p className="text-login">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="login-link  hover:underline">
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


