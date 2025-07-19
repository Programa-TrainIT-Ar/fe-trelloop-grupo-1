"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import elipseIzquierdo from "@/assets/images/ellipse-1148.svg";
import elipseDerecho from "@/assets/images/ellipse-1147.svg";
import ilustracionUsuario from "../assets/images/ilustracion-usuario.svg";

import Swal from 'sweetalert2';
import { registerService, Usuario } from "@/services/registerService";
import "../styles/register.css";
import "../styles/globals.css";
import { registerController } from "@/controllers/registerController";

import { icon } from "@fortawesome/fontawesome-svg-core";

export default function RegisterView() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        confirmacion: "",
    });

    const [error, setError] = useState({ error: false, message: "", type: "" });
    const [mostrar, setMostrar] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev, [name]: value,
            }));
        }
    

    async function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
        e.preventDefault();
        const response = await registerController(formData);

        if (response.error) {
            setError({ error: true, message: response.message, type: response.type });
            return;
        }   else {
            Swal.fire({
                icon: "success",
                title: "Registro exitoso",
                text: "Ahora puedes iniciar sesión",
           }).then(() => {
                router.push("/login");
            });
        }
    }    

    return (
        <>
            <Image alt="elipse-izquierdo" src={elipseIzquierdo} className="elipse-izquierdo" width={0} height={0} />
            <Image alt="elipse-derecho" src={elipseDerecho} className="elipse-derecho" width={590} height={590} />

            <div className="w-full max-w-7xl mx-auto gap-4 px-8">
                <div className="flex flex-wrap justify-between">
                    <div className=" w-full md:w-5/12 flex items-center justify-center">
                        <Image src={ilustracionUsuario} alt="ilustración de usuario" />
                    </div>

                    <div className="w-full md:w-5/12">
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
                                {error.type === "correo" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
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
                                   
                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                    >
                                        {
                                            mostrar ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>
                                        }
                                    </button>
                                </div>
                                {error.type === "contrasena" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
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
                                   
                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                    >
                                        {
                                            mostrar ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>
                                        }
                                    </button>
                                </div>
                                {error.type === "contrasena" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2 rounded-xl text-white my-4"
                                    style={{ backgroundColor: "var(--global-color-primary-500)" }}
                                >
                                    REGISTRARME
                                </button>
                                <div className="text-register">
                                    <p>
                                        Al registrarme, acepto las <Link href="#" style={{ color: "var(--global-color-secondary-500)" }}>Condiciones del servicio </Link>, de Trainit y su <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Política de privacidad</Link>.
                                    </p>
                                    <p className="text-register text-center mt-3">
                                        ¿Ya tienes cuenta? <Link href="#" style={{ color: "var(--global-color-secondary-500)" }}>Inicia sesión</Link>
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

