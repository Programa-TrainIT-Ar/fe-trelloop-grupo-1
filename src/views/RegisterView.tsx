"use client";

import { useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import elipseIzquierdo from "@/assets/images/ellipse-1148.svg";
import elipseDerecho from "@/assets/images/ellipse-1147.svg";
import ilustracionUsuario from "../assets/images/ilustracion-usuario.svg";
import '@sweetalert2/theme-dark/dark.css';
import Swal from 'sweetalert2';
import { registerService } from "@/services/registerService";
import "../styles/register.css";
import "../styles/globals.css";
import { registerController } from "@/controllers/registerController";

export default function RegisterView() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        confirmacion: "",
    });

    const [errors, setErrors] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        confirmacion: "",
    });

    const [mostrar, setMostrar] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await registerController(formData);
        if (result.error) {
            Swal.fire("Error", result.message, "error");
        } else {
            Swal.fire("Éxito", "Usuario registrado correctamente", "success");
        }
    };

    return (
        <>
            <Image alt="elipse" src={elipseIzquierdo} className="elipse-izquierdo" width={0} height={0} />
            <Image alt="elipse" src={elipseDerecho} className="elipse-derecho" width={590} height={590} />

            <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-4 px-8">
                <div className="flex flex-wrap justify-between">
                    <div className=" w-full md:w-5/12 flex items-center justify-center">
                        <Image src={ilustracionUsuario} alt="ilustración de usuario" />
                    </div>

                    <div className="flex flex-col justify-center">
                        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="nombre" className="label-register">
                                    Nombres<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Escribe tus nombres"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="apellido" className="label-register">
                                    Apellidos<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Ecribe tus apellidos"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="correo" className="label-register">
                                    Correo electrónico<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Escribe tu correo electrónico"
                                    required
                                />
                                {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                            </div>
                            <div>
                                <label htmlFor="contrasena" className="label-register">
                                    Contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={mostrar ? "text" : "password"}
                                        id="contrasena"
                                        name="contrasena"
                                        value={formData.contrasena}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Escribe tu contraseña"
                                        required
                                    />
                                    {errors.contrasena && <p className="text-red-500 text-sm mt-1">{errors.contrasena}</p>}
                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <svg className="size-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmacion" className="label-register">
                                    Confirmación de contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={mostrar ? "text" : "password"}
                                        id="confirmacion"
                                        name="confirmacion"
                                        value={formData.confirmacion}
                                        onChange={handleChange}
                                        className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 sm:text-sm font-light"
                                        placeholder="Escribe tu confirmación"
                                        required
                                    />
                                    {errors.confirmacion && <p className="text-red-500 text-sm mt-1">{errors.confirmacion}</p>}
                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                    >
                                        <svg className="size-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2 rounded-xl text-white my-4"
                                    style={{ backgroundColor: "var(--global-color-primary-500)" }}
                                >
                                    REGISTRARME
                                </button>
                                <div className="text-center">
                                    <p className="text-sm">
                                        Al registrarme, acepto las <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Condiciones del servicio </Link>, de Trainit y su <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Política de privacidad</Link>.
                                    </p>
                                    <p className="text-sm mt-6">
                                        ¿Ya tienes cuenta? <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Inicia sesión</Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterView;